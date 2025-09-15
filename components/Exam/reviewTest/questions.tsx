"use client"
import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronFirst, ChevronLast, RotateCcw } from "lucide-react";
import Image from "next/image"
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";

import { Card, CardContent } from "@/components/ui/card";
import ExplanationUI from "../UI/explanation-UI";
import HeartMurmurComparison from "../dailytest/qType-compareMatch";
import ClinicalCaseCard from "../dailytest/qType-caseCards";
import ScriptConcordanceTest from "../dailytest/qType-scriptConcordanceTest";
import MultiLogicQuestions from "../dailytest/qType-multiLogic";
import Mcq from "./rType-mcq";
import FeedBack from "./rtype-feedback";

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

interface SubQuestionAnswer {
    subQuestionId: string;
    selectedAnswer: string;
}


interface QuestionCardProps {
    data: {
        userAnswer: any;
        correctAnswer: any;
        // changeLog: string[][],
        changeLog: string[],
        clinical_domain: string,
        difficulty_level: string,
        difficulty_domain: string,
        question_text?: string;
        questionId: string,
        questionType: string,
        selectedOption: string | undefined,
        status: string,
        stem: string,
        timeTakenForFirst: number,
        subtopic: string,
        totalTimeTaken: number,
        sub_questions?: {
            question_id: string,
            question_text: string,
            options: { id: string, text: string }[],
            selectedAnswer?: string,
            changeLog?: string[]
        }[],
        subQuestionAnswers?: SubQuestionAnswer[],
        "initial_hypothesis"?: string,
        "new_information"?: string,
        "clinical_vignette"?: string,
        topic: string,
        totalChanges: number,
        type: string,
        photo: string,
        id: number,
        case_scenario?: CaseScenario,
        list_a?: { id: string, text: string }[],
        list_b?: { id: string, text: string }[],
        options?: { id: string, text: string }[],
        response_scale?: { value: string, text: string }[],
        explanation?: { label: string, explanation: string, isCorrect: boolean }[]
    },
    onReview: () => void;
    onPrevious: () => void;
    onSeeWhy: () => void;
    next: (id: number, val: string | undefined, firstTime: number, type: "normal" | "review", payload: {
        timeSpent: number, changes: string[], attempts: number
    }) => void;
    prev: (id: number, val: string | undefined, type: "normal" | "review", payload: {
        timeSpent: number, changes: string[], attempts: number
    }) => void;
    retake: () => void;
    photo?: string;
    select: string | undefined;
    handleSelected: (val: string) => void;
    totalQuestions: number,
    submitData: () => void;
    loading: boolean
}

// Union schema that handles both cases
export const questionSchema = z.object({
    selectedOption: z.string().optional(), // For single questions
    subQuestions: z.record(z.string(), z.string().optional()).optional(), // For case-based
    stage_one: z.string().optional(),
    stage_two: z.record(z.string(), z.string().optional()).optional()
});

type QuestionFormValues = z.infer<typeof questionSchema>;

const difficultyLevel: Record<number, string> = {
    1: "Easy",
    2: "Medium",
    3: "Hard",
    4: "Very Hard",
    5: "Extremely Hard",
    6: "Insanely Hard"
}

const questionType: Record<string, string> = {
    "EXTENDED_MATCHING": "Extended Matching Question",
    "MCQ": "Multiple Choice Question (MCQ)",
    "FILL_IN_THE_BLANKS": "Fill-in-the-Blanks Question",
    "CASE_BASED": "Clinical Scenario",
    "MULTI_LOGIC": "Multi-Logic Question",
    "SCRIPT_CONCORDANCE": "Script Concordance Test (SCT)",

}

