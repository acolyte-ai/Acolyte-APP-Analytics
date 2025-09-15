import Accuracy from "./accuracy";
import AvgTime from "./averageTime";
import RankEst from "./rankEstimate";
import ScoreCard from "../UI/card_score";
import useUserId from "@/hooks/useUserId";
import { useEffect, useState } from "react";
import axios from "axios";
import LastAttempt from "./lastAttempt";


interface StrictUserPerformanceData {

    recentScore: {
        accuracyPercentage: `${number}%`;
        averageTime: number;
        rank: `Top ${number}%` | `Bottom ${number}%`;
        accuracyChange: {
            percentage: `${number}%`;
            trend: 'up' | 'down';
        };
    };
    lastAttempt: {
        accuracyPercentage: `${number}%`;
        totalTime: number;
    };
}


export default function RecentTest() {
    const [data, setData] = useState<StrictUserPerformanceData>({
        recentScore: {
            accuracyPercentage: `${0}%`,
            averageTime: 0,
            rank: `Top ${0}%`,
            accuracyChange: {
                percentage: `${0}%`,
                trend: 'down',
            },
        },
        lastAttempt: {
            accuracyPercentage: `${0}%`,
            totalTime: 0
        }
    })

    const userId = useUserId()
    async function getUserDashboard() {
        const baseUrl = process.env.NEXT_PUBLIC_PM_BASE_URL + '/dev/v1/exam/user-dashabord';

        try {


            const response = await axios.get(baseUrl, {
                params: {
                    userId: userId
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                // timeout: 10000 // 10 second timeout
            });

            setData(response.data)

        } catch (error) {
            console.error('Error fetching user dashboard:', error);

        }
    }

    function convertSecondsToTime(totalSeconds) {
        // Handle negative numbers
        if (totalSeconds < 0) {
            return { hours: 0, minutes: 0, seconds: 0, formatted: '00:00:00' };
        }

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return {
            hours,
            minutes,
            seconds,
        };
    }

    function secondsToCompact(totalSeconds) {
        if (totalSeconds < 0) return '0s';

        const { hours, minutes, seconds } = convertSecondsToTime(totalSeconds);

        const parts = [];
        if (hours > 0) parts.push(`${hours}hr`);
        if (minutes > 0) parts.push(`${minutes}min`);
        if (seconds > 0) parts.push(`${seconds}sec`);

        return parts.length > 0 ? parts.join(' ') : '0sec';
    }

    useEffect(() => {
        if (userId) {
            getUserDashboard()
        }
    }, [userId])

    return (
        <div className="w-full">
            <p className="text-[22px] leading-[27px] 2xl:text-[24px] font-causten-semibold 2xl:leading-8 font-medium mb-7 2xl:mb-6 text-[#228367] dark:text-white">Recent test score</p>
            <div className="grid grid-cols-1 md:grid-cols-10 2xl:grid-cols-9  gap-5 2xl:gap-[18px] w-full">

                <ScoreCard className="2xl:col-span-3 md:col-span-4  dark:bg-[#181A1D]  bg-[#F3F4F9]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md">
                    <Accuracy score={data.recentScore.accuracyChange.percentage} percentage={data.recentScore.accuracyPercentage} arrow={data.recentScore.accuracyChange.trend} />
                </ScoreCard>
                <ScoreCard className="2xl:col-span-2 md:col-span-3  dark:bg-[#181A1D]  bg-[#F3F4F9]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md">
                    <AvgTime score={secondsToCompact(data.recentScore.averageTime)} percentage={""} />
                </ScoreCard>
                {/* <ScoreCard className="2xl:col-span-4 md:col-span-3  dark:bg-[#181A1D]  bg-[#F3F4F9]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md">
                    <RankEst score={data.recentScore.rank} percentage={data.recentScore.rank} />
                </ScoreCard> */}
                <ScoreCard className="2xl:col-span-4 md:col-span-3  dark:bg-[#181A1D]  bg-[#F3F4F9]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md">
                    <LastAttempt score={data.lastAttempt.accuracyPercentage} percentage={secondsToCompact(data.lastAttempt.totalTime)} />
                </ScoreCard>
            </div>
        </div>

    )
}