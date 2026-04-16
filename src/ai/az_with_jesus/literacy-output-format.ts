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
                enum: ["abertura", "som", "palavras", "aquecimento", "bastao_maiuscula", "bastao_minuscula", "cursiva_maiuscula", "cursiva_minuscula", "desafio", "encerramento"]
            },
            suggestedNextStep: {
                type: "string",
                enum: ["abertura", "som", "palavras", "aquecimento", "bastao_maiuscula", "bastao_minuscula", "cursiva_maiuscula", "cursiva_minuscula", "desafio", "encerramento"]
            },
            shouldRepeatCurrentStep: { type: "boolean" },
        },
        required: ["text", "step", "suggestedNextStep", "shouldRepeatCurrentStep"]
    }
} as const;