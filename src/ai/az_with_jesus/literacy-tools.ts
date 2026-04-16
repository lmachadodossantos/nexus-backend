import type { ResponseCreateParams } from "openai/resources/responses/responses";

export type ResponseTool = NonNullable<ResponseCreateParams["tools"]>[number];

export const GIF_VARIANTS = ["UPPERCASE_PRINT", "LOWERCASE_PRINT", "UPPERCASE_CURSIVE", "LOWERCASE_CURSIVE"] as const;
export type GifVariant = typeof GIF_VARIANTS[number];

export const LITERACY_TOOLS: ResponseTool[] = [
    {
        type: "function",
        name: "send_letter_gif",
        description:
            "Envia o GIF animado de escrita da letra para o frontend. Use no início de cada etapa de escrita (bastao_maiuscula, bastao_minuscula, cursiva_maiuscula, cursiva_minuscula), apenas se gif_enviado for falso. Cada etapa tem sua própria variante: bastao_maiuscula → UPPERCASE_PRINT, bastao_minuscula → LOWERCASE_PRINT, cursiva_maiuscula → UPPERCASE_CURSIVE, cursiva_minuscula → LOWERCASE_CURSIVE.",
        strict: true,
        parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
                letter: {
                    type: "string",
                    description: "Letra em maiúscula, como A, B, C."
                },
                variant: {
                    type: "string",
                    enum: ["UPPERCASE_PRINT", "LOWERCASE_PRINT", "UPPERCASE_CURSIVE", "LOWERCASE_CURSIVE"],
                    description: "Variante do GIF: UPPERCASE_PRINT (bastão maiúscula), LOWERCASE_PRINT (bastão minúscula), UPPERCASE_CURSIVE (cursiva maiúscula), LOWERCASE_CURSIVE (cursiva minúscula)."
                }
            },
            required: ["letter", "variant"]
        }
    },
    {
        type: "function",
        name: "send_letter_audio",
        description:
            "Envia o áudio do som da letra para o frontend. Use APENAS na etapa 'som', para a criança ouvir e repetir o som da letra. Não use em outras etapas.",
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