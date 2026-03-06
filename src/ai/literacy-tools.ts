export interface AgentTool {
    type: "function";
    name: string;
    description: string;
    strict?: boolean;
    parameters: any;
}

export const LITERACY_TOOLS: AgentTool[] = [
    {
        type: "function",
        name: "send_letter_gif",
        description: "Envia o GIF animado da letra atual para o frontend. Use apenas quando a letra estiver sendo apresentada pela primeira vez no ciclo atual.",
        strict: true,
        parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
                letter: { type: "string" }
            },
            required: ["letter"]
        }
    },
    {
        type: "function",
        name: "send_letter_audio",
        description: "Envia o áudio do som da letra atual para o frontend. Use apenas quando a letra estiver sendo apresentada pela primeira vez no ciclo atual.",
        strict: true,
        parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
                letter: { type: "string" }
            },
            required: ["letter"]
        }
    }
];