import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { config } from "dotenv";
import path from "path";

import { authRoutes } from "./routes/auth.routes";
import { chatRoutes } from "./routes/chat.routes";
import { azWithJesusRoutes } from "./routes/az-with-jesus";
import { livekitRoutes } from "./routes/livekit.routes";

config({ path: path.resolve(process.cwd(), ".env.local") });

export const app = new Hono();

app.use(
    "/*",
    cors({
        origin: (origin) => origin || "*",
        allowHeaders: ["Content-Type", "Authorization", "Upgrade-Insecure-Requests"],
        allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PUT"],
        credentials: true,
        exposeHeaders: ["Set-Cookie"]
    })
);

app.use("*", logger());
app.use("/assets/letters/audio/*", serveStatic({ root: "./" }));
app.use("/assets/letters/gifs/*", serveStatic({ root: "./" }));

app.get("/", (c) => c.json({ status: "online", database: "sqlite" }));

app.route("/api/auth", authRoutes);
app.route("/api/ai/chat", chatRoutes);
app.route("/api/ai/chat/az-with-jesus", azWithJesusRoutes);
app.route("/api/live-kit", livekitRoutes);

if (process.env.NODE_ENV !== "test") {
    const port = 3000;
    console.log(`Server is running on port ${port} | DB: SQLite`);

    serve({
        fetch: app.fetch,
        port,
        hostname: "0.0.0.0"
    });
}