export interface ExamData {
    examId: string;
    examTitle: string;
    examInfo: ExamInfo;
    questions: Question[];
}

export interface ExamInfo {
    clinical_domain: string;
    difficulty_level: number;
    duration: number;
    topics: string[];
    description: string;
    status: string;
    createdAt: string;
}

export type Question = FillBlankQuestion | MatchingPairsQuestion | McqSingleQuestion | CaseBasedQuestion | ScriptConcordanceQuestion;

export interface PatientProfile {
    gender: string;
    relevant_history: string;
    age: number;
}

export interface CaseScenario {
    physical_examination?: string;
    patient_profile?: PatientProfile;
    history?: string;
    initial_investigations?: string;
    chief_complaint?: string;
}

export interface SubQuestion {
    question_id: string;
    question_text: string;
    options: { id: string; text: string }[];
    selectedAnswer?: string;
    changeLog: string[];
}

export interface SubQuestionAnswer {
    subQuestionId: string;
    selectedAnswer: string;
}


export interface BaseQuestion {
    questionId: string;
    question_type: string;
    topic: string;
    type?: string;
    clinical_domain?: string;
    subtopic: string;
    difficulty_level: string;
    difficulty_domain?: string;
    stem?: string;
    question_text?: string;
    status: string;
    changeLog: string[];
    totalChanges: number;
    totalTimeTaken: number;
    selectedOption: string | undefined;
    photo: string;
    id: number;
    visits: number;
    timeTakenForFirst: number;
    case_scenario?: CaseScenario | string;
    initial_hypothesis?: string;
    new_information?: string;
    clinical_vignette?: string;
    response_scale?: { value: string; text: string }[];
    options?: { id: string; text: string; matching?: string }[];
    sub_questions?: SubQuestion[];
    subQuestionAnswers?: SubQuestionAnswer[];
    list_a?: { id: string; text: string }[];
    list_b?: { id: string; text: string }[];
}

export interface FillBlankQuestion extends BaseQuestion {
    question_type: "FILL_IN_THE_BLANKS";
}

export interface MatchingPairsQuestion extends BaseQuestion {
    question_type: "EXTENDED_MATCHING";
    list_a: { id: string; text: string }[];
    list_b: { id: string; text: string }[];
}

export interface McqSingleQuestion extends BaseQuestion {
    question_type: "MCQ";
    total_options?: number;
}

export interface CaseBasedQuestion extends BaseQuestion {
    question_type: "CASE_BASED";
    sub_questions: SubQuestion[];
    case_scenario: CaseScenario;

}

export interface MultiLogicQuestion extends BaseQuestion {
    question_type: "MULTI_LOGIC";
    sub_questions: SubQuestion[];
    case_scenario: string;

}


export interface ScriptConcordanceQuestion extends BaseQuestion {
    question_type: "SCRIPT_CONCORDANCE";
    initial_hypothesis: string;
    new_information: string;
    clinical_vignette: string;
    response_scale: { value: string; text: string }[];
}