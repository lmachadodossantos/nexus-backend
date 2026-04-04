export interface SSEEvent {
    event: string;
    data: any;
}

export async function readSSE(response: Response): Promise<SSEEvent[]> {
    if (!response.body) {
        throw new Error("Response sem body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let fullText = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
    }

    const blocks = fullText
        .split("\n\n")
        .map((block) => block.trim())
        .filter(Boolean);

    return blocks.map((block) => {
        const lines = block.split("\n");
        const eventLine = lines.find((line) => line.startsWith("event: "));
        const dataLine = lines.find((line) => line.startsWith("data: "));

        return {
            event: eventLine?.replace("event: ", "") || "",
            data: dataLine ? JSON.parse(dataLine.replace("data: ", "")) : null
        };
    });
}