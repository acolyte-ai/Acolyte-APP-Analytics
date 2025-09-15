"use client"
import calc from "@/public/calcIcon.svg";
import refresh from "@/public/refreshIcon.svg";
import pause from "@/public/pauseIcon.svg";
import { ScrollArea } from "@/components/ui/scroll-area"
import Intro from "@/components/Exam/practiceTest-dashboard/title";
import { DatePickerSearch } from "@/components/Exam/practiceTest-dashboard/CalenderTest";

import RecentTest from "@/components/Exam/practiceTest-dashboard/recentScores";
import { TestAnalysis } from "@/components/Exam/practiceTest-dashboard/recentTest";
import AiSuggestion from "@/components/Exam/practiceTest-dashboard/aiSuggestion";
import { useEffect, useState } from "react";
import { parseCookies } from "nookies";
import RetakeTestUI from "@/components/Exam/UI/retakeTestUI";
import CardOption from "@/components/Exam/UI/card_options";
import CardOptionEmpty from "@/components/Exam/UI/cardOptionEmptyUI";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";



const testOptions = [
    {
        icon: calc,
        title: "Create custom test",
        content: "Build your own quiz."
    },
    {
        icon: refresh,
        title: "Retake mistakes",
        content: "Redo incorrect answers."
    },
    {
        icon: pause,
        title: "Resume test",
        content: "Pick up where you left off."
    },
]




export default function TestDashboard() {
    const [cookies, setCookies] = useState<{ userName: string; userEmail: string }>({ userName: "", userEmail: "" });
    useEffect(() => {
        // Read cookies only on the client side
        const parsed = parseCookies();
        setCookies({
            userName: parsed.userName || "",
            userEmail: parsed.userEmail || "",
        });

    }, []);
    return (
        <div className="  2xl:py-[34px] 2xl:px-[46px] md:px-8 md:py-4 max-md:px-[22px] overflow-y-scroll no-scrollbar">
            <div className=" w-full  flex flex-col gap-y-[40px] 2xl:gap-y-[45px] font-causten-semibold items-start">
                <div className="w-full">

                    <Intro name={cookies.userName} />
                    <div className="flex  flex-col md:flex-row w-full justify-between max-md:justify-start max-md:items-start items-end gap-5 md:gap-0">
                        <p className="dark:text-[#B3B3B3] text-[#7E7E7E] text-[20px] 2xl:text-[18px] font-causten-semibold">You&apos;re making great progress in your learning journey!</p>
                        <DatePickerSearch />
                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 max-md:gap-[17px] gap-4 2xl:gap-[14px] w-full">


                    <CardOption icon={testOptions[0].icon} content={testOptions[0].content} title={testOptions[0].title} />
                    <RetakeTestUI icon={testOptions[1].icon} content={testOptions[1].content} title={testOptions[1].title} />
                    <CardOptionEmpty icon={testOptions[2].icon} content={testOptions[2].content} title={testOptions[2].title} />



                </div>
                <RecentTest />
                <div className="grid grid-cols-1 md:grid-cols-12 gap-[28px] 2xl:gap-[32px] max-w-full w-full h-fit ">
                    <TestAnalysis />
                    <AiSuggestion />
                </div>

            </div >
        </div>
    )
}