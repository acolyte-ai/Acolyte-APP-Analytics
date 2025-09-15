"use client"
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SubjectProgress from "@/components/home/graph-subjectProgress";
import StudyMasteryHeatMap from "@/components/home/graph-heatmapStudy";
import { ToolUsage } from "@/components/home/graph-toolUsage";
// import { StudyPerformanceAnalytics } from "@/components/home/graph-studyPerformanceAnalytics";
import Loading from "../../UIUX/loading-page";
import StudyWellness from "@/components/home/graph-studyWellness";
import AnswerChangeHome from "@/components/home/graph-answerChange";
import BodySystem from "@/components/home/graph-bodySystem";
import CardCreationSource from "@/components/home/graph-cardCreationSources";
// import ConceptNetwork from "@/components/home/graph-conceptNetwork";
import ConfidenceAccuracy from "@/components/home/graph-confidenceAccuracy";
import ExamPerformanceAnalysis from "@/components/home/graph-examPerformanceAnalysis";
import MasteryDistribution from "@/components/home/graph-MasteryDistribution";
import QuestionNavigationBehavior from "@/components/home/graph-questionNavigation";
import ReadingSpeedFlashCard from "@/components/home/graph-readingSpeedFlashcard";
import RetentionRateCalculation from "@/components/home/graph-retentionRate";
import IdentifiedWeakTopics from "@/components/home/table-IndentifiedWeakTopic";
// import KnowledgeGapAlerts from "@/components/home/table-knowledgeGapAlert";
// import KnowledgeInsights from "@/components/home/table-knowledgeInsight";
import TodayFocus from "@/components/home/table-todayFocus";
import TopicPerformanceBreakdown from "@/components/home/table-topicPerformanceBreakdown";
// import PersonalizedRecommendation from "@/components/home/table-recommendation";
import LearningProgress from "@/components/home/graph-learningProgress";
import { StudyTimeAnalytics } from "@/components/home/graph-studyTimeAnalytics";
import ProfileInfo from "@/components/home/info-profile";
import { parseCookies } from "nookies";
import { useSettings } from "@/context/store";

const HomeDashboard = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [cookies, setCookies] = useState<{ userName: string; userEmail: string }>({ userName: "", userEmail: "" });
    useEffect(() => {
        // Read cookies only on the client side
        const parsed = parseCookies();

        setCookies({
            userName: parsed.userName || "",
            userEmail: parsed.userEmail || "",
        });
    }, []);
    useEffect(() => {
        setLoading(true)
        const dodName = localStorage.getItem("dod_uname")
        const dodAuth = localStorage.getItem("dod_Auth")
        if (dodName || dodAuth) {
            localStorage.removeItem("dod_uname")
            localStorage.removeItem("dod_Auth")
            localStorage.removeItem("dod_email")
            router.push("/dashboard/leaderboard")
        }

        setLoading(false)
    }, [router])
    return (
        <div className="sm:w-full sm:max-w-full overflow-x-hidden no-scrollbar overflow-y-scroll">
            {loading ? (
                <Loading />
            ) : (
                <div className="font-rubik sm:w-full sm:max-w-full no-scrollbar">
                    <div className="gap-6 lg:gap-8 max-sm:mb-20 grid grid-cols-12 sm:w-full sm:max-w-full px-4 md:px-6 lg:px-8 no-scrollbar">
                        {/* Profile Section */}
                        <div className="col-span-full">
                            <ProfileInfo name={cookies?.userName} />
                        </div>

                        {/* Overview Section */}
                        <div className="col-span-12 md:col-span-6 lg:col-span-5 min-w-0">
                            <SubjectProgress />
                        </div>
                        <div className="col-span-12 md:col-span-6 lg:col-span-7 min-w-0">
                            <StudyWellness />
                        </div>

                        {/* Time Analytics */}
                        <div className="col-span-full min-w-0">
                            <StudyTimeAnalytics />
                        </div>

                        {/* Study Metrics */}
                        <div className="col-span-12 xl:col-span-6 min-w-0">
                            <StudyMasteryHeatMap />
                        </div>
                        <div className="col-span-12 xl:col-span-6 min-w-0">
                            <ToolUsage />
                        </div>

                        {/* Focus Section */}
                        <div className="col-span-full min-w-0">
                            <TodayFocus />
                        </div>

                        {/* Performance Analysis */}
                        <div className="col-span-12 lg:col-span-6 min-w-0">
                            <BodySystem />
                        </div>
                        <div className="col-span-12 lg:col-span-6 min-w-0">
                            <MasteryDistribution />
                        </div>

                        {/* Progress Tracking */}
                        <div className="col-span-12 xl:col-span-6 min-w-0">
                            <LearningProgress />
                        </div>
                        <div className="col-span-12 xl:col-span-6 min-w-0">
                            <CardCreationSource />
                        </div>

                        {/* Exam Analytics */}
                        <div className="col-span-12 lg:col-span-4 min-w-0">
                            <ExamPerformanceAnalysis />
                        </div>
                        <div className="col-span-12 lg:col-span-8 min-w-0">
                            <ConfidenceAccuracy />
                        </div>

                        {/* Behavior Analysis */}
                        <div className="col-span-12 xl:col-span-6 min-w-0">
                            <AnswerChangeHome />
                        </div>
                        <div className="col-span-12 xl:col-span-6 min-w-0">
                            <QuestionNavigationBehavior />
                        </div>

                        {/* Detailed Reports */}
                        <div className="col-span-full min-w-0">
                            <IdentifiedWeakTopics />
                        </div>

                        <div className="col-span-full min-w-0">
                            <TopicPerformanceBreakdown />
                        </div>

                        {/* Study Efficiency */}
                        <div className="col-span-12 xl:col-span-6 min-w-0">
                            <ReadingSpeedFlashCard />
                        </div>
                        <div className="col-span-12 xl:col-span-6 min-w-0">
                            <RetentionRateCalculation />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomeDashboard;