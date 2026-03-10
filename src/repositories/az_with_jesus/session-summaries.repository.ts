import { pool } from "../../db/az_with_jesus/mysql";

export class SessionSummariesRepository {
    async upsert(params: {
        sessionId: number;
        studentId: number;
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
}