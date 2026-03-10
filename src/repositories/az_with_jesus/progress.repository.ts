import { pool } from "../../db/az_with_jesus/mysql";
import { ProgressRow } from "../../types/literacy";
import mysql from "mysql2/promise";

export class ProgressRepository {
    async findByStudentId(studentId: number): Promise<ProgressRow | null> {
        const [rows] = await pool.query(
            `SELECT * FROM progress WHERE student_id = ? LIMIT 1`,
            [studentId]
        );

        const data = rows as ProgressRow[];
        return data[0] || null;
    }

    async createInitial(studentId: number, letter: string, biblicalReference: string): Promise<number> {
        const [result] = await pool.query(
            `
      INSERT INTO progress (
        student_id,
        current_letter,
        current_step,
        biblical_reference,
        gif_sent,
        audio_sent,
        status,
        started_at,
        last_interaction_at
      )
      VALUES (?, ?, 'abertura', ?, 0, 0, 'active', NOW(), NOW())
      `,
            [studentId, letter, biblicalReference]
        );

        return (result as mysql.ResultSetHeader).insertId;
    }

    async updateAfterAssistant(params: {
        studentId: number;
        currentLetter: string;
        currentStep: string;
        biblicalReference: string;
        gifSent: boolean;
        audioSent: boolean;
        progressSummary?: string | null;
        difficultyNotes?: string | null;
        lastTeacherMessage?: string | null;
        lastStudentMessage?: string | null;
        lastSessionId?: number | null;
        lastOpenAIResponseId?: string | null;
    }): Promise<void> {
        await pool.query(
            `
      UPDATE progress
      SET
        current_letter = ?,
        current_step = ?,
        biblical_reference = ?,
        gif_sent = ?,
        audio_sent = ?,
        progress_summary = ?,
        difficulty_notes = ?,
        last_teacher_message = ?,
        last_student_message = ?,
        last_session_id = ?,
        last_openai_response_id = ?,
        last_interaction_at = NOW(),
        updated_at = NOW()
      WHERE student_id = ?
      `,
            [
                params.currentLetter,
                params.currentStep,
                params.biblicalReference,
                params.gifSent ? 1 : 0,
                params.audioSent ? 1 : 0,
                params.progressSummary ?? null,
                params.difficultyNotes ?? null,
                params.lastTeacherMessage ?? null,
                params.lastStudentMessage ?? null,
                params.lastSessionId ?? null,
                params.lastOpenAIResponseId ?? null,
                params.studentId
            ]
        );
    }

    async updateLastStudentMessage(studentId: number, content: string): Promise<void> {
        await pool.query(
            `
      UPDATE progress
      SET
        last_student_message = ?,
        last_interaction_at = NOW(),
        total_interactions = total_interactions + 1,
        updated_at = NOW()
      WHERE student_id = ?
      `,
            [content, studentId]
        );
    }

    async incrementTotalSessions(studentId: number): Promise<void> {
        await pool.query(
            `
      UPDATE progress
      SET
        total_sessions = total_sessions + 1,
        updated_at = NOW()
      WHERE student_id = ?
      `,
            [studentId]
        );
    }

    async incrementMasteredLetters(studentId: number): Promise<void> {
        await pool.query(
            `
      UPDATE progress
      SET
        mastered_letters_count = mastered_letters_count + 1,
        updated_at = NOW()
      WHERE student_id = ?
      `,
            [studentId]
        );
    }
}