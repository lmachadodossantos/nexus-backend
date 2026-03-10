import mysql from "mysql2/promise";
import { pool } from "../../db/az_with_jesus/mysql";
import { MessageRow, MessageRole, LiteracyStep } from "../../types/literacy";

export class MessagesRepository {
    async create(params: {
        sessionId: number;
        studentId: number;
        role: MessageRole;
        letter?: string | null;
        step?: LiteracyStep | null;
        messageText: string;
        structuredPayload?: unknown;
        resourcesPayload?: unknown;
        openAIResponseId?: string | null;
        openAIItemId?: string | null;
    }): Promise<number> {
        const [result] = await pool.query(
            `
                INSERT INTO messages (
                    session_id,
                    student_id,
                    role,
                    letter,
                    step,
                    message_text,
                    structured_payload,
                    resources_payload,
                    openai_response_id,
                    openai_item_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                params.sessionId,
                params.studentId,
                params.role,
                params.letter ?? null,
                params.step ?? null,
                params.messageText,
                params.structuredPayload ? JSON.stringify(params.structuredPayload) : null,
                params.resourcesPayload ? JSON.stringify(params.resourcesPayload) : null,
                params.openAIResponseId ?? null,
                params.openAIItemId ?? null
            ]
        );

        return (result as mysql.ResultSetHeader).insertId;
    }

    async getRecentByStudent(studentId: number, limit = 12): Promise<MessageRow[]> {
        const [rows] = await pool.query(
            `
                SELECT *
                FROM messages
                WHERE student_id = ?
                ORDER BY id DESC
                    LIMIT ?
            `,
            [studentId, limit]
        );

        return (rows as MessageRow[]).reverse();
    }
}