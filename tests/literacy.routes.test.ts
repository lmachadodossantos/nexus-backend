import { describe, it, expect, beforeEach, vi } from "vitest";
import { readSSE } from "./helpers/readSSE";
import { app } from "@/index";

vi.mock("@/ai/openai", () => {
    return {
        openai: {
            responses: {
                create: vi.fn()
            }
        }
    };
});

vi.mock("@/auth", () => {
    return {
        auth: {
            api: {
                getSession: vi.fn()
            }
        }
    };
});

import { openai } from "@/ai/openai";
import { auth } from "@/auth";
import { LiteracyMemoryService } from "@/services/az_with_jesus/memory.service";
import { LearningMetricsService } from "@/services/az_with_jesus/learning-metrics.service";
import { LearningProgressEngineService } from "@/services/az_with_jesus/learning-progress-engine.service";
import { ProgressRepository } from "@/repositories/az_with_jesus/progress.repository";
import { SessionsRepository } from "@/repositories/az_with_jesus/sessions.repository";

describe("Literacy routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        (auth.api.getSession as any).mockResolvedValue({
            user: { id: "123" }
        });
    });

    it("GET /api/ai/chat/az-with-jesus/state deve retornar estado inicial", async () => {
        vi.spyOn(LiteracyMemoryService.prototype, "getFullState").mockResolvedValue({
            studentId: 123,
            progress: {
                currentLetter: "N",
                currentStep: "palavras",
                biblicalReference: "Noé",
                gifSent: true,
                audioSent: true,
                progressSummary: "Aluno avançou bem.",
                difficultyNotes: null,
                lastTeacherMessage: "Vamos continuar",
                lastStudentMessage: "Navio",
                status: "active"
            },
            session: {
                id: 10,
                sessionUuid: "abc",
                status: "active",
                startedAt: new Date().toISOString(),
                lastInteractionAt: new Date().toISOString(),
                summary: "Sessão em andamento"
            },
            currentLetterProgress: {
                letter: "N",
                status: "in_progress",
                currentStep: "palavras",
                timesPracticed: 3,
                correctAnswersCount: 2,
                incorrectAnswersCount: 1,
                teacherSummary: "Boa evolução",
                difficultyNotes: null
            },
            sessionSummary: {
                summaryText: "Resumo da sessão",
                strengths: null,
                difficulties: null,
                recommendedNextStep: "frase"
            },
            recentMessages: [
                {
                    role: "assistant",
                    content: "Vamos aprender a letra N",
                    step: "abertura",
                    letter: "N",
                    createdAt: new Date().toISOString()
                }
            ]
        } as any);

        const response = await app.request("/api/ai/chat/az-with-jesus/state", {
            method: "GET",
            headers: {
                Authorization: "Bearer fake-token"
            }
        });

        expect(response.status).toBe(200);

        const json = await response.json();

        expect(json.studentId).toBe(123);
        expect(json.progress.currentLetter).toBe("N");
        expect(json.progress.currentStep).toBe("palavras");
        expect(json.session.id).toBe(10);
        expect(json.recentMessages).toHaveLength(1);
    });

    it("POST /api/ai/chat/az-with-jesus/finish deve finalizar sessão", async () => {
        vi.spyOn(SessionsRepository.prototype, "finish").mockResolvedValue(undefined);

        const response = await app.request("/api/ai/chat/az-with-jesus/finish", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer fake-token"
            },
            body: JSON.stringify({
                sessionId: 10,
                summary: "Sessão finalizada"
            })
        });

        expect(response.status).toBe(200);

        const json = await response.json();
        expect(json.ok).toBe(true);

        expect(SessionsRepository.prototype.finish).toHaveBeenCalledWith(
            10,
            "Sessão finalizada"
        );
    });

    it("deve retornar 401 sem sessão", async () => {
        (auth.api.getSession as any).mockResolvedValueOnce(null);

        const response = await app.request("/api/ai/chat/az-with-jesus/state", {
            method: "GET"
        });

        expect(response.status).toBe(401);
    });
});