"use client"

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuestionCard from "./questions";
import axios from 'axios';
import useUserId from "@/hooks/useUserId";
import { EXAM_COMPLETE, EXTRACT_QUESTIONS, START_EXAM, SUBMIT_ANSWERS } from "../api/url";
import { segregateQuestionCodes, segregateQuestionCodesMultiLogic, convertTimeToSecondsNumber, findOptionByText } from "@/lib/utils";
import { Question, SubQuestionAnswer } from "../dataTypes";
import TestAssistance from "./testAssistance";
import { useRouter } from "next/navigation";



export default function ReviewTest() {
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
    const router = useRouter()
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


    const DEFAULT_OPTIONS = [
        { id: 'A', text: 'Tympanometry' },
        { id: 'B', text: 'MRI of the head' },
        { id: 'C', text: 'Pure-tone audiometry' },
        { id: 'D', text: 'CT temporal bone' },
        { id: 'E', text: 'Vestibular testing' }
    ];

    // Helper function to update visit count


    useEffect(() => {
        if (userId) { fetchData(); }

    }, [userId]);


    const fetchData = async () => {
        const url = window.location.pathname;
        const id = url.split('/').pop()


        const API_URL = process.env.NEXT_PUBLIC_PM_BASE_URL + "/dev/v1/exam/review?attemptId=" + id;
        try {



            const examTimes = convertTimeToSecondsNumber(localStorage.getItem("aco-exam-time") || "30min")

            setExamTime(examTimes)

            const response = await axios.get(API_URL);
            const data = response.data.data.questions;
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



        if (count < questionList.length - 1) {
            const nextCount = count + 1;
            setCount(nextCount);
        } else {
            // Last question - submit

            const storedAttemptId = localStorage.getItem("aco-attempt")
            router.push("/assesment/dash/" + storedAttemptId)

        }
    }



    const handlePrevQuestion = (id: number, value: string | undefined, type: "normal" | "review", payload: {
        timeSpent: number, changes: string[], attempts: number
    }) => {
        console.log("Previous question:", id, value, type, payload);

        if (count === 0) return; // Can't go back from first question

        const currentQuestion = questionList.find(q => q.id === id);
        if (!currentQuestion) return;

        updateAnalysisParameters(currentQuestion, value, type, false);

        const prevCount = count - 1;
        setCount(prevCount);


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

    console.log("currentQuestion::", currentQuestion)
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