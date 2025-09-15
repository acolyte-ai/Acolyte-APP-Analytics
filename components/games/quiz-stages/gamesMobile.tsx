"use client"

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import CallSignScreen from "./callingScreen";
import CaseCountdown from "./caseCountDown";
import CaseQuestion from "./caseQuestions";
import DiagnosisResult from "../leadershipBoard/diagonisis";
import DiagnosisResultIncorrect from "./diagonsisWrong";
import Leaderboard from "../leadershipBoard/leadershipBoard";
import SecureYourSpot from "../quiz-stages/secureSpot"

const DiagnosisOfTheDay: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<number>(60 * 60 * 24); // 24 hours
    const [active, setactive] = useState<{
        step1: boolean,
        step2: boolean,
        step3: boolean,
        step4: boolean,
        step5: boolean,
        step6: boolean,
        step7: boolean,
        step8: boolean,
        step9: boolean
    }>({
        step1: true,
        step2: false,
        step3: false,
        step4: false,
        step5: false,
        step6: false,
        step7: false,
        step8: false,
        step9: false
    })

    // Format time into hh:mm:ss
    const formatTime = (totalSeconds: number) => {
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
    };

    // Countdown timer effect
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full w-full flex items-center justify-center object-fill  lg:rounded-xl text-white font-[futureHeadline]">
            {
                active.step1 &&

                <div className="text-center flex items-center justify-center flex-col w-full h-full space-y-6 max-w-md  bg-[url(/bg-blue.svg)] bg-center ">
                    <h1 className="text-7xl font-extrabold text-emerald-400">DoD</h1>
                    <h2 className="text-xl font-semibold text-emerald-400 pb-8">DIAGNOSIS OF THE DAY</h2>
                    <p className="text-xl text-white font-pt-sans tracking-wide pb-8">
                        Welcome, Doctor Detective!<br />
                        Each day, one fresh case awaits.

                    </p>

                    <Button className="bg-emerald-400 dark:bg-emerald-400 hover:bg-green-500 text-black text-lg font-semibold py-6 px-6
                    rounded-lg shadow-md transition-all duration-300"
                        onClick={() => setactive((prev) => ({ ...prev, step1: false, step2: true }))}
                    >
                        PLAY TODAY’S CASE
                    </Button>

                    <p className="text-lg text-gray-400  pb-6">No sign-up required</p>
                    <p className="text-lg text-white text-nowrap ">
                        NEXT CASE DROPS IN <span className="text-green-400 font-semibold ">{formatTime(timeLeft)}</span>
                    </p>
                </div>
            }
            {active.step2 && <CallSignScreen next={() => setactive((prev) => ({ ...prev, step2: false, step4: true }))} />}
            {active.step4 && <CaseCountdown next={() => setactive((prev) => ({ ...prev, step4: false, step5: true }))} />}
            {active.step5 && <CaseQuestion next={(val: boolean) => {
                if (val) {
                    setactive((prev) => ({ ...prev, step5: false, step6: true }))
                    // setactive((prev) => ({ ...prev, step5: false, step6: false, step7: true }))
                } else {
                    setactive((prev) => ({ ...prev, step5: false, step6: false, step7: true }))
                    // setactive((prev) => ({ ...prev, step5: false, step6: true }))
                }
            }}
            />}
            {active.step6 && <DiagnosisResult next={() => setactive((prev) => ({ ...prev, step6: false, step8: true }))} />}
            {active.step7 && <DiagnosisResultIncorrect next={() => setactive((prev) => ({ ...prev, step7: false, step8: true }))} />}
            {active.step8 && <SecureYourSpot />}
            {/* next={() => setactive((prev) => ({ ...prev, step8: false, step3: true }))} */}
            {/* {active.step3 && <UpdatingRank next={() => setactive((prev) => ({ ...prev, step3: false, step9: true }))} />} */}

            {active.step9 && <Leaderboard />}

        </div>
    );
};

export default DiagnosisOfTheDay;
