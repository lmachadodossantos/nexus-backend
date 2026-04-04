import { Hono } from "hono";
import { AccessToken } from "livekit-server-sdk";

interface TokenRequestBody {
    roomName?: string;
    participantIdentity?: string;
}

export const livekitRoutes = new Hono();

livekitRoutes.all("/getToken", async (c) => {
    let body: TokenRequestBody = {};
    try {
        body = await c.req.json<TokenRequestBody>();
    } catch {
        console.warn("Body vazio ou inválido, usando padrões.");
    }

    const roomName = body.roomName || "quickstart-room";
    const participantIdentity =
        body.participantIdentity || `user_${Math.floor(Math.random() * 10000)}`;

    const at = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        {
            identity: participantIdentity,
            ttl: "10m"
        }
    );

    at.addGrant({ roomJoin: true, room: roomName });

    return c.json({
        serverURL: process.env.LIVEKIT_URL,
        participantToken: await at.toJwt()
    });
});