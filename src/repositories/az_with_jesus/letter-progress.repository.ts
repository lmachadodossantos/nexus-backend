import { pool } from "@/db/az_with_jesus/mysql";
import { LetterProgressRow } from "@/types/literacy";

export class LetterProgressRepository {
    async findByStudentAndLetter(studentId: string, letter: string): Promise<LetterProgressRow | null> {
        const [rows] = await pool.query(
            `
                SELECT *
                FROM letter_progress
                WHERE student_id = ?
                  AND letter = ?
                    LIMIT 1
            `,
            [studentId, letter]
        );

        const data = rows as LetterProgressRow[];
        return data[0] || null;
    }

    async createIfNotExists(params: {
        studentId: string;
        letter: string;
        biblicalReference: string;
    }): Promise<void> {
        await pool.query(
            `
                INSERT IGNORE INTO letter_progress (
        student_id,
        letter,
        biblical_reference,
        status,
        current_step,
        first_started_at,
        last_practiced_at
      )
      VALUES (?, ?, ?, 'in_progress', 'abertura', NOW(), NOW())
            `,
            [params.studentId, params.letter, params.biblicalReference]
        );
    }

    async updateProgress(params: {
        studentId: string;
        letter: string;
        currentStep: string;
        status?: "not_started" | "in_progress" | "review" | "mastered";
        incrementTimesPracticed?: number;
        incrementCorrectAnswers?: number;
        incrementIncorrectAnswers?: number;
        teacherSummary?: string | null;
        difficultyNotes?: string | null;
    }): Promise<void> {
        await pool.query(
            `
                UPDATE letter_progress
                SET
                    current_step = ?,
                    status = COALESCE(?, status),
                    times_practiced = times_practiced + ?,
                    correct_answers_count = correct_answers_count + ?,
                    incorrect_answers_count = incorrect_answers_count + ?,
                    teacher_summary = ?,
                    difficulty_notes = ?,
                    last_practiced_at = NOW(),
                    mastered_at = CASE WHEN ? = 'mastered' THEN NOW() ELSE mastered_at END,
                    updated_at = NOW()
                WHERE student_id = ?
                  AND letter = ?
            `,
            [
                params.currentStep,
                params.status ?? null,
                params.incrementTimesPracticed ?? 0,
                params.incrementCorrectAnswers ?? 0,
                params.incrementIncorrectAnswers ?? 0,
                params.teacherSummary ?? null,
                params.difficultyNotes ?? null,
                params.status ?? null,
                params.studentId,
                params.letter
            ]
        );
    }
}