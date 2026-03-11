import { pool } from "../../db/az_with_jesus/mysql";
import { LiteracyStep } from "../../types/literacy";

export interface LearningMetrics {
    letter: string;
    currentStep: LiteracyStep;
    totalAttempts: number;
    correctAnswers: number;
    incorrectAnswers: number;
    recentConsecutiveErrors: number;
    recentConsecutiveCorrect: number;
}

export class LearningMetricsService {

    async calculate(studentId: number, letter: string, step: LiteracyStep): Promise<LearningMetrics> {

        const [rows] = await pool.query(
            `
      SELECT is_correct
      FROM attempts
      WHERE student_id = ?
        AND letter = ?
        AND step = ?
      ORDER BY id DESC
      LIMIT 10
      `,
            [studentId, letter, step]
        );

        const attempts = rows as Array<{ is_correct: number | null }>;

        let correct = 0;
        let incorrect = 0;

        for (const a of attempts) {
            if (a.is_correct === 1) correct++;
            if (a.is_correct === 0) incorrect++;
        }

        let consecutiveErrors = 0;
        let consecutiveCorrect = 0;

        for (const a of attempts) {
            if (a.is_correct === 0) consecutiveErrors++;
            else break;
        }

        for (const a of attempts) {
            if (a.is_correct === 1) consecutiveCorrect++;
            else break;
        }

        return {
            letter,
            currentStep: step,
            totalAttempts: correct + incorrect,
            correctAnswers: correct,
            incorrectAnswers: incorrect,
            recentConsecutiveErrors: consecutiveErrors,
            recentConsecutiveCorrect: consecutiveCorrect
        };
    }
}