import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { auth } from './auth'
import { generateChatResponse } from './ai';

const app = new Hono()

app.use('/*', cors({
    origin: (origin) => origin || '*',
    allowHeaders: ['Content-Type', 'Authorization', 'Upgrade-Insecure-Requests'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'DELETE', 'PUT'],
    credentials: true,
    exposeHeaders: ['Set-Cookie'],
}))

app.use('*', logger())

app.get('/', (c) => c.json({ status: 'online', database: 'sqlite' }))

app.on(['POST', 'GET'], '/api/auth/**', (c) => {
    return auth.handler(c.req.raw);
})

app.post('/api/ai/chat', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.header() });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
        return c.json({ error: "Formato de mensagens inválido" }, 400);
    }

    try {
        const aiResponse = await generateChatResponse(messages);
        return c.json({ message: aiResponse });
    } catch (error) {
        return c.json({ error: "Erro ao processar IA" }, 500);
    }
});


const port = 3000
console.log(`Server is running on port ${port} | DB: SQLite`)

serve({
    fetch: app.fetch,
    port,
    hostname: '0.0.0.0'
})