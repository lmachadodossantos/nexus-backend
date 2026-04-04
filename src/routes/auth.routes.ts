import { Hono } from "hono";
import { auth } from "@/auth";

export const authRoutes = new Hono();

authRoutes.on(["POST", "GET"], "/**", (c) => {
    return auth.handler(c.req.raw);
});