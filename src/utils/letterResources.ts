import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), '.env.local') });

export interface LetterResources {
    gif?: string;
    audio?: string;
}

export function getLetterResources(letter: string): LetterResources {
    const upperLetter = letter.toUpperCase();

    return {
        gif: process.env.URL_FILES + `/assets/letters/gifs/${upperLetter}.gif`,
        audio: process.env.URL_FILES + `/assets/letters/audio/${upperLetter}.mp3`
    };
}

export function processLiteracyToolCalls(toolCalls: any[]): LetterResources {
    const resources: LetterResources = {};

    for (const toolCall of toolCalls) {
        if (toolCall.function.name === 'send_letter_gif') {
            const args = JSON.parse(toolCall.function.arguments);
            resources.gif = getLetterResources(args.letter).gif;
        } else if (toolCall.function.name === 'send_letter_audio') {
            const args = JSON.parse(toolCall.function.arguments);
            resources.audio = getLetterResources(args.letter).audio;
        }
    }

    return resources;
}