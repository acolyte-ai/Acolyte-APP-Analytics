"use client"

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuestionCard from "./questions";
import TestAssistance from "./testAssistance";
import axios from 'axios';
import { useRouter } from "next/navigation";
import useUserId from "@/hooks/useUserId";
import { EXAM_COMPLETE, EXTRACT_QUESTIONS, START_EXAM, SUBMIT_ANSWERS } from "../api/url";

export interface ExamData {
    examId: string;
    examTitle: string;
    examInfo: ExamInfo;
    questions: Question[];
}

interface ExamInfo {
    clinical_domain: string;
    difficulty_level: number;
    duration: number;
    topics: string[];
    description: string;
    status: string;
    createdAt: string;
}

export type Question = FillBlankQuestion | MatchingPairsQuestion | McqSingleQuestion | CaseBasedQuestion | ScriptConcordanceQuestion | MultiLogicQuestion;

interface PatientProfile {
    gender: string;
    relevant_history: string;
    age: number;
}

interface CaseScenario {
    physical_examination: string;
    patient_profile: PatientProfile;
    history: string;
    initial_investigations: string;
    chief_complaint: string;
}

interface SubQuestion {
    question_id: string;
    question_text: string;
    options: { id: string; text: string }[];
    selectedAnswer?: string;
    changeLog: string[];
}

interface SubQuestionAnswer {
    subQuestionId: string;
    selectedAnswer: string;
}

