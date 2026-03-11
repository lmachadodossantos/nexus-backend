import { LiteracyStep } from "../../types/literacy";
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
        case "palavras": return "frase";
        case "frase": return "mini_exercicio";
        case "mini_exercicio": return "encerramento";
        default: return "encerramento";
    }

}

function getPreviousStep(step: LiteracyStep): LiteracyStep {

    switch (step) {
        case "som": return "abertura";
        case "palavras": return "som";
        case "frase": return "palavras";
        case "mini_exercicio": return "frase";
        case "encerramento": return "mini_exercicio";
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