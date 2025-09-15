"use client"

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuestionCard from "./questions";
import TestAssistance from "./testAssistance";
import axios from 'axios';
import { useRouter } from "next/navigation";
import useUserId from "@/hooks/useUserId";
import { EXAM_COMPLETE, EXTRACT_QUESTIONS, START_EXAM, SUBMIT_ANSWERS } from "../api/url";
import { segregateQuestionCodes, segregateQuestionCodesMultiLogic, convertTimeToSecondsNumber, findOptionByText } from "@/lib/utils";
import { Question, SubQuestionAnswer } from "../dataTypes";



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
    const [isSimulated, setIsSimulated] = useState(false)
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

        const updatedQuestions = questionsList.map((item, index) => {
            if (index === count) {
                return {
                    ...item,
                    visits: item.visits + 1
                };
            }
            return item;
        });

        setQuestionList(updatedQuestions);
        return updatedQuestions;
    };

    useEffect(() => {
        if (userId) { fetchData(); }

    }, [userId]);


    const fetchData = async () => {
        const url = window.location.pathname;
        const id = url.split('/').pop()

        const StartExam = process.env.NEXT_PUBLIC_PM_BASE_URL + START_EXAM
        const API_URL = process.env.NEXT_PUBLIC_PM_BASE_URL + EXTRACT_QUESTIONS + id;
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

            const examTimes = localStorage.getItem("aco-isSimulated") === "false" ? 0 : convertTimeToSecondsNumber(localStorage.getItem("aco-exam-time") || "30min")

            setExamTime(examTimes)

            const response = await axios.get(API_URL);
            const data = response.data.question;
            setNewData(data);


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
                visits: 0,
                timeTakenForFirst: 0,

                subQuestionAnswers: q.question_type === "CASE_BASED" ? [] : undefined,

                sub_questions: q.sub_questions ? q.sub_questions?.map((subQ: any) => ({
                    ...subQ,
                    selectedAnswer: undefined
                })) : q.subQuestions?.map((subQ: any) => ({
                    ...subQ,
                    selectedAnswer: undefined
                }))
            }));



            setAnalysisParameter((prev) => ({ ...prev, pending: data.length - 1 }));
            setQuestionList(enrichedQuestions);

            // Set initial selected value for first question
            const firstQuestion = enrichedQuestions[0];
            if (firstQuestion?.question_type !== "CASE_BASED" || firstQuestion?.question_type !== "MULTI_LOGIC") {
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


    const submitAnswers = async (payload: any) => {
        setLoadingSubmit(true)
        const API_URL = process.env.NEXT_PUBLIC_PM_BASE_URL + SUBMIT_ANSWERS;
        console.log("payload:::", payload)
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
                const changeLogByQuestionId = item.changeLog && item.changeLog.length > 0 ? segregateQuestionCodesMultiLogic(item.changeLog) : "";
                console.log("changeLogByQuestionId=>", changeLogByQuestionId)
                const answers = item.sub_questions.map((newItem) => {
                    const choice = findOptionByText(newItem.options, newItem.selectedAnswer);


                    // Get changeLog for this question - return [] if undefined or has 1 or no elements
                    let questionChangeLog = [];
                    if (changeLogByQuestionId && changeLogByQuestionId[newItem?.questionId]) {
                        const log = changeLogByQuestionId[newItem?.questionId];
                        questionChangeLog = (log && log.length > 1) ? log : [];
                    }
                    console.log("questionChangeLog=>", changeLogByQuestionId)
                    return ({
                        "questionId": newItem.questionId,
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
            } else {
                const choice = findOptionByText(item.options, item.selectedOption);


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
        const url = window.location.pathname;
        const id = url.split('/').pop()

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
            router.push("/assesment/dash/" + id);
            console.log("Submission successful:", response.data);

        } catch (error: any) {
            console.error("Submission failed:", error.message || error);
        }
    };

    function getQuestionStatsSimple(data) {
        const reviewCount = data.filter(item => item.status?.toLowerCase() === 'review').length;
        const skippedCount = data.filter(item => item.status?.toLowerCase() === 'skipped').length;
        const attemptedCount = data.filter(item =>
            item.status?.toLowerCase() === 'attempted' ||
            (item.selectedOption && item.selectedOption !== undefined) ||
            (item.selectedAnswer && item.selectedAnswer !== undefined)
        ).length;

        return {
            review: reviewCount,
            skip: skippedCount,
            attempted: attemptedCount,
            pending: questionList.length - count
        };
    }

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
                    // if (nextQuestion.status === "review") {
                    //     newState.review = Math.max(0, prev.review - 1);
                    // } else if (nextQuestion.status === "attempted") {
                    //     newState.attempted = Math.max(0, prev.attempted - 1);
                    // } else if (nextQuestion.status === "skipped") {
                    //     newState.skip = Math.max(0, prev.skip - 1);
                    // }

                    return newState;
                });
            }
        }
    };



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

                        parsedSubAnswers = [];
                    }

                    const updatedSubQuestions = item.sub_questions?.map(subQ => {
                        const answer = parsedSubAnswers.find(ans => ans.subQuestionId === subQ.questionId);
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
        const parameters = getQuestionStatsSimple(updatedQuestionList);

        setQuestionList(updatedQuestionList);

        console.log("updatedQuestionList", updatedQuestionList)
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
            const pendingQuestions = updatedQuestionList.filter((item) => item.status === "pending")
            setAnalysisParameter((prev) => ({ ...prev, ...parameters, pending: pendingQuestions.length - 1 }));
        } else {
            // Last question - submit
            if (type === "normal") {
                const submissionPayload = {
                    "userId": userId,
                    "examId": newData?.examId || "default_exam_id",
                    "attemptId": "",
                    "answers": updatedQuestionList
                };

                submitAnswers(submissionPayload);

            }
        }
    };

    const handlePrevQuestion = (id: number, value: string | undefined, type: "normal" | "review", payload: {
        timeSpent: number, changes: string[], attempts: number
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
                            value === undefined || value === "" ? "pending" : "attempted"
                    };
                }
                else if (item.question_type === "MULTI_LOGIC") {
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
                        const answer = parsedSubAnswers.find(ans => ans.subQuestionId === subQ.questionId);
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
                            value === undefined || value === "" ? "pending" : "attempted"
                    };
                }
                else {
                    return {
                        ...item,
                        selectedOption: value,
                        totalTimeTaken: payload.timeSpent,
                        changeLog: payload.changes,
                        totalChanges: payload.attempts,
                        // timeTakenForFirst: firstTime,
                        visits: item.visits,
                        status: type === "review" ? "review" :
                            value === undefined || value === "" ? "pending" : "attempted"
                    };
                }
            }
            return item;
        });

        setQuestionList(updatedQuestionList);
        const parameters = getQuestionStatsSimple(updatedQuestionList);

        const pendingQuestions = updatedQuestionList.filter((item) => item.status === "pending")
        setAnalysisParameter((prev) => ({ ...prev, ...parameters, pending: pendingQuestions.length - 1 }));

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



    // console.log("Attempt ID", attemptId, questionList, count)

    return (
        <div className={` ${fullScreen ? "h-screen fixed inset-0 top-0 z-20 m-4 " : "h-auto"} bg-[#0F1012] `}>
            <ScrollArea className={` ${fullScreen ? " pb-10  rounded-3xl" : "pb-40 rounded-b-3xl"}  h-screen w-full   bg-[#181A1D]`}>
                <div className={` h-full w-full flex flex-col justify-center px-[35px]  dark:bg-[#0F1012] bg-[#EBEBF5] rounded-b-3xl`}>
                    <div className="w-full h-full gap-[30px] 2xl:gap-[25px] mt-2 max-sm:mt-0 flex flex-col justify-center mb-20">
                        <section className=" flex flex-col justify-center w-full h-fit max-sm:pt-0 pt-6">
                            <TestAssistance
                                totalTime={examTime}
                                questions={questionList}
                                attemptId={attemptId}
                                currentQuestion={count}
                                moveQuestion={(val: number) => {
                                    setCount(val)
                                    const pendingQuestions = questionList.filter((item) => item.status === "pending")
                                    console.log("pending list ", pendingQuestions)
                                    setAnalysisParameter((prev) => ({ ...prev, pending: pendingQuestions.length }))
                                }}
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