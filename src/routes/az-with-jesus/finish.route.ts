import { Hono } from "hono";
import { auth } from "@/auth";
import { SessionsRepository } from "@/repositories/az_with_jesus/sessions.repository";

const sessionsRepository = new SessionsRepository();

export const finishRoute = new Hono();

finishRoute.post("/", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.header() });

    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        const body = await c.req.json();
        const sessionId = Number(body.sessionId);
        const summary = typeof body.summary === "string" ? body.summary : null;

        if (!sessionId) {
            return c.json({ error: "sessionId é obrigatório" }, 400);
        }

        await sessionsRepository.finish(sessionId, summary);

        return c.json({ ok: true });
    } catch (error) {
        console.error("Erro ao finalizar sessão:", error);
        return c.json({ error: "Erro ao finalizar sessão" }, 500);
    }
});