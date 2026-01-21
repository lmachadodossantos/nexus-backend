import OpenAI from "openai";
import { config } from "dotenv";

config();

if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠️ AVISO: OPENAI_API_KEY não encontrada no .env.local do servidor!");
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generateChatResponse = async (messages: any[]) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
                {
                    role: "system",
                    content: "Você é um professor de inglês nativo, paciente e encorajador chamado 'Coach'. Seu objetivo é ajudar o aluno a praticar conversação. Corrija erros sutilmente, mas priorize a fluência. Mantenha as respostas curtas e engajadoras (máximo 2 frases)."
                },
                ...messages
            ],
        });

        return completion.choices[0].message;
    } catch (error) {
        console.error("Erro na OpenAI:", error);
        throw new Error("Falha ao gerar resposta da IA");
    }
};