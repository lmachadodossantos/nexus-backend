import type { ResponseCreateParams } from "openai/resources/responses/responses";

export type ResponseTool = NonNullable<ResponseCreateParams["tools"]>[number];

export const LITERACY_TOOLS: ResponseTool[] = [
    {
        type: "function",
        name: "send_letter_gif",
        description:
            "Envia o GIF animado da letra atual para o frontend. Use apenas quando a letra estiver sendo apresentada pela primeira vez no ciclo atual.",
        strict: true,
        parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
                letter: {
                    type: "string",
                    description: "Letra em maiúscula, como A, B, C."
                }
            },
            required: ["letter"]
        }
    },
    {
        type: "function",
        name: "send_letter_audio",
        description:
            "Envia o áudio do som da letra atual para o frontend. Use apenas quando a letra estiver sendo apresentada pela primeira vez no ciclo atual.",
        strict: true,
        parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
                letter: {
                    type: "string",
                    description: "Letra em maiúscula, como A, B, C."
                }
            },
            required: ["letter"]
        }
    }
];