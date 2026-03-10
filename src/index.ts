import { openai } from "./ai/openai";
import type { ResponseInput } from "openai/resources/responses/responses";
import { AGENT_CONFIGS } from "./ai/agents";
import {
    aiChatRequestSchema,
    literacyAssistantPayloadSchema,
    type LiteracyStep
} from "./ai/literacy-schemas";
import {
    buildLiteracyContext,
    buildLiteracyContextText,
    getNextLiteracyStep
} from "./ai/literacy-context";
import { literacyStructuredOutputFormat } from "./ai/literacy-output-format";

import {serve} from '@hono/node-server'
import {serveStatic} from '@hono/node-server/serve-static'
import {Hono} from 'hono'
import {logger} from 'hono/logger'
import {cors} from 'hono/cors'
import {auth} from './auth'
import {AccessToken} from 'livekit-server-sdk';
import {config} from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), '.env.local') });

interface TokenRequestBody {
    roomName?: string;
    participantIdentity?: string;
}

const app = new Hono()

function sseEvent(event: string, data: unknown) {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function normalizeLetter(letter: string) {
    return (letter || "").trim().toUpperCase().slice(0, 1);
}

function buildGifUrl(letter: string) {
    return `/assets/letters/gifs/${letter}.gif`;
}

function buildAudioUrl(letter: string) {
    return `/assets/letters/audios/${letter}.mp3`;
}

function safeJsonParse<T = unknown>(value: string): T | null {
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

type FinalLiteracyPayload = {
    text: string;
    step: LiteracyStep;
    suggestedNextStep: LiteracyStep;
    shouldRepeatCurrentStep: boolean;
    encouragement?: string;
};

function extractFinalPayload(
    response: unknown,
    fallbackStep: LiteracyStep
): FinalLiteracyPayload {
    const fallback: FinalLiteracyPayload = {
        text: "Vamos aprender juntos. Você quer tentar mais uma vez?",
        step: fallbackStep,
        suggestedNextStep: getNextLiteracyStep(fallbackStep),
        shouldRepeatCurrentStep: false
    };

    if (!response || typeof response !== "object") {
        return fallback;
    }

    const maybeResponse = response as {
        output?: Array<{
            type?: string;
            content?: Array<{
                type?: string;
                parsed?: unknown;
                text?: string;
            }>;
        }>;
    };

    for (const item of maybeResponse.output ?? []) {
        if (item.type !== "message") continue;

        for (const content of item.content ?? []) {
            if (content.type === "output_text" && content.parsed) {
                const parsed = literacyAssistantPayloadSchema.safeParse(content.parsed);
                if (parsed.success) return parsed.data;
            }

            if (content.type === "output_text" && typeof content.text === "string") {
                const json = safeJsonParse(content.text);
                const parsed = literacyAssistantPayloadSchema.safeParse(json);
                if (parsed.success) return parsed.data;
            }
        }
    }

    return fallback;
}

function isFunctionCallItem(
    item: unknown
): item is {
    type: "function_call";
    name: string;
    call_id: string;
    arguments: string;
} {
    if (!item || typeof item !== "object") return false;

    const obj = item as Record<string, unknown>;

    return (
        obj.type === "function_call" &&
        typeof obj.name === "string" &&
        typeof obj.call_id === "string" &&
        typeof obj.arguments === "string"
    );
}

app.use('/*', cors({
    origin: (origin) => origin || '*',
    allowHeaders: ['Content-Type', 'Authorization', 'Upgrade-Insecure-Requests'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'DELETE', 'PUT'],
    credentials: true,
    exposeHeaders: ['Set-Cookie'],
}))

app.use('*', logger())

app.use('/assets/letters/audio/*', serveStatic({ root: './' }))
app.use('/assets/letters/gifs/*', serveStatic({ root: './' }))

app.get('/', (c) => c.json({ status: 'online', database: 'sqlite' }))

app.on(['POST', 'GET'], '/api/auth/**', (c) => {
    return auth.handler(c.req.raw);
});

app.post("/api/ai/chat/stream", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.header() });

    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const parsed = aiChatRequestSchema.safeParse(body);

    if (!parsed.success) {
        return c.json(
            {
                error: "Payload inválido",
                details: parsed.error.flatten()
            },
            400
        );
    }

    const { messages, agent = "literacy", literacyContext } = parsed.data;
    const agentConfig = AGENT_CONFIGS[agent] || AGENT_CONFIGS.literacy;

    return new Response(
        new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                const send = (event: string, data: unknown) => {
                    controller.enqueue(encoder.encode(sseEvent(event, data)));
                };

                try {
                    let fallbackStep: LiteracyStep = "abertura";

                    const baseInput: Array<{
                        role: "developer" | "user" | "assistant";
                        content: Array<{ type: "input_text"; text: string }>;
                    }> = [
                        {
                            role: "developer",
                            content: [{ type: "input_text", text: agentConfig.instructions }]
                        }
                    ];

                    if (agent === "literacy" && literacyContext?.letter) {
                        const ctx = buildLiteracyContext(literacyContext);
                        fallbackStep = ctx.currentStep;

                        baseInput.push({
                            role: "developer",
                            content: [{ type: "input_text", text: buildLiteracyContextText(ctx) }]
                        });
                    }

                    for (const message of messages) {
                        baseInput.push({
                            role: message.role,
                            content: [{ type: "input_text", text: message.content }]
                        });
                    }

                    let previousResponseId: string | undefined = undefined;
                    let nextInput: ResponseInput = baseInput as ResponseInput;
                    let finalResponse: unknown = null;

                    while (true) {
                        const pendingToolCalls: Array<{
                            type: "function_call";
                            name: string;
                            call_id: string;
                            arguments: string;
                        }> = [];

                        const stream = await openai.responses.create({
                            model: "gpt-5-mini",
                            input: nextInput,
                            previous_response_id: previousResponseId,
                            tools: agentConfig.tools,
                            text:
                                agent === "literacy"
                                    ? { format: literacyStructuredOutputFormat }
                                    : undefined,
                            stream: true,
                            store: false
                        });

                        finalResponse = null;

                        for await (const event of stream) {
                            if (event.type === "response.output_text.delta") {
                                send("text_delta", { delta: event.delta });
                                continue;
                            }

                            if (event.type === "response.output_item.added") {
                                const item = event.item;
                                if (isFunctionCallItem(item)) {
                                    pendingToolCalls.push(item);
                                }
                                continue;
                            }

                            if (event.type === "response.completed") {
                                finalResponse = event.response;
                                continue;
                            }

                            if (event.type === "error") {
                                send("error", {
                                    message: event.message || "Erro no streaming"
                                });
                            }
                        }

                        if (!pendingToolCalls.length) {
                            break;
                        }

                        if (
                            !finalResponse ||
                            typeof finalResponse !== "object" ||
                            !("id" in finalResponse) ||
                            typeof (finalResponse as { id?: unknown }).id !== "string"
                        ) {
                            throw new Error("Resposta final não encontrada antes do tool loop.");
                        }

                        const toolOutputs: Array<{
                            type: "function_call_output";
                            call_id: string;
                            output: string;
                        }> = [];

                        for (const call of pendingToolCalls) {
                            const args =
                                safeJsonParse<{ letter?: string }>(call.arguments || "{}") || {};

                            const letter = normalizeLetter(
                                args.letter || literacyContext?.letter || "A"
                            );

                            if (call.name === "send_letter_gif") {
                                const resource = {
                                    type: "gif" as const,
                                    letter,
                                    url: buildGifUrl(letter)
                                };

                                send("resource", resource);

                                toolOutputs.push({
                                    type: "function_call_output",
                                    call_id: call.call_id,
                                    output: JSON.stringify({
                                        success: true,
                                        ...resource
                                    })
                                });
                            }

                            if (call.name === "send_letter_audio") {
                                const resource = {
                                    type: "audio" as const,
                                    letter,
                                    url: buildAudioUrl(letter)
                                };

                                send("resource", resource);

                                toolOutputs.push({
                                    type: "function_call_output",
                                    call_id: call.call_id,
                                    output: JSON.stringify({
                                        success: true,
                                        ...resource
                                    })
                                });
                            }
                        }

                        previousResponseId = (finalResponse as { id: string }).id;
                        nextInput = toolOutputs as ResponseInput;
                    }

                    const payload = extractFinalPayload(finalResponse, fallbackStep);

                    send("final_payload", payload);
                    send("done", { ok: true });

                    controller.close();
                } catch (error) {
                    const message =
                        error instanceof Error ? error.message : "Erro interno";

                    send("error", { message });
                    controller.close();
                }
            }
        }),
        {
            headers: {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive"
            }
        }
    );
});

app.all('/api/live-kit/getToken', async (c) => {
    let body: TokenRequestBody = {};
    try {
        body = await c.req.json<TokenRequestBody>();
    } catch (e) {
        console.warn("Body vazio ou inválido, usando padrões.");
    }

    const roomName = body.roomName || 'quickstart-room';

    const participantIdentity = body.participantIdentity || `user_${Math.floor(Math.random() * 10000)}`;

    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
        identity: participantIdentity,
        ttl: '10m',
    });

    at.addGrant({ roomJoin: true, room: roomName });

    return c.json({
        serverURL: process.env.LIVEKIT_URL,
        participantToken: await at.toJwt()
    });
});


const port = 3000
console.log(`Server is running on port ${port} | DB: SQLite`)

serve({
    fetch: app.fetch,
    port,
    hostname: '0.0.0.0'
})