interface MultiChoiceAnswer {
    questionId: string;

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
    case_scenario?: CaseScenario;
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

interface FillBlankQuestion extends BaseQuestion {
    question_type: "FILL_IN_THE_BLANKS";
}

interface MatchingPairsQuestion extends BaseQuestion {
    question_type: "EXTENDED_MATCHING";
    list_a: { id: string; text: string }[];
    list_b: { id: string; text: string }[];
}

interface McqSingleQuestion extends BaseQuestion {
    question_type: "MCQ";
    total_options?: number;
}

interface CaseBasedQuestion extends BaseQuestion {
    question_type: "CASE_BASED";
    sub_questions: SubQuestion[];
    case_scenario: CaseScenario;

}

interface OptionMultiLogic {
    id: string;
    text: string;
    leads_to?: string; // Optional - only present if this option leads to a specific scenario
}

interface SubStage {
    questionId: string;
    question_text: string;
    // correct_answer: string;
    explanation: string;
    options: OptionMultiLogic[];
    description?: string;
}




interface StageOne {
    stage_one: SubStage
}

interface StageTwo {
    stage_two: [
        {
            scenario_1A: SubStage
        },
        {
            scenario_1B: SubStage
        }
    ]
}

interface MultiLogicQuestion extends BaseQuestion {
    question_type: "MULTI_LOGIC";
    stages: [StageOne, StageTwo]

}

interface ScriptConcordanceQuestion extends BaseQuestion {
    question_type: "SCRIPT_CONCORDANCE";
    initial_hypothesis: string;
    new_information: string;
    clinical_vignette: string;
    response_scale: { value: string; text: string }[];
}

export default function DailyTest() {
    const [count, setCount] = useState<number>(0);
    const [questionList, setQuestionList] = useState<Question[]>([]);
    const [newData, setNewData] = useState<any>(null);
    const [fullScreen, setFullScreen] = useState(false);
    const userId = useUserId()
    const [selected, setSelected] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [error, setError] = useState<string | null>(null);
    const [examTime, setExamTime] = useState<number>(0)
    const [attemptId, setAttemptId] = useState()
    const [analysisParameter, setAnalysisParameter] = useState<{
        review: number;
        attempted: number;
        skip: number;
        pending: number;
        visit: number
    }>({
        review: 0,
        attempted: 0,
        skip: 0,
        pending: 0,
        visit: 0
    });

    const router = useRouter();

    const DEFAULT_OPTIONS = [
        { id: 'A', text: 'Tympanometry' },
        { id: 'B', text: 'MRI of the head' },
        { id: 'C', text: 'Pure-tone audiometry' },
        { id: 'D', text: 'CT temporal bone' },
        { id: 'E', text: 'Vestibular testing' }
    ];

    // Helper function to update visit count
    const updateVisitCount = (questionId: number, questionsList: Question[], count: number) => {
        console.log("count:::", count, "id::", questionId)
        const updatedQuestions = questionsList.map((item, index) => {
            if (index === count) {
                return {
                    ...item,
                    visits: item.visits + 1
                };
            }
            return item;
        });
        console.log("updated Question=======>", updatedQuestions)
        setQuestionList(updatedQuestions);

        // Update analysis parameter visit count
        // setAnalysisParameter((prev) => ({ ...prev, visit: prev.visit + 1 }));

        return updatedQuestions;
    };

    useEffect(() => {
        if (userId) { fetchData(); }

    }, [userId]);


    const fetchData = async () => {
        const url = window.location.pathname;
        const id = url.split('/').pop()
        console.log('id', id)
        const StartExam = process.env.NEXT_PUBLIC_PM_BASE_URL + START_EXAM
        // const API_URL = process.env.NEXT_PUBLIC_PM_BASE_URL + EXTRACT_QUESTIONS + id;
        const API_URL = process.env.NEXT_PUBLIC_EXAM_BASE_URL + '/api/fetch-questions'
        try {

            const responseStart = await axios.post(StartExam, {
                userId: userId,
                "questionBankId": id
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            console.log("====attempt====>:::", responseStart.data.attempt.attemptId)

            setAttemptId(responseStart.data.attempt.attemptId)
            console.log(localStorage.getItem("aco-exam-time"))
            const examTimes = convertTimeToSecondsNumber(localStorage.getItem("aco-exam-time") || "30min")
            setExamTime(examTimes)

            // const response = await axios.get(API_URL);
            const response = await axios.post(
                API_URL,
                id
            );
            const data = response.data.Items;
            setNewData(data);
            console.log(data);

            const enrichedQuestions = data.map((q: any, index: number) => ({
                ...q,
                id: index + 1,
                options: q.options && q.options.length > 0 ? q.options : DEFAULT_OPTIONS,
                status: 'pending',
                changeLog: [],
                totalChanges: 0,
                totalTimeTaken: 0,
                selectedOption: undefined,
                photo: '',
                visits: 0, // Initialize visits to 0
                timeTakenForFirst: 0,
                // Initialize sub-question answers for case-based questions
                subQuestionAnswers: q.question_type === "CASE_BASED" ? [] : undefined,
                // Initialize sub-questions with empty selectedAnswer
                sub_questions: q.sub_questions?.map((subQ: any) => ({
                    ...subQ,
                    selectedAnswer: undefined
                }))
            }));

            const enrichedExamData = {
                ...data,
                questions: enrichedQuestions
            };
            setAnalysisParameter((prev) => ({ ...prev, pending: enrichedQuestions.length }));
            setQuestionList(enrichedQuestions);

            // Set initial selected value for first question
            const firstQuestion = enrichedQuestions[0];
            if (firstQuestion?.question_type !== "CASE_BASED") {
                setSelected(firstQuestion?.selectedOption);
            }

            // Increment visit count for the first question
            if (firstQuestion) {
                const updatedQuestions = enrichedQuestions.map((q, idx) =>
                    idx === 0 ? { ...q, visits: q.visits + 1 } : q
                );
                setQuestionList(updatedQuestions);

                // Update analysis parameter for visit count
                setAnalysisParameter((prev) => ({ ...prev, visit: prev.visit + 1 }));
            }

        } catch (err: any) {
            console.error(err.message || 'Failed to fetch exam data');
            setError(err.message || 'Failed to fetch exam data');
        } finally {
            setLoading(false);
        }
    };


    function convertTimeToSecondsNumber(timeString = "30min") {
        console.log("timestring:::", timeString)
        const input = !timeString ? "30min" : timeString?.toLowerCase().trim();

        let hours = 0;
        let minutes = 0;
        let seconds = 0;

        const hourRegex = /(\d+)\s*h(?:r|our)?s?/g;
        const minuteRegex = /(\d+)\s*m(?:in|inute)?s?/g;
        const secondRegex = /(\d+)\s*s(?:ec|econd)?s?/g;

        let hourMatch = hourRegex.exec(input);
        if (hourMatch) {
            hours = parseInt(hourMatch[1]);
        }

        let minuteMatch = minuteRegex.exec(input);
        if (minuteMatch) {
            minutes = parseInt(minuteMatch[1]);
        }

        let secondMatch = secondRegex.exec(input);
        if (secondMatch) {
            seconds = parseInt(secondMatch[1]);
        }

        return hours * 3600 + minutes * 60 + seconds;
    }

    function findOptionByText(options, answerText) {
        return options.find(option => option.text === answerText);
    }

    const submitAnswers = async (payload: any) => {
        setLoadingSubmit(true)
        const API_URL = process.env.NEXT_PUBLIC_PM_BASE_URL + SUBMIT_ANSWERS;



        const answers = payload.answers.map((item: any) => {
            if (item.question_type === "CASE_BASED") {
                const changeLogByQuestionId = item.changeLog && item.changeLog.length > 0 ? segregateQuestionCodes(item.changeLog) : "";
                const answers = item.sub_questions.map((newItem) => {
                    const choice = findOptionByText(newItem.options, newItem.selectedAnswer);
                    console.log("chnage-log-cbe", item)

                    // Get changeLog for this question - return [] if undefined or has 1 or no elements
                    let questionChangeLog = [];
                    if (changeLogByQuestionId && changeLogByQuestionId[newItem?.question_id]) {
                        const log = changeLogByQuestionId[newItem?.question_id];
                        questionChangeLog = (log && log.length > 1) ? log : [];
                    }

                    return ({
                        "questionId": newItem.question_id,
                        "selectedOption": choice?.id,
                        "status": newItem.selectedAnswer === undefined ? "skipped" : "answered",
                        "totalTimeTaken": item.totalTimeTaken,
                        "timeTakenForFirst": item.timeTakenForFirst || 0,
                        "visitCount": item.visits || 0,
                        "accuracy": 50,
                        "switched": newItem.selectedAnswer === undefined ? true : false,
                        "confidence": 50,
                        "changeLog": questionChangeLog,
                    })
                })

                return answers
            } else if (item.question_type === "MULTI_LOGIC") {
                console.log("chnage-log-ml", item)
                const changeLogByQuestionId = item.changeLog && item.changeLog.length > 0 ? segregateMultiLogicValuesWithOrder(item.changeLog) : {};
                console.log("changeLogByQuestionId:::", changeLogByQuestionId)

                const answers: any[] = [];

                // Handle Stage One
                if (item.stages?.[0]?.stage_one) {
                    const stageOne = item.stages[0].stage_one;
                    const stageOneKey = `${stageOne.questionId}`;
                    const choice = findOptionByText(stageOne.options, stageOne.selectedAnswer);
                    console.log("choice:::", choice)

                    // Get changeLog for stage one - return [] if undefined or has 1 or no elements
                    let stageOneChangeLog = [];
                    if (changeLogByQuestionId[stageOneKey]) {
                        const log = changeLogByQuestionId[stageOneKey];
                        stageOneChangeLog = (log && log.length > 1) ? log : [];
                    }

                    answers.push({
                        "questionId": stageOne.questionId,
                        "stageType": "stage_one",
                        "selectedOption": choice?.id,
                        "status": stageOne.selectedAnswer === undefined ? "skipped" : "answered",
                        "totalTimeTaken": item.totalTimeTaken,
                        "timeTakenForFirst": item.timeTakenForFirst || 0,
                        "visitCount": item.visits || 0,
                        "accuracy": 50,
                        "switched": stageOne.selectedAnswer === undefined ? true : false,
                        "confidence": 50,
                        "changeLog": stageOneChangeLog,
                    });
                }

                // Handle Stage Two - Scenario 1A
                if (item.stages?.[1]?.stage_two?.[0]?.scenario_1A) {
                    const scenario1A = item.stages[1].stage_two[0].scenario_1A;
                    const scenario1AKey = `${scenario1A.questionId}`;
                    const choice = findOptionByText(scenario1A.options, scenario1A.selectedAnswer);
                    console.log("choice:::", choice)

                    // Get changeLog for scenario 1A - return [] if undefined or has 1 or no elements
                    let scenario1AChangeLog = [];
                    if (changeLogByQuestionId[scenario1AKey]) {
                        const log = changeLogByQuestionId[scenario1AKey];
                        scenario1AChangeLog = (log && log.length > 1) ? log : [];
                    }

                    answers.push({
                        "questionId": scenario1A.questionId,
                        "stageType": "stage_two",
                        "scenarioType": "scenario_1A",
                        "selectedOption": choice?.id,
                        "status": scenario1A.selectedAnswer === undefined ? "skipped" : "answered",
                        "totalTimeTaken": item.totalTimeTaken,
                        "timeTakenForFirst": item.timeTakenForFirst || 0,
                        "visitCount": item.visits || 0,
                        "accuracy": 50,
                        "switched": scenario1A.selectedAnswer === undefined ? true : false,
                        "confidence": 50,
                        "changeLog": scenario1AChangeLog,
                    });
                }

                // Handle Stage Two - Scenario 1B
                if (item.stages?.[1]?.stage_two?.[1]?.scenario_1B) {
                    const scenario1B = item.stages[1].stage_two[1].scenario_1B;
                    const scenario1BKey = `${scenario1B.questionId}`;
                    const choice = findOptionByText(scenario1B.options, scenario1B.selectedAnswer);
                    console.log("choice:::", choice)

                    // Get changeLog for scenario 1B - return [] if undefined or has 1 or no elements
                    let scenario1BChangeLog = [];
                    if (changeLogByQuestionId[scenario1BKey]) {
                        const log = changeLogByQuestionId[scenario1BKey];
                        scenario1BChangeLog = (log && log.length > 1) ? log : [];
                    }

                    answers.push({
                        "questionId": scenario1B.questionId,
                        "stageType": "stage_two",
                        "scenarioType": "scenario_1B",
                        "selectedOption": choice?.id,
                        "status": scenario1B.selectedAnswer === undefined ? "skipped" : "answered",
                        "totalTimeTaken": item.totalTimeTaken,
                        "timeTakenForFirst": item.timeTakenForFirst || 0,
                        "visitCount": item.visits || 0,
                        "accuracy": 50,
                        "switched": scenario1B.selectedAnswer === undefined ? true : false,
                        "confidence": 50,
                        "changeLog": scenario1BChangeLog,
                    });
                }

                return answers;

            } else {
                const choice = findOptionByText(item.options, item.selectedOption);
                console.log("chnage-log-normal", item)

                // For SCRIPT_CONCORDANCE type questions
                let selectedOption;
                let changeLog = [];

                if (item.question_type === "SCRIPT_CONCORDANCE") {
                    // Selected option is the last value of changeLog
                    if (item.changeLog && item.changeLog.length > 0) {
                        selectedOption = item.changeLog[item.changeLog.length - 1];
                        // changeLog should be [] if undefined or has 1 or no elements
                        changeLog = item.changeLog.length > 1 ? item.changeLog : [];
                    } else {
                        selectedOption = undefined;
                        changeLog = [];
                    }
                } else {
                    selectedOption = choice?.id;
                    // For other question types, handle changeLog the same way
                    if (item.changeLog && item.changeLog.length > 1) {
                        changeLog = item.changeLog;
                    } else {
                        changeLog = [];
                    }
                }

                return ({
                    "questionId": item.questionId,
                    "selectedOption": selectedOption,
                    "status": item.status === "attempted" ? "answered" : item.status,
                    "totalTimeTaken": item.totalTimeTaken,
                    "timeTakenForFirst": item.timeTakenForFirst || 0,
                    "visitCount": item.visits || 0,
                    "accuracy": 50,
                    "switched": changeLog.length > 0,
                    "confidence": 50,
                    "changeLog": changeLog
                })
            }
        })

        const finalAnswer = {
            "userId": userId,
            "attemptId": attemptId,
            answers: answers.flat()
        }

        console.log("final answers::==>", finalAnswer)

        try {
            const response = await axios.post(API_URL, finalAnswer, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            await axios.post(process.env.NEXT_PUBLIC_PM_BASE_URL + EXAM_COMPLETE, {
                "userId": userId,
                "attemptId": attemptId,
            })
            localStorage.removeItem("aco-exam-time")
            setLoadingSubmit(false)
            router.push("/assesment/dash/" + attemptId);
            console.log("Submission successful:", response.data);

        } catch (error: any) {
            console.error("Submission failed:", error.message || error);
        }
    };

    const updateAnalysisParameters = (
        currentQuestion: Question,
        newValue: string | undefined,
        type: "normal" | "review",
        isNext: boolean
    ) => {
        const hadPreviousAnswer = currentQuestion.selectedOption !== undefined ||
            (currentQuestion.question_type === "CASE_BASED" &&
                currentQuestion.subQuestionAnswers &&
                currentQuestion.subQuestionAnswers.length > 0);

        const hasNewAnswer = newValue !== undefined && newValue !== "";

        if (isNext) {
            // Moving forward
            setAnalysisParameter((prev) => {
                let newState = { ...prev };

                // Decrease pending
                newState.pending = Math.max(0, prev.pending - 1);

                if (type === "review") {
                    // If marking for review
                    if (!hadPreviousAnswer) {
                        // Was pending, now review
                        newState.review = prev.review + 1;
                    } else {
                        // Was attempted, now review
                        newState.attempted = Math.max(0, prev.attempted - 1);
                        newState.review = prev.review + 1;
                    }
                } else {
                    // Normal navigation
                    if (hasNewAnswer) {
                        // Has answer - mark as attempted
                        newState.attempted = prev.attempted + 1;
                    } else {
                        // No answer - mark as skipped
                        newState.skip = prev.skip + 1;
                    }
                }

                return newState;
            });
        } else {
            // Moving backward - reverse the previous operation
            const nextQuestion = questionList[count + 1];
            if (nextQuestion) {
                setAnalysisParameter((prev) => {
                    let newState = { ...prev };

                    // Increase pending (going back)
                    newState.pending = prev.pending + 1;

                    // Reverse the previous classification
                    if (nextQuestion.status === "review") {
                        newState.review = Math.max(0, prev.review - 1);
                    } else if (nextQuestion.status === "attempted") {
                        newState.attempted = Math.max(0, prev.attempted - 1);
                    } else if (nextQuestion.status === "skipped") {
                        newState.skip = Math.max(0, prev.skip - 1);
                    }

                    return newState;
                });
            }
        }
    };


    function segregateQuestionCodes(questionArray) {
        const result = {};

        // Filter out undefined/null values and process valid entries
        questionArray
            .filter(item => item && typeof item === 'string')
            .forEach(questionCode => {
                // Extract parts using regex
                // Pattern: CBQ_9508GSX81XO2_sub_1-A
                const match = questionCode.match(/^(.+)_sub_(\d+)-([A-E])$/);

                if (match) {
                    const [, baseCode, subNumber, option] = match;
                    const subKey = `${baseCode}_sub_${subNumber}`;

                    // Initialize array if it doesn't exist
                    if (!result[subKey]) {
                        result[subKey] = [];
                    }

                    // Add the option letter to the array
                    result[subKey].push(option);
                }
            });

        return result;
    }

    function segregateMultiLogicValuesWithOrder(changeArray: string[]) {
        const result: Record<string, string[]> = {};

        changeArray.forEach(entry => {
            const lastHyphenIndex = entry.lastIndexOf('-');

            if (lastHyphenIndex === -1) {
                return;
            }

            const baseKey = entry.substring(0, lastHyphenIndex);
            const optionLetter = entry.substring(lastHyphenIndex + 1);

            // Initialize array if it doesn't exist
            if (!result[baseKey]) {
                result[baseKey] = [];
            }

            // Always add to maintain order (allows duplicates to show selection changes)
            result[baseKey].push(optionLetter);
        });

        return result;
    }

    const handleNextQuestion = (id: number, value: string | undefined, firstTime: number, type: "normal" | "review", payload: {
        timeSpent: number, changes: string[], attempts: number
    }) => {
        console.log("Next question:", id, value, type, payload);


        const currentQuestion = questionList.find(q => q.id === id);
        if (!currentQuestion) return;

        // Update analysis parameters
        updateAnalysisParameters(currentQuestion, value, type, true);

        // Update question list
        const updatedQuestionList = questionList.map((item) => {
            if (item.id === id) {
                if (item.question_type === "CASE_BASED") {
                    let parsedSubAnswers: SubQuestionAnswer[] = [];

                    try {
                        if (value) {
                            const parsedValue = JSON.parse(value);
                            if (Array.isArray(parsedValue)) {
                                parsedSubAnswers = parsedValue;
                            } else {
                                parsedSubAnswers = Object.entries(parsedValue).map(([subQuestionId, selectedAnswer]) => ({
                                    subQuestionId,
                                    selectedAnswer: selectedAnswer as string
                                }));
                            }
                        }
                    } catch (error) {
                        console.error("Error parsing sub-question answers:", error);
                        parsedSubAnswers = [];
                    }

                    const updatedSubQuestions = item.sub_questions?.map(subQ => {
                        const answer = parsedSubAnswers.find(ans => ans.subQuestionId === subQ.question_id);
                        return {
                            ...subQ,
                            selectedAnswer: answer?.selectedAnswer
                        };
                    });


                    return {
                        ...item,
                        selectedOption: value,
                        subQuestionAnswers: parsedSubAnswers,
                        sub_questions: updatedSubQuestions,
                        totalTimeTaken: payload.timeSpent,
                        changeLog: payload.changes,
                        visits: item.visits,
                        timeTakenForFirst: firstTime,
                        totalChanges: payload.attempts,
                        status: type === "review" ? "review" :
                            value === undefined || value === "" ? "skipped" : "attempted"
                    };
                }
                else if (item.question_type === "MULTI_LOGIC") {
                    let parsedSubAnswers: MultiChoiceAnswer[] = [];
                    try {
                        if (value) {
                            const parsedValue = JSON.parse(value);
                            if (Array.isArray(parsedValue)) {
                                parsedSubAnswers = parsedValue;
                            } else {
                                parsedSubAnswers = Object.entries(parsedValue).map(([questionId, selectedAnswer]) => ({
                                    questionId,
                                    selectedAnswer: selectedAnswer

                                }));
                            }
                        }
                    } catch (error) {
                        console.error("Error parsing sub-question answers:", error);
                        parsedSubAnswers = [];
                    }


                    console.log("parsed answers:::", parsedSubAnswers)

                    return {
                        ...item,
                        stages: [
                            {
                                stage_one: {
                                    questionId: parsedSubAnswers[0].questionId,
                                    selectedAnswer: parsedSubAnswers[0].selectedAnswer,
                                    options: item.stages[0].stage_one.options
                                }
                            }, {
                                stage_two: [{
                                    scenario_1A: {
                                        questionId: parsedSubAnswers[1].questionId,
                                        selectedAnswer: parsedSubAnswers[1].selectedAnswer,
                                        options: item.stages[1].stage_two[0].scenario_1A.options
                                    }
                                }, {
                                    scenario_1B: {
                                        questionId: parsedSubAnswers[2].questionId,
                                        selectedAnswer: parsedSubAnswers[2].selectedAnswer,
                                        options: item.stages[1].stage_two[1].scenario_1B.options
                                    }
                                }]
                            }
                        ],
                        selectedOption: value,
                        totalTimeTaken: payload.timeSpent,
                        changeLog: payload.changes,
                        visits: item.visits,
                        timeTakenForFirst: firstTime,
                        totalChanges: payload.attempts,
                        status: type === "review" ? "review" :
                            value === undefined || value === "" ? "skipped" : "attempted"
                    };

                }
                else {
                    return {
                        ...item,
                        selectedOption: value,
                        totalTimeTaken: payload.timeSpent,
                        changeLog: payload.changes,
                        totalChanges: payload.attempts,
                        timeTakenForFirst: firstTime,
                        visits: item.visits,
                        status: type === "review" ? "review" :
                            value === undefined || value === "" ? "skipped" : "attempted"
                    };
                }
            }
            return item;
        });

        setQuestionList(updatedQuestionList);

        // Navigate to next question
        if (count < questionList.length - 1) {
            const nextCount = count + 1;
            setCount(nextCount);

            // Update visit count for the next question
            const nextQuestionId = updatedQuestionList[nextCount].id;
            const finalUpdatedQuestions = updateVisitCount(nextQuestionId, updatedQuestionList, nextCount);

            // Set selected value for the next question
            const nextQuestion = finalUpdatedQuestions[nextCount];
            if (nextQuestion?.question_type === "CASE_BASED" || nextQuestion?.question_type === "MULTI_LOGIC") {
                setSelected(undefined);
            } else {
                setSelected(nextQuestion?.selectedOption);
            }
        } else {
            // Last question - submit
            if (type === "normal") {
                const submissionPayload = {
                    "userId": userId,
                    "examId": newData?.examId || "default_exam_id",
                    "attemptId": "",
                    "answers": updatedQuestionList
                };
                console.log("final answer:::", submissionPayload)
                submitAnswers(submissionPayload);

            }
        }
    };

    const handlePrevQuestion = (id: number, value: string | undefined, type: "normal" | "review", payload: {
        timeSpent: number, changes: string[][], attempts: number
    }) => {
        console.log("Previous question:", id, value, type, payload);

        if (count === 0) return; // Can't go back from first question

        const currentQuestion = questionList.find(q => q.id === id);
        if (!currentQuestion) return;

        // Update analysis parameters for going backward
        updateAnalysisParameters(currentQuestion, value, type, false);

        // Update current question data (WITHOUT incrementing visit count)
        const updatedQuestionList = questionList.map((item) => {
            if (item.id === id) {
                if (item.question_type === "CASE_BASED") {
                    let parsedSubAnswers: SubQuestionAnswer[] = [];
                    try {
                        if (value) {
                            const parsedValue = JSON.parse(value);
                            if (Array.isArray(parsedValue)) {
                                parsedSubAnswers = parsedValue;
                            } else {
                                parsedSubAnswers = Object.entries(parsedValue).map(([subQuestionId, selectedAnswer]) => ({
                                    subQuestionId,
                                    selectedAnswer: selectedAnswer as string
                                }));
                            }
                        }
                    } catch (error) {
                        console.error("Error parsing sub-question answers:", error);
                        parsedSubAnswers = [];
                    }

                    const updatedSubQuestions = item.sub_questions?.map(subQ => {
                        const answer = parsedSubAnswers.find(ans => ans.subQuestionId === subQ.question_id);
                        return {
                            ...subQ,
                            selectedAnswer: answer?.selectedAnswer
                        };
                    });

                    return {
                        ...item,
                        selectedOption: value,
                        subQuestionAnswers: parsedSubAnswers,
                        sub_questions: updatedSubQuestions,
                        totalTimeTaken: payload.timeSpent,
                        changeLog: payload.changes,
                        totalChanges: payload.attempts,
                        // Remove the visit increment here - keep the existing count
                        visits: item.visits, // Don't increment when leaving a question
                        status: type === "review" ? "review" :
                            value === undefined || value === "" ? "skipped" : "attempted"
                    };
                } else {
                    return {
                        ...item,
                        selectedOption: value,
                        totalTimeTaken: payload.timeSpent,
                        changeLog: payload.changes,
                        totalChanges: payload.attempts,
                        // Remove the visit increment here - keep the existing count
                        visits: item.visits, // Don't increment when leaving a question
                        status: type === "review" ? "review" :
                            value === undefined || value === "" ? "skipped" : "attempted"
                    };
                }
            }
            return item;
        });

        setQuestionList(updatedQuestionList);

        // Navigate to previous question
        const prevCount = count - 1;
        setCount(prevCount);

        // ONLY increment visit count for the question we're navigating TO (the previous question)
        const prevQuestionId = updatedQuestionList[prevCount].id;
        const finalUpdatedQuestions = updateVisitCount(prevQuestionId, updatedQuestionList, prevCount);

        // Set selected value for the previous question
        const targetPrevQuestion = finalUpdatedQuestions[prevCount];
        if (targetPrevQuestion?.question_type === "CASE_BASED") {
            setSelected(undefined);
        } else {
            setSelected(targetPrevQuestion?.selectedOption);
        }
    };

    // Add bounds checking and loading states
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-white">Loading questions...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-500">Error: Invalid QuestionBank Id</div>
            </div>
        );
    }

    const currentQuestion = questionList[count];

    if (!currentQuestion) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-white">No questions available</div>
            </div>
        );
    }



