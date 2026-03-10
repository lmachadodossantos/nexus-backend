import { pool } from "../../db/az_with_jesus/mysql";
import mysql from "mysql2/promise";
import { SessionRow } from "../../types/literacy";

export class SessionsRepository {
    async findLastActiveByStudentId(studentId: number): Promise<SessionRow | null> {
        const [rows] = await pool.query(
            `
      SELECT *
      FROM sessions
      WHERE student_id = ?
        AND status = 'active'
      ORDER BY id DESC
      LIMIT 1
      `,
            [studentId]
        );

        const data = rows as SessionRow[];
        return data[0] || null;
    }

    async create(params: {
        studentId: number;
        sessionUuid: string;
        letter: string;
        stepStarted: string;
        biblicalReference: string;
    }): Promise<number> {
        const [result] = await pool.query(
            `
      INSERT INTO sessions (
        student_id,
        session_uuid,
        letter,
        step_started,
        biblical_reference,
        status,
        started_at,
        last_interaction_at
      )
      VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())
      `,
            [
                params.studentId,
                params.sessionUuid,
                params.letter,
                params.stepStarted,
                params.biblicalReference
            ]
        );

        return (result as mysql.ResultSetHeader).insertId;
    }

    async touchInteraction(sessionId: number): Promise<void> {
        await pool.query(
            `
      UPDATE sessions
      SET
        last_interaction_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
      `,
            [sessionId]
        );
    }

    async addStudentMessage(sessionId: number): Promise<void> {
        await pool.query(
            `
      UPDATE sessions
      SET
        messages_count = messages_count + 1,
        student_messages_count = student_messages_count + 1,
        last_interaction_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
      `,
            [sessionId]
        );
    }

    async addAssistantMessage(params: {
        sessionId: number;
        stepEnded?: string | null;
        openAIResponseId?: string | null;
    }): Promise<void> {
        await pool.query(
            `
      UPDATE sessions
      SET
        messages_count = messages_count + 1,
        assistant_messages_count = assistant_messages_count + 1,
        step_ended = COALESCE(?, step_ended),
        last_openai_response_id = COALESCE(?, last_openai_response_id),
        last_interaction_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
      `,
            [
                params.stepEnded ?? null,
                params.openAIResponseId ?? null,
                params.sessionId
            ]
        );
    }

    async finish(sessionId: number, summary?: string | null): Promise<void> {
        await pool.query(
            `
      UPDATE sessions
      SET
        status = 'finished',
        session_summary = ?,
        ended_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
      `,
            [summary ?? null, sessionId]
        );
    }
}