import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

type CircleProgressProps = {
    percentage: number;
    size?: number;
    strokeWidth?: number;
};



const CircleProgress: React.FC<CircleProgressProps> = ({
    percentage,
    size = 48,
    strokeWidth = 4,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="w-full h-full">
            <svg
                viewBox={`0 0 ${size} ${size}`}
                className="rotate-[-90deg] w-full h-full"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    // stroke=""
                    className="stroke-[#B9B9B9] dark:stroke-[#2d2d2d]"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="#36AF8D"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
                <g transform={`rotate(90, ${size / 2}, ${size / 2})`}>
                    <text
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base 2xl:text-lg fill-[#34d399]"
                    >
                        {percentage}%
                    </text>
                </g>
            </svg>
        </div>
    );
};


export default function PerformanceSummary({ data }) {
    const [time, setTime] = useState<string>()
    const convertSecondsToTime = (seconds) => {
        console.log("seconds:::", seconds)
        const totalSeconds = seconds; // No division needed
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;

        if (hours > 0) {
            setTime(`${hours} hrs ${minutes} min`)
        } else if (minutes > 0) {
            setTime(`${minutes} min ${remainingSeconds} sec`);
        } else {
            setTime(`${remainingSeconds} sec`);
        }
    };

    useEffect(() => {
        if (data) {
            convertSecondsToTime(data?.totalTimeSpent)
        }
    }, [data])
    return (
        <Card className="dark:bg-[#181A1D] bg-[#F3F4F9]  dark:shadow-[inset_0_0_8px_#B8B8B82B] p-0
        dark:border-none border border-[#B8B8B8] shadow-md text-white px-[29px] font-pt-sans py-5 rounded-xl  w-full ">
            <CardContent className="flex flex-col sm:flex-row items-center gap-14 p-0">
                {/* Circular progress (can use react-circular-progressbar or SVG here) */}
                <div className="relative flex items-center justify-center w-[130px] h-[130px]">
                    <CircleProgress percentage={data?.overallScore} size={70} strokeWidth={6} />
                </div>

                {/* Text and Stats */}
                <div className="flex-1 w-full">
                    <p className=" mb-8 font-medium   tracking-normal text-[22px]">
                        <span className="text-[#36AF8D] ">Good work!</span>{' '}
                        <span className="dark:text-white/80  text-black">Above average for first attempt</span>
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-6  tracking-normal text-sm gap-2 text-left lg:text-lg gap-y-12 max-md:gap-y-5">
                        <div>
                            <div className="text-[#9D9D9D] dark:brightness-100 brightness-75">Total Time</div>
                            <div className="text-[#36AF8D] font-medium text-xl ">{(time || 0)}</div>
                        </div>
                        <div>
                            <div className="text-[#9D9D9D] dark:brightness-100 brightness-75">Accuracy</div>
                            <div className="text-[#36AF8D] font-medium text-xl">{data?.accuracy || 0}</div>
                        </div>
                        <div>
                            <div className="text-[#9D9D9D] dark:brightness-100 brightness-75 text-nowrap truncate">Answer Changes</div>
                            <div className="text-[#36AF8D] font-medium text-xl">{data?.answerChanges || 0}</div>
                        </div>
                        <div>
                            <div className="text-[#9D9D9D] dark:brightness-100 brightness-75">Total Attempts</div>
                            <div className="text-[#36AF8D] font-medium text-xl">{data?.attemptsCount || 0}</div>
                        </div>
                        <div>
                            <div className="text-[#9D9D9D] dark:brightness-100 brightness-75">Weak Topics</div>
                            <div className="text-[#36AF8D] font-medium text-xl">{data?.weakTopics?.length || 0}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

