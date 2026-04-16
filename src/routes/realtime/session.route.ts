import { Hono } from "hono";
import { auth } from "@/auth";
import { REALTIME_AGENTS } from "@/ai/realtime/realtime-config";

export const realtimeSessionRoute = new Hono();

realtimeSessionRoute.post("/", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.header() });

    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const { agent = "storyteller" } = await c.req.json().catch(() => ({}));

    const agentConfig = REALTIME_AGENTS[agent] ?? REALTIME_AGENTS.storyteller;

    const openaiRes = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(agentConfig)
    });

    if (!openaiRes.ok) {
        const error = await openaiRes.text();
        console.error("[realtime/session] OpenAI error:", error);
        return c.json({ error: "Falha ao criar sessão realtime" }, 502);
    }

    const data = await openaiRes.json() as { client_secret: unknown };

    return c.json({ client_secret: data.client_secret });
});
