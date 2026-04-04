import { z } from "zod";

export const literacyStepSchema = z.enum([
    "abertura",
    "som",
    "palavras",
    "frase",
    "mini_exercicio",
    "encerramento"
]);

export type LiteracyStep = z.infer<typeof literacyStepSchema>;

export const literacyContextInputSchema = z.object({
    letter: z.string().max(1).optional(),
    currentStep: literacyStepSchema.optional(),
    gifSent: z.boolean().optional(),
    audioSent: z.boolean().optional()
});

export type LiteracyContextInput = z.infer<typeof literacyContextInputSchema>;

export const chatMessageSchema = z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const aiChatRequestSchema = z.object({
    agent: z.string().optional(),
    messages: z.array(chatMessageSchema),
    literacyContext: literacyContextInputSchema.optional()
});

export type AIChatRequest = z.infer<typeof aiChatRequestSchema>;

export const literacyAssistantPayloadSchema = z.object({
    text: z.string().min(1),
    step: literacyStepSchema,
    suggestedNextStep: literacyStepSchema,
    shouldRepeatCurrentStep: z.boolean(),
    encouragement: z.string().optional()
});

export type LiteracyAssistantPayload = z.infer<typeof literacyAssistantPayloadSchema>;

export const processedResourceSchema = z.object({
    type: z.enum(["gif", "audio"]),
    letter: z.string().min(1).max(1),
    url: z.string().min(1)
});

export type ProcessedResource = z.infer<typeof processedResourceSchema>;