    console.log("Attempt ID", attemptId, questionList)

    return (
        <div className={` ${fullScreen ? "h-screen fixed inset-0 top-0 z-20 m-4" : "h-auto"} `}>
            <ScrollArea className={` ${fullScreen ? "" : "pb-40"} px-[35px]  h-screen w-full darbg-[#0F1012] rounded-3xl`}>
                <div className={` h-full w-full flex flex-col justify-center `}>
                    <div className="w-full gap-[30px] 2xl:gap-[25px] mt-2 max-sm:mt-0 flex flex-col justify-center">
                        <section className=" flex flex-col justify-center w-full h-fit max-sm:pt-0 pt-6">
                            <TestAssistance
                                totalTime={examTime}
                                questions={questionList}
                                attemptId={attemptId}
                                currentQuestion={count}
                                parameters={analysisParameter}
                                fullScreen={() => setFullScreen(!fullScreen)}
                            />
                        </section>
                        <section className={`h-full w-full flex flex-col justify-start items-start`}>
                            <QuestionCard
                                totalQuestions={questionList.length}
                                next={handleNextQuestion}
                                prev={handlePrevQuestion}
                                data={currentQuestion}
                                retake={() => setCount(0)}
                                onReview={() => alert("Marked for review")}
                                onPrevious={() => alert("Going to previous question")}
                                onSeeWhy={() => alert("Show explanation")}
                                select={selected}
                                // submitData={handleSubmitData}
                                handleSelected={(val: string) => setSelected(val)}
                                loading={loadingSubmit}
                                attemptId={attemptId}
                            />
                        </section>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}