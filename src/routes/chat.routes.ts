import { Hono } from "hono";
import { auth } from "@/auth";
import { generateChatResponse } from "@/ai/general/agents";

export const chatRoutes = new Hono();

chatRoutes.post("/", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.header() });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { messages, agent } = body;

    if (!messages || !Array.isArray(messages)) {
        return c.json({ error: "Formato de mensagens inválido" }, 400);
    }

    try {
        const aiResponse = await generateChatResponse(messages, agent);
        return c.json({ message: aiResponse });
    } catch {
        return c.json({ error: "Erro ao processar IA" }, 500);
    }
});