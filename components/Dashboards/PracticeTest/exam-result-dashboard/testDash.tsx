"use client"

import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { CheckCircle, RefreshCcw, SkipForward, XCircle } from 'lucide-react';
import PerformanceSummary from '@/components/Exam/dailytest/test-analysis';
import TopicInvolvementCard from '@/components/Exam/dailytest/test-testInvolvement';
import QuestionAnalysisCard from '@/components/Exam/dailytest/test-questionAnalysis';
import ConfidenceVsAccuracyCard from '@/components/Exam/dailytest/test-confidenceAccuracy';
import AnswerChangeChartCard from '@/components/Exam/dailytest/test-reviewCharts';
import WeakTopicsTableCard from '@/components/Exam/dailytest/test-tables';
import RecommendationsCard from '@/components/Exam/dailytest/test-recommendation';
import StudyStreakCard from '@/components/Exam/dailytest/test-studyStreak';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


interface ExamResult {
    questionId: string;
    question_type: "EXTENDED_MATCHING" | "FILL_IN_THE_BLANKS" | "MCQ" | "SCRIPT_CONCORDANCE";
    selectedAnswer?: string;
    correctAnswer: string;
    isCorrect: boolean;
    topic: string;
    clinical_domain: string;
    difficulty_level: number;
    timeSpent: number;
    switched: boolean;
    status: "answered" | "skipped" | "reviewed";
    changeLog: string[];
    confidence: number;
    visitCount: number;
}

interface TopicPerformance {
    topic: string;
    correct: number;
    total: number;
    percentage: number;
}

interface WeakTopicDetails {
    incorrectAnswers: number;
    revisits: number;
    changes: number;
    accuracy: string;
}

interface DifficultyLevelStats {
    count: number;
    avgTime: number;
    accuracy: number;
}

interface DifficultyBreakdown {
    easy: DifficultyLevelStats;
    medium: DifficultyLevelStats;
    hard: DifficultyLevelStats;
}

interface RevisitBreakdown {
    zeroRevisits: number;
    oneRevisit: number;
    twoOrMoreRevisits: number;
}

interface ChangePatterns {
    "Incorrect -> Correct": number;
    "Correct -> Incorrect": number;
    "Incorrect -> Incorrect": number;
    "Correct -> Correct": number;
    "Correct": number;
    "Incorrect": number;
}

interface ExamData {
    attemptId: string;
    examTopic: string;
    userId: string;
    examId: string | null;
    questionBankId: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    totalTimeSpent: number;
    averageTimePerQuestion: number;
    startedAt: string; // ISO date string
    completedAt: string; // ISO date string
    totalChanges: number;
    topicPerformance: TopicPerformance[];
    results: ExamResult[];
    correctCount: number;
    incorrectCount: number;
    skippedCount: number;
    reviewedCount: number;
    weakTopicMap: Record<string, WeakTopicDetails>;
    difficultyBreakdown: DifficultyBreakdown;
    revisitBreakdown: RevisitBreakdown;
    changePatterns: ChangePatterns;
    overallExamAccuracy: number;
    isQuestionBankBased: boolean;
}


