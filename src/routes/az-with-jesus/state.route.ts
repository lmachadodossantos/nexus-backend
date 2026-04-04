import { Hono } from "hono";
import { auth } from "@/auth";
import { LiteracyMemoryService } from "@/services/az_with_jesus/memory.service";

const memoryService = new LiteracyMemoryService();

export const stateRoute = new Hono();

stateRoute.get("/", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.header() });

    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        const studentId = session.user.id;
        const state = await memoryService.getFullState(studentId);
        return c.json(state);
    } catch (error) {
        console.error("Erro ao buscar estado de alfabetização:", error);
        return c.json({ error: "Erro ao carregar estado de alfabetização" }, 500);
    }
});