const QuestionCard: React.FC<QuestionCardProps> = ({
    data,
    next,
    prev,
    totalQuestions,
    loading
}) => {
    const [elaborate, setElaborate] = useState<boolean>(false)
    const [selectedValue, setSselectedValue] = useState<string[]>([])
    const [seeWhy, setSeeWhy] = useState(false)
    // const [changeAnswer, setChangeAnswer] = useState<string[][]>([])
    const [changeAnswer, setChangeAnswer] = useState<string[]>([])
    const [countChanges, setCountChanges] = useState(0)
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [firstTime, setFirstTime] = useState<number>(0)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [stage1Locked, setStage1Locked] = useState(false)
    const [attempted, setAttempted] = useState(false)


    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            selectedOption: "",
            subQuestions: {},

        }
    })

    const { watch, setValue, getValues, reset } = form;
    const selectedOptions = watch('selectedOption')

    useEffect(() => {
        setChangeAnswer(data.changeLog || []);
        setCountChanges(data.totalChanges || 0);
        setSeconds(data.totalTimeTaken || 0);

        // Reset form first
        reset();

        // Initialize form based on question type
        if (data.questionType === "CASE_BASED") {
            // Initialize subQuestions based on stored answers
            const initialSubQuestions: Record<string, string> = {};

            if (data.subQuestionAnswers && data.subQuestionAnswers.length > 0) {
                data.subQuestionAnswers.forEach(answer => {
                    initialSubQuestions[answer.subQuestionId] = answer.selectedAnswer;
                });
            } else if (data.sub_questions) {
                // Initialize from sub_questions if they have selectedAnswer
                data.sub_questions.forEach(subQ => {
                    if (subQ.selectedAnswer) {
                        initialSubQuestions[subQ.question_id] = subQ.selectedAnswer;
                    }
                });
            }

            setValue("subQuestions", initialSubQuestions);
            setValue("selectedOption", undefined);
        } else if (data.questionType === "MULTI_LOGIC") {
            const initialSubQuestions: Record<string, string> = {};

            if (data.subQuestionAnswers && data.subQuestionAnswers.length > 0) {
                data.subQuestionAnswers.forEach(answer => {
                    initialSubQuestions[answer.subQuestionId] = answer.selectedAnswer;
                });
            } else if (data.sub_questions) {
                // Initialize from sub_questions if they have selectedAnswer
                data.sub_questions.forEach(subQ => {
                    if (subQ.selectedAnswer) {
                        initialSubQuestions[subQ.questionId] = subQ.selectedAnswer;
                    }
                });
            }

            setValue("subQuestions", initialSubQuestions);
            setValue("selectedOption", undefined);

            // NEW: Check if stage 1 should be locked
            // Stage 1 is locked if there's already a selection and we're not coming from a future question
            const stage1Question = data.sub_questions?.find(sq => sq.stage === "stage_one");
            if (stage1Question) {
                const hasStage1Selection = stage1Question.selectedAnswer ||
                    (data.subQuestionAnswers &&
                        data.subQuestionAnswers.some(ans => ans.subQuestionId === stage1Question.questionId));

                // Lock stage 1 if there's a selection and we haven't explicitly come from a future question
                setStage1Locked(hasStage1Selection && !data.comingFromFuture);
            }
        } else {
            // For single questions
            setValue("selectedOption", data.selectedOption || '');
            setValue("subQuestions", {});
        }


        setAttempted(data.status === "attempted")
        setSselectedValue([]);
        setSeeWhy(true);
    }, [data.id, reset, setValue]);

    // Timer effect
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);


    // Updated handleCheckboxChange for case-based questions


    const handlePrevious = () => {
        const formData = getValues();
        setSselectedValue([]);
        setStage1Locked(false);
        let submissionValue: string | undefined;

        if (data.questionType === "CASE_BASED") {
            const subQuestionData = formData.subQuestions || {};
            const hasSubAnswers = Object.keys(subQuestionData).some(key =>
                subQuestionData[key] && subQuestionData[key] !== ""
            );
            submissionValue = hasSubAnswers ? JSON.stringify(subQuestionData) : undefined;

            prev(data.id, submissionValue, "normal", {
                timeSpent: seconds,
                changes: changeAnswer,
                attempts: countChanges
            });
        } else if (data.questionType === "MULTI_LOGIC") {
            const subQuestionData = formData.subQuestions || {};
            const hasSubAnswers = Object.keys(subQuestionData).some(key =>
                subQuestionData[key] && subQuestionData[key] !== ""
            );
            submissionValue = hasSubAnswers ? JSON.stringify(subQuestionData) : undefined;

            // NEW: Mark that we're going to previous question (this will allow stage 1 to be editable)
            prev(data.id, submissionValue, "normal", {
                timeSpent: seconds,
                changes: changeAnswer,
                attempts: countChanges,
                // goingToPrevious: true // Add this flag
            });
        } else {
            submissionValue = formData.selectedOption || undefined;

            prev(data.id, submissionValue, "normal", {
                timeSpent: seconds,
                changes: changeAnswer,
                attempts: countChanges
            });
        }

        resetForm();
    };

    const handleNext = () => {
        const formData = getValues();
        setSselectedValue([]);
        setStage1Locked(false);
        let submissionValue: string | undefined;

        if (data.questionType === "CASE_BASED") {
            const subQuestionData = formData.subQuestions || {};
            const hasSubAnswers = Object.keys(subQuestionData).some(key =>
                subQuestionData[key] && subQuestionData[key] !== ""
            );
            submissionValue = hasSubAnswers ? JSON.stringify(subQuestionData) : undefined;

            next(data.id, submissionValue, data.timeTakenForFirst === 0 ? firstTime : data.timeTakenForFirst, "normal", {
                timeSpent: seconds,
                changes: changeAnswer,
                attempts: countChanges
            });
        } else if (data.questionType === "MULTI_LOGIC") {
            const subQuestionData = formData.subQuestions || {};
            const hasSubAnswers = Object.keys(subQuestionData).some(key =>
                subQuestionData[key] && subQuestionData[key] !== ""
            );
            submissionValue = hasSubAnswers ? JSON.stringify(subQuestionData) : undefined;

            next(data.id, submissionValue, data.timeTakenForFirst === 0 ? firstTime : data.timeTakenForFirst, "normal", {
                timeSpent: seconds,
                changes: changeAnswer,
                attempts: countChanges
            });
        } else {
            submissionValue = formData.selectedOption || undefined;

            next(data.id, submissionValue, data.timeTakenForFirst === 0 ? firstTime : data.timeTakenForFirst, "normal", {
                timeSpent: seconds,
                changes: changeAnswer,
                attempts: countChanges
            });
        }

        setFirstTime(0);

        resetForm();
    };

    const handleReview = () => {
        const formData = getValues();
        setSselectedValue([]);
        setStage1Locked(false);
        let submissionValue: string | undefined;

        if (data.questionType === "CASE_BASED") {
            const subQuestionData = formData.subQuestions || {};
            const hasSubAnswers = Object.keys(subQuestionData).some(key =>
                subQuestionData[key] && subQuestionData[key] !== ""
            );
            submissionValue = hasSubAnswers ? JSON.stringify(subQuestionData) : undefined;

            next(data.id, submissionValue, data.timeTakenForFirst === 0 ? firstTime : data.timeTakenForFirst, "review", {
                timeSpent: seconds,
                changes: changeAnswer,
                attempts: countChanges
            });
        } else if (data.questionType === "MULTI_LOGIC") {
            const subQuestionData = formData.subQuestions || {};
            const hasSubAnswers = Object.keys(subQuestionData).some(key =>
                subQuestionData[key] && subQuestionData[key] !== ""
            );
            submissionValue = hasSubAnswers ? JSON.stringify(subQuestionData) : undefined;

            next(data.id, submissionValue, data.timeTakenForFirst === 0 ? firstTime : data.timeTakenForFirst, "review", {
                timeSpent: seconds,
                changes: changeAnswer,
                attempts: countChanges
            });
        } else {
            submissionValue = formData.selectedOption || undefined;

            next(data.id, submissionValue, data.timeTakenForFirst === 0 ? firstTime : data.timeTakenForFirst, "review", {
                timeSpent: seconds,
                changes: changeAnswer,
                attempts: countChanges
            });
        }

        setFirstTime(0);
        resetForm();
    };


    // Reset form when moving to next/previous question
    const resetForm = () => {
        setSeeWhy(false);
        setChangeAnswer([]);
        setCountChanges(0);
        setSeconds(0);
        setIsRunning(true);


    };


    // Handle see why button
    const handleSeeWhy = () => {
        setSeeWhy(true);
        setIsRunning(false);
    };

    const getDifficultyColor = () => {

        switch (JSON.stringify(data.difficulty_level)) {

            case "1":
                return "text-emerald-500 dark:brightness-100 brightness-75";

            case "2":
                return "text-yellow-400 dark:brightness-100 brightness-75";

            case "3":
                return "text-amber-400 dark:brightness-100 brightness-75";


            case "4":
                return "text-amber-600 dark:brightness-100 brightness-75";


            case "5":
                return "text-red dark:brightness-100 brightness-75";


            case "6":
                return "text-red dark:brightness-100 brightness-75";

            default:
                return "text-gray-400 dark:brightness-100 brightness-75";
        }
    };




    return (
        <div className="text-white rounded-lg  w-full h-full">

            <div className="w-full h-full grid grid-cols-2 max-md:grid-cols-1 md:gap-[35px] 2xl:gap-[52px]">


                <div className={`w-full h-full  ${elaborate ? "hidden" :
                    data.photo && (seeWhy || attempted) ? "col-span-1" :
                        data.photo && !(seeWhy || attempted) ? "col-span-1" :  // assuming photo overrides
                            !data.photo && !(seeWhy || attempted) ? "col-span-2" :
                                "col-span-1"}`}>

                    <Form {...form}>
                        {/* Question header */}
                        <div className="2xl:space-y-7 space-y-4 mb-10 2xl:mb-10">
                            <h2 className="font-bold text-[15px] text-[#36AF8D] tracking-wider">{questionType[data?.questionType]} :</h2>
                            {(data.questionType !== "SCRIPT_CONCORDANCE" && data.questionType !== "MULTI_LOGIC") && <h3 className="font-[futureHeadLine] tracking-wide md:text-[15px] text-[13px] font-regular dark:font-medium text-start dark:text-white text-black ">{data.stem || data.question_text}</h3>}

                            {data.questionType === "EXTENDED_MATCHING" && <HeartMurmurComparison listA={data?.list_a ?? []} listB={data?.list_b ?? []} />}
                            {data.questionType === "CASE_BASED" && data.case_scenario && <ClinicalCaseCard caseScenario={data.case_scenario} />}
                            {data.questionType === "MULTI_LOGIC" && data.clinical_scenario &&

                                <div className="w-full">
                                    {/* {stages.map((stage, index) => ( */}
                                    <Card className="bg-transparent dark:bg-transparent p-0 border-none shadow-none">
                                        <CardContent className="p-0 border-none shadow-none">
                                            <span className="text-[#36AF8D] font-medium text-[15px] text-nowrap mb-6">Scenario : </span>
                                            <span className="dark:text-white text-black  font-medium text-[15px] mb-4">{data.clinical_scenario}</span>
                                        </CardContent>
                                    </Card>
                                </div>
                            }

                            {data.questionType === "SCRIPT_CONCORDANCE" && <ScriptConcordanceTest
                                hypothesis={data.initial_hypothesis || ""}
                                info={data.new_information || ""}
                                vignette={data.clinical_vignette || ""}
                                question={data.question_text || ""}
                            />}

                            <div className="flex justify-between items-center 2xl:text-[16px] text-[13px] font-[futureHeadLine] font-normal  tracking-wide">
                                <span className={getDifficultyColor()}>Difficulty : {difficultyLevel[Number(data.difficulty_level)] || data.difficulty_level}</span>
                                <span className="text-[#7c7c7c] dark:text-[#aaaaaa]">Topic : {data.topic}</span>
                            </div>
                        </div>

                        {data.questionType === "MULTI_LOGIC" && (
                            <>

                                {data.subQuestions?.map((item, index) => (
                                    <>

                                        {
                                            item.stage === "stage_one" &&
                                            <div key={item.question_id} className="mb-8 text-dark-100">

                                                <MultiLogicQuestions
                                                    stages={{ description: item?.description, question_text: item?.question_text }}
                                                    name={`Stage One`}
                                                />


                                                <Mcq
                                                    form={form}
                                                    options={item.options ?? []}
                                                    selectedOptions={item?.userAnswer?.selectedOption} // "C"
                                                    correctAnswer={item?.correct_answer} // "A"
                                                    seeWhy={seeWhy}

                                                />
                                            </div>

                                        }



                                        {item.stage === "stage_two" &&
                                            <div key={item.question_id} className="mb-8">
                                                <MultiLogicQuestions
                                                    stages={{ description: item?.description, question_text: item?.question_text }}
                                                    name={`Stage Two${item?.scenario === "scenario_1B" ? " : Scenario B" : " : Scenario A"}`}
                                                />
                                                <Mcq
                                                    form={form}
                                                    options={item.options ?? []}
                                                    selectedOptions={item?.userAnswer?.selectedOption} // "C"
                                                    correctAnswer={item?.correct_answer} // "A"
                                                    seeWhy={seeWhy}

                                                />
                                            </div>
                                        }
                                    </>
                                ))}
                            </>
                        )}
                        {/* Questions based on type */}
                        {(data.questionType === "MCQ") &&
                            <Mcq
                                form={form}
                                options={data.options ?? []}
                                selectedOptions={data?.userAnswer?.selectedOption} // "C"
                                correctAnswer={data?.correctAnswer} // "A"
                                seeWhy={seeWhy}

                            />
                        }
                        {(data.questionType === "FILL_IN_THE_BLANKS") &&
                            <Mcq
                                form={form}
                                options={data.options ?? []}
                                selectedOptions={data?.userAnswer?.selectedOption} // "C"
                                correctAnswer={data?.correctAnswer} // "A"
                                seeWhy={seeWhy}

                            />}

                        {(data.questionType === "EXTENDED_MATCHING") &&
                            <Mcq
                                form={form}
                                options={data.options ?? []}
                                selectedOptions={data?.userAnswer?.selectedOption} // "C"
                                correctAnswer={data?.correctAnswer} // "A"
                                seeWhy={seeWhy}

                            />}

                        {(data.questionType === "CASE_BASED") &&
                            <>
                                {data.sub_questions?.map((item, index) => {
                                    // const subQuestionAnswers = watch('subQuestions') || {};
                                    // const selectedForThisSubQuestion = subQuestionAnswers[item.question_id];
                                    const correctAns = item?.options.find(option => option.text === item?.correctAnswer)



                                    return (
                                        <div key={item.question_id} className="mb-8">
                                            <h3 className="2xl:text-[18px] text-[15px] font-medium text-start mb-6 dark:text-white text-black">
                                                {item.question_text}
                                            </h3>
                                            <Mcq
                                                form={form}
                                                options={item.options}
                                                selectedOptions={item?.userAnswer?.selectedOption}// "C"
                                                correctAnswer={correctAns?.id} // "A"
                                                seeWhy={seeWhy}


                                            />
                                        </div>
                                    );
                                })}
                            </>
                        }

                        {(data.questionType === "SCRIPT_CONCORDANCE") &&
                            <FeedBack
                                form={form}
                                options={data?.response_scale
                                }
                                selectedOptions={data?.userAnswer?.selectedOption}// "C"
                                correctAnswer={data?.correctAnswer} // "A"
                                seeWhy={seeWhy}

                            />}

                        {/* Footer Buttons */}
                        <div className="flex justify-end  gap-4 2xl:gap-[30px]  mt-6 max-md:mb-20">
                            <Button
                                variant={"default"}
                                size={"sm"}
                                className="bg-[#DC9123] dark:bg-[#282A2E] hover:bg-[#DC9123]/70 border
                                 border-[#6D4914] dark:border-none  dark:hover:bg-[#36AF8D]  text-white dark:text-white
                                  items-center align-middle flex justify-between font-[futureHeadlineBold] font-thin tracking-wide
                     rounded-[9px] text-base 2xl:py-[24px] 2xl:px-[26px] px-[14px] py-[13px] "
                                onClick={handlePrevious}
                                disabled={data.id === 1}
                            >
                                {/* <Image
                                    src={backIcon}
                                    height={12}
                                    width={12}
                                    alt={"icon"}
                                    className="w-5 h-5 object-contain grayscale"
                                /> */}

                                <ChevronFirst size={48} className="w-12 h-12 scale-150" />

                                <p className="2xl:text-[20px] text-center">Previous</p>
                            </Button>


                            {data.id !== totalQuestions ?
                                <Button
                                    variant={"default"}
                                    size={"sm"}
                                    className="bg-[#36AF8D] dark:bg-[#36AF8D]  hover:bg-emerald-300 dark:hover:bg-emerald-300
                                     dark:border-none text-white items-center align-center flex justify-between
                     font-[futureHeadlineBold] font-thin tracking-wide rounded-[9px] text-base 2xl:py-[24px] 2xl:px-[26px] px-[14px] py-[13px]"
                                    onClick={handleNext}
                                // disabled={
                                //     !attempted
                                // }
                                >
                                    <p className="2xl:text-[20px] text-center"> Next</p>
                                    {/* <Image
                                        src={nextIcon}
                                        height={12}
                                        width={12}
                                        alt={"icon"}
                                        className="w-5 h-5 object-contain grayscale"
                                    /> */}

                                    <ChevronLast size={32} className="w-8 h-8 scale-150" />
                                </Button>
                                :


                                <AlertDialog open={isDialogOpen} onOpenChange={(open) => {
                                    // Only allow closing if not loading
                                    if (!loading) {
                                        setIsDialogOpen(open);
                                    }
                                }}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant={"default"}
                                            size={"sm"}
                                            className="bg-[#36AF8D] dark:bg-[#36AF8D] tracking-normal hover:bg-emerald-300 dark:hover:bg-emerald-300 dark:border-none text-white items-center align-center flex justify-between
                 font-semibold rounded-[9px] text-base 2xl:py-[24px] 2xl:px-[26px] px-[14px] py-[13px]"
                                            onClick={() => {
                                                setIsDialogOpen(true)

                                            }
                                            }
                                        // disabled={selectedValue.length === 0}
                                        >
                                            <p className="2xl:text-[20px] text-center"> Exit</p>

                                            <ChevronLast size={32} className="w-8 h-8 scale-150" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="dark:bg-[#181A1D] bg-white border-none p-7 max-w-2xl">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-[23px] font-bold leading-8 font-[futureHeadline]">Do you want to submit your answers?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-[20px] font-normal leading-6 font-[futureHeadline] ">
                                                This action cannot be undone. Make sure you have reviewed all your answers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="mt-[47px]">
                                            {!loading && (
                                                <AlertDialogCancel className="hover:bg-[#36AF8D] dark:hover:bg-[#36AF8D] font-[futureHeadline] border text-[18px] w-[144px] h-[33px] dark:text-white text-black bg-transparent dark:bg-transparent border-[#36AF8D] dark:border-[#36AF8D]  " onClick={() => setIsDialogOpen(false)}>
                                                    No
                                                </AlertDialogCancel>
                                            )}
                                            <AlertDialogAction
                                                className="hover:bg-[#36AF8D] dark:hover:bg-[#36AF8D] font-[futureHeadline] border text-[18px] min-w-[144px] h-[33px] dark:text-black text-white bg-[#36AF8D] dark:bg-[#36AF8D] border-[#36AF8D] dark:border-[#36AF8D] "
                                                onClick={async () => {
                                                    // Don't let the dialog close automatically
                                                    try {
                                                        await handleNext();
                                                        const url = window.location.pathname;
                                                        const id = url.split('/').pop()
                                                        localStorage.removeItem(`aco-isCompleted-${id}`)
                                                        // Only close after successful completion
                                                        setIsDialogOpen(false);
                                                    } catch (error) {
                                                        console.error("Error during submission:", error);
                                                        // Handle error - dialog stays open
                                                    }
                                                }}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <svg
                                                            aria-hidden="true"
                                                            role="status"
                                                            className="inline w-4 h-4 me-3 text-white animate-spin"
                                                            viewBox="0 0 100 101"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                                        </svg>
                                                        Kindly wait processing your data ...
                                                    </>
                                                ) : (
                                                    "Yes"
                                                )}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            }
                        </div>
                    </Form>
                </div>

                <div className={`w-full h-full max-md:col-span-full  ${!elaborate ? "col-span-1" : "col-span-2"} px-4 overflow-hidden flex flex-col justify-start items-center`}>
                    {elaborate && <h3 className="xl:text-base text-sm font-medium text-start tracking-wide dark:text-white text-white w-full  mb-[23px] ">{data.stem || data.question_text}</h3>}

                    <ExplanationUI elaborate={elaborate} data={data} seeWhy={seeWhy} handleElaborate={(val) => setElaborate(val)} attempted={attempted} />
                </div>
            </div >
        </div >
    );
};

export default QuestionCard;