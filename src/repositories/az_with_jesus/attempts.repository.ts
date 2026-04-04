import mysql from "mysql2/promise";
import { pool } from "@/db/az_with_jesus/mysql";
import { AttemptType, LiteracyStep } from "@/types/literacy";

export class AttemptsRepository {
    async create(params: {
        sessionId: number;
        studentId: string;
        letter: string;
        step: LiteracyStep;
        attemptType: AttemptType;
        promptText?: string | null;
        studentAnswer?: string | null;
        expectedAnswer?: string | null;
        isCorrect?: boolean | null;
        score?: number | null;
        difficultyTag?: string | null;
        teacherFeedback?: string | null;
    }): Promise<number> {
        const [result] = await pool.query(
            `
      INSERT INTO attempts (
        session_id,
        student_id,
        letter,
        step,
        attempt_type,
        prompt_text,
        student_answer,
        expected_answer,
        is_correct,
        score,
        difficulty_tag,
        teacher_feedback
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
            [
                params.sessionId,
                params.studentId,
                params.letter,
                params.step,
                params.attemptType,
                params.promptText ?? null,
                params.studentAnswer ?? null,
                params.expectedAnswer ?? null,
                typeof params.isCorrect === "boolean" ? (params.isCorrect ? 1 : 0) : null,
                params.score ?? null,
                params.difficultyTag ?? null,
                params.teacherFeedback ?? null
            ]
        );

        return (result as mysql.ResultSetHeader).insertId;
    }
}