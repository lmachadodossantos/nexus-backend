import {serve} from '@hono/node-server'
import {Hono} from 'hono'
import {logger} from 'hono/logger'
import {cors} from 'hono/cors'
import {auth} from './auth'
import {generateChatResponse} from './ai';
import {processLiteracyToolCalls} from './utils/letterResources';
import {AccessToken} from 'livekit-server-sdk';
import {config} from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), '.env.local') });

interface TokenRequestBody {
    roomName?: string;
    participantIdentity?: string;
}

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
    const { messages, agent } = body;

    if (!messages || !Array.isArray(messages)) {
        return c.json({ error: "Formato de mensagens inválido" }, 400);
    }

    try {
        const aiResponse = await generateChatResponse(messages, agent);

        const response: any = {
            message: aiResponse
        };

        if (agent === 'literacy' && aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
            response.resources = processLiteracyToolCalls(aiResponse.tool_calls);
        }

        return c.json(response);
    } catch (error) {
        return c.json({ error: "Erro ao processar IA" }, 500);
    }
});

app.all('/api/live-kit/getToken', async (c) => {
    let body: TokenRequestBody = {};
    try {
        body = await c.req.json<TokenRequestBody>();
    } catch (e) {
        console.warn("Body vazio ou inválido, usando padrões.");
    }

    const roomName = body.roomName || 'quickstart-room';

    const participantIdentity = body.participantIdentity || `user_${Math.floor(Math.random() * 10000)}`;

    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
        identity: participantIdentity,
        ttl: '10m',
    });

    at.addGrant({ roomJoin: true, room: roomName });

    return c.json({
        serverURL: process.env.LIVEKIT_URL,
        participantToken: await at.toJwt()
    });
});


const port = 3000
console.log(`Server is running on port ${port} | DB: SQLite`)

serve({
    fetch: app.fetch,
    port,
    hostname: '0.0.0.0'
})