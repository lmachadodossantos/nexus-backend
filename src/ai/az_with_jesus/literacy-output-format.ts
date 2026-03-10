export const literacyStructuredOutputFormat = {
    type: "json_schema",
    name: "literacy_assistant_payload",
    strict: true,
    schema: {
        type: "object",
        additionalProperties: false,
        properties: {
            text: { type: "string" },
            step: {
                type: "string",
                enum: ["abertura", "som", "palavras", "frase", "mini_exercicio", "encerramento"]
            },
            suggestedNextStep: {
                type: "string",
                enum: ["abertura", "som", "palavras", "frase", "mini_exercicio", "encerramento"]
            },
            shouldRepeatCurrentStep: { type: "boolean" },
            encouragement: { type: "string" }
        },
        required: ["text", "step", "suggestedNextStep", "shouldRepeatCurrentStep"]
    }
} as const;