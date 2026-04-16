import { LiteracyContextInput, LiteracyStep } from "@/ai/az_with_jesus/literacy-schemas";
import { getLetterConfig } from "@/ai/az_with_jesus/literacy-map";

export function buildLiteracyContext(input: LiteracyContextInput) {
    const cfg = getLetterConfig(input.letter ?? "A");

    return {
        letter: cfg.letter,
        biblicalReference: cfg.reference,
        supportWords: cfg.supportWords,
        currentStep: input.currentStep || "abertura",
        gifSent: Boolean(input.gifSent),
        audioSent: Boolean(input.audioSent)
    };
}

const STEP_GIF_VARIANT: Partial<Record<LiteracyStep, string>> = {
    bastao_maiuscula: "UPPERCASE_PRINT",
    bastao_minuscula: "LOWERCASE_PRINT",
    cursiva_maiuscula: "UPPERCASE_CURSIVE",
    cursiva_minuscula: "LOWERCASE_CURSIVE"
};

const STEP_INSTRUCTIONS: Record<LiteracyStep, string> = {
    abertura: "Apresente a letra conectando ao nome bíblico. Pergunte se a criança lembra do personagem.",
    som: "Ensine o som da letra de forma prolongada. Chame send_letter_audio. Peça para a criança repetir o som.",
    palavras: "Mostre palavras que começam com a letra. Faça uma pergunta de identificação (qual palavra começa com o som?).",
    aquecimento: "Faça o aquecimento das mãos antes de escrever (abre e fecha, gira punhos, desenha a letra no ar).",
    bastao_maiuscula: "Ensine a letra BASTÃO MAIÚSCULA. Explique o movimento passo a passo. Chame send_letter_gif com variant=UPPERCASE_PRINT (se gif_enviado for falso).",
    bastao_minuscula: "Ensine a letra BASTÃO MINÚSCULA. Explique o movimento passo a passo. Chame send_letter_gif com variant=LOWERCASE_PRINT (se gif_enviado for falso).",
    cursiva_maiuscula: "Ensine a letra CURSIVA MAIÚSCULA. Explique o movimento passo a passo. Chame send_letter_gif com variant=UPPERCASE_CURSIVE (se gif_enviado for falso).",
    cursiva_minuscula: "Ensine a letra CURSIVA MINÚSCULA. Explique o movimento passo a passo. Chame send_letter_gif com variant=LOWERCASE_CURSIVE (se gif_enviado for falso).",
    desafio: "Faça o desafio final: apresente 3 palavras e pergunte qual começa com a letra. Aguarde resposta.",
    encerramento: "Encerre a aula com encorajamento. Recapitule o som e as formas da letra. Celebre o esforço da criança."
};

export function buildLiteracyContextText(ctx: ReturnType<typeof buildLiteracyContext>) {
    const gifVariant = STEP_GIF_VARIANT[ctx.currentStep];
    const instruction = STEP_INSTRUCTIONS[ctx.currentStep];

    return [
        "CONTEXTO ATUAL DA AULA:",
        `- letra: ${ctx.letter}`,
        `- referencia_biblica: ${ctx.biblicalReference}`,
        `- palavras_apoio: ${ctx.supportWords.join(", ")}`,
        `- etapa_atual: ${ctx.currentStep}`,
        `- gif_enviado: ${ctx.gifSent ? "sim" : "nao"}`,
        `- audio_enviado: ${ctx.audioSent ? "sim" : "nao"}`,
        gifVariant ? `- variante_gif_desta_etapa: ${gifVariant}` : null,
        ``,
        `INSTRUÇÃO PARA ESTA ETAPA:`,
        instruction
    ].filter(Boolean).join("\n");
}

export function getNextLiteracyStep(step: LiteracyStep): LiteracyStep {
    switch (step) {
        case "abertura":
            return "som";
        case "som":
            return "palavras";
        case "palavras":
            return "aquecimento";
        case "aquecimento":
            return "bastao_maiuscula";
        case "bastao_maiuscula":
            return "bastao_minuscula";
        case "bastao_minuscula":
            return "cursiva_maiuscula";
        case "cursiva_maiuscula":
            return "cursiva_minuscula";
        case "cursiva_minuscula":
            return "desafio";
        case "desafio":
            return "encerramento";
        default:
            return "encerramento";
    }
}