export type LiteracyStep =
    | "abertura"
    | "som"
    | "palavras"
    | "aquecimento"
    | "bastao_maiuscula"
    | "bastao_minuscula"
    | "cursiva_maiuscula"
    | "cursiva_minuscula"
    | "desafio"
    | "encerramento";

export type ProgressStatus = "active" | "paused" | "completed";
export type SessionStatus = "active" | "finished" | "abandoned";
export type LetterProgressStatus = "not_started" | "in_progress" | "review" | "mastered";
export type MessageRole = "user" | "assistant" | "system" | "developer" | "tool";
export type AttemptType =
    | "repeat_sound"
    | "identify_letter"
    | "identify_word"
    | "build_phrase"
    | "final_quiz"
    | "free_response";

export interface ProgressRow {
    id: number;
    student_id: string;
    current_letter: string;
    current_step: LiteracyStep;
    biblical_reference: string;
    gif_sent: 0 | 1;
    audio_sent: 0 | 1;
    mastered_letters_count: number;
    total_sessions: number;
    total_interactions: number;
    last_session_id: number | null;
    last_openai_conversation_id: string | null;
    last_openai_response_id: string | null;
    progress_summary: string | null;
    difficulty_notes: string | null;
    last_teacher_message: string | null;
    last_student_message: string | null;
    status: ProgressStatus;
    started_at: Date | null;
    last_interaction_at: Date | null;
    completed_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface SessionRow {
    id: number;
    student_id: string;
    session_uuid: string;
    letter: string;
    step_started: LiteracyStep;
    step_ended: LiteracyStep | null;
    biblical_reference: string;
    openai_conversation_id: string | null;
    first_openai_response_id: string | null;
    last_openai_response_id: string | null;
    messages_count: number;
    student_messages_count: number;
    assistant_messages_count: number;
    status: SessionStatus;
    session_summary: string | null;
    teacher_observation: string | null;
    started_at: Date;
    ended_at: Date | null;
    last_interaction_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface MessageRow {
    id: number;
    session_id: number;
    student_id: string;
    role: MessageRole;
    letter: string | null;
    step: LiteracyStep | null;
    message_text: string;
    structured_payload: unknown | null;
    resources_payload: unknown | null;
    openai_response_id: string | null;
    openai_item_id: string | null;
    created_at: Date;
}

export interface LetterProgressRow {
    id: number;
    student_id: string;
    letter: string;
    biblical_reference: string;
    status: LetterProgressStatus;
    current_step: LiteracyStep;
    times_practiced: number;
    correct_answers_count: number;
    incorrect_answers_count: number;
    first_started_at: Date | null;
    last_practiced_at: Date | null;
    mastered_at: Date | null;
    teacher_summary: string | null;
    difficulty_notes: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface AttemptRow {
    id: number;
    session_id: number;
    student_id: string;
    letter: string;
    step: LiteracyStep;
    attempt_type: AttemptType;
    prompt_text: string | null;
    student_answer: string | null;
    expected_answer: string | null;
    is_correct: 0 | 1 | null;
    score: string | null;
    difficulty_tag: string | null;
    teacher_feedback: string | null;
    created_at: Date;
}

export interface SessionSummaryRow {
    id: number;
    session_id: number;
    student_id: string;
    summary_text: string;
    strengths: string | null;
    difficulties: string | null;
    recommended_next_step: string | null;
    created_at: Date;
    updated_at: Date;
}