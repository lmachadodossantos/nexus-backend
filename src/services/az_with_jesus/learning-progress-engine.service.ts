import { LiteracyStep } from "@/types/literacy";
import { LearningMetrics } from "./learning-metrics.service";

export type LearningDecisionType =
    | "advance_step"
    | "repeat_step"
    | "go_back_step"
    | "advance_letter";

export interface LearningDecision {
    decision: LearningDecisionType;
    nextLetter: string;
    nextStep: LiteracyStep;
    reason: string;
}

function getNextStep(step: LiteracyStep): LiteracyStep {

    switch (step) {
        case "abertura": return "som";
        case "som": return "palavras";
        case "palavras": return "aquecimento";
        case "aquecimento": return "bastao_maiuscula";
        case "bastao_maiuscula": return "bastao_minuscula";
        case "bastao_minuscula": return "cursiva_maiuscula";
        case "cursiva_maiuscula": return "cursiva_minuscula";
        case "cursiva_minuscula": return "desafio";
        case "desafio": return "encerramento";
        default: return "encerramento";
    }

}

function getPreviousStep(step: LiteracyStep): LiteracyStep {

    switch (step) {
        case "som": return "abertura";
        case "palavras": return "som";
        case "aquecimento": return "palavras";
        case "bastao_maiuscula": return "aquecimento";
        case "bastao_minuscula": return "bastao_maiuscula";
        case "cursiva_maiuscula": return "bastao_minuscula";
        case "cursiva_minuscula": return "cursiva_maiuscula";
        case "desafio": return "cursiva_minuscula";
        case "encerramento": return "desafio";
        default: return "abertura";
    }

}

function getNextLetter(letter: string): string {

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const idx = alphabet.indexOf(letter);

    if (idx === -1) return letter;
    if (idx === alphabet.length - 1) return letter;

    return alphabet[idx + 1];

}

export class LearningProgressEngineService {

    evaluate(metrics: LearningMetrics): LearningDecision {

        const total = metrics.correctAnswers + metrics.incorrectAnswers;
        const accuracy = total ? metrics.correctAnswers / total : 0;

        if (metrics.recentConsecutiveErrors >= 3) {
            return {
                decision: "go_back_step",
                nextLetter: metrics.letter,
                nextStep: getPreviousStep(metrics.currentStep),
                reason: "three_consecutive_errors"
            };
        }

        if (
            metrics.currentStep === "encerramento" &&
            accuracy >= 0.8 &&
            metrics.totalAttempts >= 4
        ) {
            return {
                decision: "advance_letter",
                nextLetter: getNextLetter(metrics.letter),
                nextStep: "abertura",
                reason: "letter_mastered"
            };
        }

        if (accuracy >= 0.8 && metrics.totalAttempts >= 2) {
            return {
                decision: "advance_step",
                nextLetter: metrics.letter,
                nextStep: getNextStep(metrics.currentStep),
                reason: "step_mastered"
            };
        }

        if (accuracy >= 0.4) {
            return {
                decision: "repeat_step",
                nextLetter: metrics.letter,
                nextStep: metrics.currentStep,
                reason: "partial_mastery"
            };
        }

        return {
            decision: "repeat_step",
            nextLetter: metrics.letter,
            nextStep: metrics.currentStep,
            reason: "low_accuracy"
        };

    }
}