const NeuroTestSummary = () => {
    const [data, setData] = useState<ExamData>()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter();
    const [changeAnswerData, setChangeAnswerData] = useState([])
    const [confidenceData, setconfidenceData] = useState([])
    const [weakTopic, setWeakTopic] = useState([])
    const [analysis, setAnalysis] = useState([])
    const [navAnalysis, setNavAnalysis] = useState([])
    const [Qanalysis, setQAnalysis] = useState([])
    const [attemptList, setAttemptList] = useState([])


    const PATTERN_COLORS: { [val: number]: string } = {
        1: "#34d399", // mint green
        2: "#f87171", // coral red
        3: "#f59e0b", // golden amber
        4: "#06b6d4", // sky blue
        5: "#8b5cf6", // royal purple
        6: "#ec4899", // hot pink
        7: "#10b981", // forest green
        8: "#6366f1", // electric blue
        9: "#f97316", // vivid orange
        10: "#14b8a6", // turquoise
        11: "#a855f7", // deep purple
        12: "#ef4444", // bright red
        13: "#3b82f6", // ocean blue
        14: "#22c55e", // fresh green
        15: "#eab308", // sunshine yellow
        16: "#d946ef", // magenta
        17: "#0891b2", // steel blue
        18: "#84cc16", // lime green
        19: "#f43f5e", // rose pink
        20: "#64748b", // slate gray
    };

    const transformDifficultyData = (difficultyData) => {
        // Define the mapping for difficulty levels
        const difficultyConfig = {
            Easy: {
                color: "#4CAF50",
                icon: <CheckCircle size={16} className="text-[#4CAF50]" />
            },
            Medium: {
                color: "#E53935",
                icon: <XCircle size={16} className="text-[#E53935]" />
            },
            Hard: {
                color: "#F4A300",
                icon: <RefreshCcw size={16} className="text-[#F4A300]" />
            }
        };

        return difficultyData.map(item => {
            const config = difficultyConfig[item.difficulty];

            return {
                label: item.difficulty,
                "Avg. Second per Question": Math.round(item.avgTimePerQuestion / 1000), // Convert milliseconds to seconds
                "Accuracy": item.accuracy,
                color: config.color,
                icon: config.icon
            };
        });
    };


    const init = async () => {
        try {
            setLoading(true);
            setError(null);
            const url = window.location.pathname;
            let id = url.split('/').pop()
            console.log("====id===>", url)
            //attempt_95219c39-749c-43a2-92bc-c7ab60015c73
            const response = await axios.get(process.env.NEXT_PUBLIC_PM_BASE_URL + "/dev/v1/exam/result/" + id);
            setData(response.data.data);

            const responseAttemptList = await axios.get(process.env.NEXT_PUBLIC_PM_BASE_URL + "/dev/v1/question-bank/attempts/" + response.data.data.questionBankId);

            setAttemptList(responseAttemptList.data)
            const changeAnswerPattern = Object.entries(response.data.data.changePatterns).map(([key, value], index) => ({
                name: key.split("_").join(" "),
                value: value,
                color: PATTERN_COLORS[index + 1], // index + 1 to match keys 1-9
            }));
            setChangeAnswerData(changeAnswerPattern)


            const quesNavData = Object.entries(response.data.data.navigationPatterns).map(([pattern, value], index) => ({
                name: pattern,
                value: value,
                color: PATTERN_COLORS[index + 1],
            }));

            setNavAnalysis(quesNavData)

            const confidenceVsAccuracy = (response.data.data.confidenceVsAccuracy).map((item, index) => ({
                x: Math.floor(item.confidence),
                y: Math.floor(item.accuracy),

            }));
            setconfidenceData(confidenceVsAccuracy);


            const weakTopicData = (response.data.data.weakTopics).map((item, index) => ({
                topic: item.topic,
                accuracy: item.accuracy,
                revisits: item.revisits,
                changes: item.changes,

            }));

            setWeakTopic(weakTopicData)

            const result = transformDifficultyData(response.data.data.questionAnalysis)
            setAnalysis(result)

            const analysisData = [
                {
                    label: "Correct",
                    value: response.data.data.correctAnswers,
                    color: "#4CAF50",
                    icon: <CheckCircle size={16} className="text-[#4CAF50]" />,
                },
                {
                    label: "Incorrect",
                    value: response.data.data.incorrectAnswers,
                    color: "#E53935",
                    icon: <XCircle size={16} className="text-[#E53935]" />,
                },
                {
                    label: "Reviewed",
                    value: response.data.data.reviewedAnswers,
                    color: "#F4A300",
                    icon: <RefreshCcw size={16} className="text-[#F4A300]" />,
                },
                {
                    label: "Skipped",
                    value: response.data.data.skippedAnswers,
                    color: "#7C4DFF",
                    icon: <SkipForward size={16} className="text-[#7C4DFF]" />,
                },
            ]

            setQAnalysis(analysisData)
            setLoading(false);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message || 'Failed to fetch dashboard data');
            setLoading(false);
        }
    };

    useEffect(() => { init() }, [])

    console.log("data::::::=>", data)

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
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    const url = window.location.pathname;
    const id = url.split('/').pop() ?? ""

    return (
        <div className="h-full  w-full overflow-y-auto no-scrollbar relative">

            {/* Fixed Header */}
            <div className="px-8 py-6 max-md:w-full  max-md:flex  max-md:justify-start md:flex-shrink-0">
                <div className="flex justify-between max-md:w-fit md:w-full items-end max-md:flex-col max-md:justify-start max-md:items-start max-md:gap-2">
                    <div className='flex justify-between max-lg:flex-col max-lg:justify-start max-lg:items-start  w-full items-center'>
                        <h1 className="  leading-[50px] text-[26px] font-normal tracking-normal  font-[futureHeadlineBold]  text-[#228367] dark:text-white">
                            {data?.examTopic} Practice Test - Completed
                        </h1>

                        <div className='flex items-center gap-5'>
                            <Button className='bg-[#228367] dark:bg-[#36AF8D]  hover:bg-[#228367] hover:dark:bg-[#36AF8D] dark:text-black text-white' onClick={() => {
                                localStorage.removeItem("aco-attempt")

                                localStorage.setItem(`aco-isCompleted-${data?.questionBankId}`, "true")
                                localStorage.setItem("aco-attempt", id)
                                router.push("/assesment/reviewTest/" + id)
                            }}

                            >
                                Review Your answers
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger className='border-none'>
                                    <Button className='bg-[#228367] dark:bg-[#36AF8D] dark:text-black text-white w-52 hover:bg-[#228367] hover:dark:bg-[#36AF8D]'

                                    >
                                        Choose Individual Attempts
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='h-52 overflow-hidden overflow-y-auto no-scrollbar w-52' >
                                    <DropdownMenuLabel>Total Attempt {data?.attemptsCount || 0}</DropdownMenuLabel>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push("/assesment/dash/" + data?.questionBankId)}>
                                        All
                                    </DropdownMenuItem>
                                    {
                                        attemptList.map((item, index) => (
                                            <DropdownMenuItem key={item.attemptId} onClick={() => router.push("/assesment/dash/" + data?.questionBankId + "/" + item.attemptId)}>
                                                attempt {index + 1}
                                            </DropdownMenuItem>
                                        ))
                                    }


                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>

                        {/* <p className="font-medium m-0 text-[19px] text-[#747474]">
                            Botulinum Toxin Test Code: C1474
                        </p> */}
                    </div>
                    {/* <div className="font-medium font-[Hartwell] max-md:text-left max-md:w-full text-[19px] text-[#747474]">
                        Time Stamp - 01:03 PM
                    </div> */}
                </div>
            </div>

            {/* Scrollable Content Area with ScrollArea */}


            {/* Responsive Grid - 1 column on mobile, 2 columns on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-8  ">
                {/* Sample Components */}
                <div className='col-span-full w-full'>
                    <PerformanceSummary data={data} />
                </div>

                <div className='md:col-span-1 col-span-full  w-full h-[249px]'>
                    <TopicInvolvementCard data={data} />
                </div>

                <div className='md:col-span-1 col-span-full w-full h-[249px]'>
                    <QuestionAnalysisCard data={Qanalysis} QuesData={analysis} />
                </div>

                <div className='flex md:flex-row flex-col col-span-2 gap-10 h-[422px] max-md:hidden items-stretch'>
                    <div className='w-full  h-full'>
                        <ConfidenceVsAccuracyCard data={confidenceData} />
                    </div>

                    <div className=' w-full h-full'>
                        <AnswerChangeChartCard data={changeAnswerData} dataQuestionNavigation={navAnalysis}
                            chart_1_label={"Outcome of answer changes during exam "}
                            chart_2_label={"Navigation patterns through the exam"}
                            title1='Answer Change Patterns'
                            title2='Question Navigation Behavior'
                            height={"310px"}
                        />
                    </div>
                </div>



                <div className='col-span-full w-full md:hidden  max-md:h-[422px]'>
                    <ConfidenceVsAccuracyCard data={confidenceData} />
                </div>

                <div className='col-span-full w-full md:hidden   max-md:h-[550px]'>
                    <AnswerChangeChartCard data={changeAnswerData} dataQuestionNavigation={navAnalysis}
                        chart_1_label={"Outcome of answer changes during exam "}
                        chart_2_label={"Navigation patterns through the exam"}
                        title1='Answer Change Patterns'
                        title2='Question Navigation Behavior'
                        height={"300px"}
                    />
                </div>



                <div className='col-span-full w-full h-[495px] max-md:h-[520px]'>
                    <WeakTopicsTableCard data={weakTopic} />
                </div>

                {/* <div className='col-span-full w-full max-h-[533px] max-md:max-h-[590px]'>
                            <RecommendationsCard />
                        </div> */}

                {/* <div className='col-span-full w-full h-[159px]'>
                    <StudyStreakCard />
                </div> */}
                {/* Add some extra spacing at the bottom */}
                {/* <div className="h-48 col-span-full"></div> */}

            </div>

        </div >
    );
};

export default NeuroTestSummary;