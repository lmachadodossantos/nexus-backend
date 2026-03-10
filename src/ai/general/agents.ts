import { openai } from "../openai";

interface AgentTools {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: any;
    };
}

interface AgentConfig {
    prompt: string;
    tools?: AgentTools[];
}

const AGENT_CONFIGS: Record<string, AgentConfig> = {
    grammar: {
        prompt: `Você é o "Grammar Mentor", um tutor especializado em ensinar inglês de forma clara e didática.
- Explica gramática de forma simples, usando metáforas e exemplos
- Usa emojis ocasionalmente (🕒, ⏳, ✅, ❌, 💡)
- Responde em português, exemplos em inglês
- Mantém respostas concisas (máximo 3-4 parágrafos)`
    },

    conversation: {
        prompt: `Você é um professor de inglês nativo, paciente e encorajador chamado 'Coach'.
Seu objetivo é ajudar o aluno a praticar conversação.
Corrija erros sutilmente, mas priorize a fluência.
Mantenha as respostas curtas e engajadoras (máximo 2 frases).`
    },

    roleplay: {
        prompt: `Você é um ator de roleplay para prática de inglês.
Assuma personagens em cenários do dia a dia.
Mantenha-se no personagem e use linguagem natural.`
    }
};

export const generateChatResponse = async (messages: any[], agent: string = 'conversation') => {
    try {
        const agentConfig = AGENT_CONFIGS[agent] || AGENT_CONFIGS.conversation;
        const systemPrompt = agentConfig.prompt;

        const completionParams: any = {
            model: "gpt-5-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
        };

        if (agentConfig.tools && agentConfig.tools.length > 0) {
            completionParams.tools = agentConfig.tools;
            completionParams.tool_choice = "auto";
        }

        const completion = await openai.chat.completions.create(completionParams);

        return completion.choices[0].message;
    } catch (error) {
        console.error("Erro na OpenAI:", error);
        throw new Error("Falha ao gerar resposta da IA");
    }
};