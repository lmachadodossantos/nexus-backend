import { randomUUID } from "crypto";
import { ProgressRepository } from "../../repositories/az_with_jesus/progress.repository";
import { SessionsRepository } from "../../repositories/az_with_jesus/sessions.repository";
import { MessagesRepository } from "../../repositories/az_with_jesus/messages.repository";
import { LetterProgressRepository } from "../../repositories/az_with_jesus/letter-progress.repository";
import { AttemptsRepository } from "../../repositories/az_with_jesus/attempts.repository";
import { SessionSummariesRepository } from "../../repositories/az_with_jesus/session-summaries.repository";
import { LiteracyStep } from "../../types/literacy";
import { getLetterConfig } from "../../ai/az_with_jesus/literacy-map";

export class LiteracyMemoryService {
    private progressRepo = new ProgressRepository();
    private sessionsRepo = new SessionsRepository();
    private messagesRepo = new MessagesRepository();
    private letterProgressRepo = new LetterProgressRepository();
    private attemptsRepo = new AttemptsRepository();
    private sessionSummariesRepo = new SessionSummariesRepository();

    async getOrCreateState(studentId: number) {
        let progress = await this.progressRepo.findByStudentId(studentId);

        if (!progress) {
            const initial = getLetterConfig("A");
            await this.progressRepo.createInitial(studentId, initial.letter, initial.reference);
            progress = await this.progressRepo.findByStudentId(studentId);
        }

        if (!progress) {
            throw new Error("Falha ao inicializar progresso do aluno.");
        }

        const recentMessages = await this.messagesRepo.getRecentByStudent(studentId, 12);

        return {
            progress,
            recentMessages
        };
    }

    async startOrResumeSession(studentId: number) {
        const state = await this.getOrCreateState(studentId);

        let session = await this.sessionsRepo.findLastActiveByStudentId(studentId);

        if (!session) {
            const sessionId = await this.sessionsRepo.create({
                studentId,
                sessionUuid: randomUUID(),
                letter: state.progress.current_letter,
                stepStarted: state.progress.current_step,
                biblicalReference: state.progress.biblical_reference
            });

            await this.progressRepo.incrementTotalSessions(studentId);

            session = await this.sessionsRepo.findLastActiveByStudentId(studentId);

            if (!session || session.id !== sessionId) {
                throw new Error("Falha ao criar sessão.");
            }
        }

        await this.letterProgressRepo.createIfNotExists({
            studentId,
            letter: state.progress.current_letter,
            biblicalReference: state.progress.biblical_reference
        });

        return {
            session,
            progress: state.progress,
            recentMessages: state.recentMessages
        };
    }

    async saveStudentMessage(params: {
        sessionId: number;
        studentId: number;
        letter: string;
        step: LiteracyStep;
        content: string;
    }) {
        await this.messagesRepo.create({
            sessionId: params.sessionId,
            studentId: params.studentId,
            role: "user",
            letter: params.letter,
            step: params.step,
            messageText: params.content
        });

        await this.sessionsRepo.addStudentMessage(params.sessionId);
        await this.progressRepo.updateLastStudentMessage(params.studentId, params.content);
    }

    async saveAssistantTurn(params: {
        sessionId: number;
        studentId: number;
        letter: string;
        step: LiteracyStep;
        content: string;
        structuredPayload?: unknown;
        resourcesPayload?: unknown;
        openAIResponseId?: string | null;
        summary?: string | null;
        difficultyNotes?: string | null;
        gifSent?: boolean;
        audioSent?: boolean;
        attempt?: {
            attemptType: "repeat_sound" | "identify_letter" | "identify_word" | "build_phrase" | "final_quiz" | "free_response";
            promptText?: string | null;
            studentAnswer?: string | null;
            expectedAnswer?: string | null;
            isCorrect?: boolean | null;
            score?: number | null;
            difficultyTag?: string | null;
            teacherFeedback?: string | null;
        } | null;
        sessionSummary?: {
            summaryText: string;
            strengths?: string | null;
            difficulties?: string | null;
            recommendedNextStep?: string | null;
        } | null;
    }) {
        const cfg = getLetterConfig(params.letter);

        await this.messagesRepo.create({
            sessionId: params.sessionId,
            studentId: params.studentId,
            role: "assistant",
            letter: params.letter,
            step: params.step,
            messageText: params.content,
            structuredPayload: params.structuredPayload,
            resourcesPayload: params.resourcesPayload,
            openAIResponseId: params.openAIResponseId ?? null
        });

        await this.sessionsRepo.addAssistantMessage({
            sessionId: params.sessionId,
            stepEnded: params.step,
            openAIResponseId: params.openAIResponseId ?? null
        });

        await this.progressRepo.updateAfterAssistant({
            studentId: params.studentId,
            currentLetter: params.letter,
            currentStep: params.step,
            biblicalReference: cfg.reference,
            gifSent: Boolean(params.gifSent),
            audioSent: Boolean(params.audioSent),
            progressSummary: params.summary ?? null,
            difficultyNotes: params.difficultyNotes ?? null,
            lastTeacherMessage: params.content,
            lastSessionId: params.sessionId,
            lastOpenAIResponseId: params.openAIResponseId ?? null
        });

        await this.letterProgressRepo.updateProgress({
            studentId: params.studentId,
            letter: params.letter,
            currentStep: params.step,
            status: params.step === "encerramento" ? "mastered" : "in_progress",
            incrementTimesPracticed: 1,
            teacherSummary: params.summary ?? null,
            difficultyNotes: params.difficultyNotes ?? null
        });

        if (params.step === "encerramento") {
            await this.progressRepo.incrementMasteredLetters(params.studentId);
        }

        if (params.attempt) {
            await this.attemptsRepo.create({
                sessionId: params.sessionId,
                studentId: params.studentId,
                letter: params.letter,
                step: params.step,
                attemptType: params.attempt.attemptType,
                promptText: params.attempt.promptText ?? null,
                studentAnswer: params.attempt.studentAnswer ?? null,
                expectedAnswer: params.attempt.expectedAnswer ?? null,
                isCorrect: params.attempt.isCorrect ?? null,
                score: params.attempt.score ?? null,
                difficultyTag: params.attempt.difficultyTag ?? null,
                teacherFeedback: params.attempt.teacherFeedback ?? null
            });
        }

        if (params.sessionSummary) {
            await this.sessionSummariesRepo.upsert({
                sessionId: params.sessionId,
                studentId: params.studentId,
                summaryText: params.sessionSummary.summaryText,
                strengths: params.sessionSummary.strengths ?? null,
                difficulties: params.sessionSummary.difficulties ?? null,
                recommendedNextStep: params.sessionSummary.recommendedNextStep ?? null
            });
        }
    }
}