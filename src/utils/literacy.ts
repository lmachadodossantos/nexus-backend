import { literacyAssistantPayloadSchema, type LiteracyStep } from "@/ai/az_with_jesus/literacy-schemas";
import { getNextLiteracyStep } from "@/ai/az_with_jesus/literacy-context";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });
export function sseEvent(event: string, data: unknown) {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function normalizeLetter(letter: string) {
    return (letter || "").trim().toUpperCase().slice(0, 1);
}

export function buildGifUrl(letter: string, variant: string) {
    return process.env.URL_FILES + `/assets/letters/gifs/${letter}_${variant}.gif`;
}

export function buildAudioUrl(letter: string) {
    return process.env.URL_FILES + `/assets/letters/audios/${letter}.mp3`;
}

export function safeJsonParse<T = unknown>(value: string): T | null {
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

export type FinalLiteracyPayload = {
    text: string;
    step: LiteracyStep;
    suggestedNextStep: LiteracyStep;
    shouldRepeatCurrentStep: boolean;
    encouragement?: string;
};

export function extractFinalPayload(response: unknown, fallbackStep: LiteracyStep): FinalLiteracyPayload {
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
        id?: string;
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

export function isFunctionCallItem(
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