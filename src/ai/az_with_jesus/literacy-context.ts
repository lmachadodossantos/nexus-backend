import { LiteracyContextInput, LiteracyStep } from "./literacy-schemas";
import { getLetterConfig } from "./literacy-map";

export function buildLiteracyContext(input: LiteracyContextInput) {
    const cfg = getLetterConfig(input.letter);

    return {
        letter: cfg.letter,
        biblicalReference: cfg.reference,
        supportWords: cfg.supportWords,
        currentStep: input.currentStep || "abertura",
        gifSent: Boolean(input.gifSent),
        audioSent: Boolean(input.audioSent)
    };
}

export function buildLiteracyContextText(ctx: ReturnType<typeof buildLiteracyContext>) {
    return [
        "CONTEXTO ATUAL DA AULA:",
        `- letra: ${ctx.letter}`,
        `- referencia_biblica: ${ctx.biblicalReference}`,
        `- palavras_apoio: ${ctx.supportWords.join(", ")}`,
        `- etapa_atual: ${ctx.currentStep}`,
        `- gif_enviado: ${ctx.gifSent ? "sim" : "nao"}`,
        `- audio_enviado: ${ctx.audioSent ? "sim" : "nao"}`
    ].join("\n");
}

export function getNextLiteracyStep(step: LiteracyStep): LiteracyStep {
    switch (step) {
        case "abertura":
            return "som";
        case "som":
            return "palavras";
        case "palavras":
            return "frase";
        case "frase":
            return "mini_exercicio";
        case "mini_exercicio":
            return "encerramento";
        default:
            return "encerramento";
    }
}