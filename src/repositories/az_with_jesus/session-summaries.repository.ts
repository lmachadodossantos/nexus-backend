import { pool } from "@/db/az_with_jesus/mysql";
import {SessionSummaryRow} from "@/types/literacy";

export class SessionSummariesRepository {
    async upsert(params: {
        sessionId: number;
        studentId: string;
        summaryText: string;
        strengths?: string | null;
        difficulties?: string | null;
        recommendedNextStep?: string | null;
    }): Promise<void> {
        await pool.query(
            `
      INSERT INTO session_summaries (
        session_id,
        student_id,
        summary_text,
        strengths,
        difficulties,
        recommended_next_step
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        summary_text = VALUES(summary_text),
        strengths = VALUES(strengths),
        difficulties = VALUES(difficulties),
        recommended_next_step = VALUES(recommended_next_step),
        updated_at = NOW()
      `,
            [
                params.sessionId,
                params.studentId,
                params.summaryText,
                params.strengths ?? null,
                params.difficulties ?? null,
                params.recommendedNextStep ?? null
            ]
        );
    }

    async findBySessionId(sessionId: number): Promise<SessionSummaryRow | null> {
        const [rows] = await pool.query(
            `
      SELECT *
      FROM session_summaries
      WHERE session_id = ?
      LIMIT 1
      `,
            [sessionId]
        );

        const data = rows as SessionSummaryRow[];
        return data[0] || null;
    }
}