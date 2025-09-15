"use client"
import React, { useState, useEffect } from "react";
import owl from "@/public/bigOwl.svg"
import doctor from "@/public/doctor.svg"
import Image from "next/image"
import lungs from "@/public/greenLungs.svg"
import meter from "@/public/meter.svg"
import { FaStar } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import greenheart from "@/public/greenheart.svg"
import greenstop from "@/public/greenStop.svg"
import greenquest from "@/public/greenQuestion.svg"
import greenbadge from "@/public/greenBage.svg"
import greentick from "@/public/greenTick.svg"
import addUser from "@/public/addUser.svg"
import 'react-circular-progressbar/dist/styles.css';

const DiagnosisDashboard = () => {
    const [timeLeft, setTimeLeft] = useState("18:22:56");
    const [points, setPoints] = useState(99);
    const [rank, setRank] = useState(5);
    const [streak, setStreak] = useState(22);
    const [casesAttempted, setCasesAttempted] = useState(7);
    const [totalCases, setTotalCases] = useState(10);
    const [correctPercentage, setCorrectPercentage] = useState(40);
    const [avgResponseTime, setAvgResponseTime] = useState(35);
    const [topCategory, setTopCategory] = useState("Cardiology");
    const [hintsUsed, setHintsUsed] = useState(3);
    const [overallRank, setOverallRank] = useState(5);
    const [totalUsers, setTotalUsers] = useState(3546);

    useEffect(() => {
        // Timer countdown logic can be added here if required
    }, []);


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
            <svg width={size} height={size} className="rotate-[-90deg] relative">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="#2d2d2d"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="#4ade80"
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
                        fontSize="12"
                        fill="#34d399"
                    >
                        {percentage}%
                    </text>
                </g>
            </svg>
        );
    };


    const prizes = [
        {
            place: "1st.",
            description: "iPad accessories with Acolyte's Pro Subscription",
        },
        {
            place: "2nd.",
            description: "Headphones with Acolyte's Pro Subscription",
        },
        {
            place: "3rd.",
            description: "Exciting vouchers with Acolyte's Pro Subscription",
        },
    ];

    return (

        <div className="w-full h-screen  bg-gradient-to-b from-[#181A1D] to-[#011F16] flex flex-col
        items-center justify-center font-[futureheadline] rounded-[30px]">

            {/* icon */}
            <div className="flex items-center justify-start p-6 pl-14 pt-10 mt-24 h-full w-full   ">
                <Image
                    src={owl}
                    alt="alt"
                    height={30}
                    width={30}
                    className="w-14 h-14 object-contain"

                />
                <h2 className="text-3xl font-semibold tracking-wide">Acolyte AI</h2>
            </div>


            <div className="grid grid-cols-3 grid-rows-6  w-full h-full  ">
                {/* dignosis of the day */}
                <div className="space-y-6 col-span-1 p-6 h-full pl-14  w-full row-span-2">
                    <div className="w-full  space-y-2 ">
                        <h1 className="text-3xl font-bold text-emerald-400">Diagnosis of the day</h1>
                        <p className="text-gray-400 text-sm">Crack a case everyday. Stay sharp. Stay on top.</p>
                    </div>

                    <div className="w-full ">
                        <div className=" dark:bg-[#0F1012] bg-[#EBEBF5] rounded-xl p-6 w-72 h-fit shadow-lg border border-[#1B352F]">
                            <div className="mb-4 space-y-4">
                                <p className="text-emerald-400 text-xl font-semibold">Todays Focus</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-lg">        <Image
                                        src={lungs}
                                        alt="alt"
                                        height={30}
                                        width={30}
                                        className="w-8 h-8 object-contain"

                                    /></span>
                                    <span className="text-lg">Respiratory Disorder</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-yellow-400 text-xl font-semibold">Difficulty</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-lg">        <Image
                                        src={meter}
                                        alt="alt"
                                        height={30}
                                        width={30}
                                        className="w-8 h-8 object-contain"

                                    /></span>
                                    <span className="text-lg">Intermediate</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>


                {/* Leaderboard */}
                <div className="flex justify-start items-start h-full w-full col-span-1 row-span-2">
                    <div className="bg-gradient-to-t w-[350px] to-[#0F1012] p-8 from-[#011610]
                rounded-xl shadow-md  space-y-3 ">
                        <h3 className="text-xl   font-semibold text-emerald-400">Leaderboard</h3>
                        <div className="flex items-center gap-1 ">
                            {/* Avatar placeholders */}
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-10 h-10 bg-gray-600 rounded-full"></div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 w-full h-full">
                            <div className="col-span-1">
                                <p className="text-lg">Brandie</p>
                                <p className="text-lg text-amber-400">{points} pts</p>
                                <p className="text-lg text-amber-400">{streak}D streak</p>
                            </div>
                            <div className="col-span-1 h-full w-full ">
                                <p className="items-end flex justify-start gap-3">  <h1 className="text-xl font-bold text-yellow-400 ">#</h1>
                                    <h1 className="text-7xl font-bold text-yellow-400 ">{rank}</h1></p>

                            </div>
                        </div>

                    </div>
                </div>

                {/* Analytics */}
                <div className="flex justify-start pr-14 items-start h-fit w-full px-4 col-span-1 row-span-3">
                    <div className="bg-gradient-to-t  w-full h-full to-[#0F1012] p-10 from-[#011610]
                  rounded-xl  shadow-md space-y-6">
                        <h3 className="text-xl font-semibold text-emerald-400 ">Analytics</h3>
                        <div className="flex-1 flex gap-3">
                            <div className="w-12 h-12  col-span-4 row-span-2">
                                <CircleProgress percentage={50} />
                            </div>
                            <div className="space-y-1 ">
                                <p className="text-base">Correct Diagnosis </p>
                                <p className="float-start text-sm text-zinc-400">{correctPercentage}%</p>
                            </div>

                        </div>

                        <div className="flex-1 flex gap-3">
                            <div className="bg-[#1D2527] w-12 h-12 rounded-full flex items-center justify-center">
                                <Image
                                    src={greenstop}
                                    alt="img"
                                    width={30}
                                    height={30}
                                    className="w-6 h-6 object-contain bg-[#1D2527] "
                                />
                            </div>

                            <div className="space-y-1 ">
                                <p className="text-base">Avg. Response time </p>
                                <p className="float-start text-sm text-zinc-400">{avgResponseTime} sec</p>
                            </div>

                        </div>

                        <div className="flex-1 flex gap-3">
                            <div className="bg-[#1D2527] w-12 h-12 rounded-full flex items-center justify-center">
                                <Image
                                    src={greentick}
                                    alt="img"
                                    width={30}
                                    height={30}
                                    className="w-6 h-6 object-contain bg-[#1D2527] "
                                />
                            </div>
                            <div className="space-y-1 ">
                                <p className="text-base">Cases Attempted </p>
                                <p className="float-start text-sm text-zinc-400">{casesAttempted}/{totalCases}</p>
                            </div>

                        </div>


                        <div className="flex-1 flex gap-3">
                            <div className="bg-[#1D2527] w-12 h-12 rounded-full flex items-center justify-center">
                                <Image
                                    src={greenheart}
                                    alt="img"
                                    width={30}
                                    height={30}
                                    className="w-6 h-6 object-contain bg-[#1D2527] "
                                />
                            </div>
                            <div className="space-y-1 ">
                                <p className="text-base">Top Category </p>
                                <p className="float-start text-sm text-zinc-400">{topCategory}</p>
                            </div>

                        </div>

                        <div className="flex-1 flex gap-3">
                            <div className="bg-[#1D2527] w-12 h-12 rounded-full flex items-center justify-center">
                                <Image
                                    src={greenquest}
                                    alt="img"
                                    width={30}
                                    height={30}
                                    className="w-6 h-6 object-contain bg-[#1D2527] "
                                />
                            </div>
                            <div className="space-y-1 ">
                                <p className="text-base">Hints Used </p>
                                <p className="float-start text-sm text-zinc-400">{hintsUsed}/10</p>
                            </div>

                        </div>

                        <div className="flex-1 flex gap-3">
                            <div className="bg-[#1D2527] w-12 h-12 rounded-full flex items-center justify-center">
                                <Image
                                    src={greenbadge}
                                    alt="img"
                                    width={30}
                                    height={30}
                                    className="w-6 h-6 object-contain bg-[#1D2527] "
                                />
                            </div>
                            <div className="space-y-1 ">
                                <p className="text-base">Overall rank  </p>
                                <p className="float-start text-sm text-zinc-400">{overallRank} out of {totalUsers}</p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* doctor */}
                <div className=" col-span-1 row-span-3 pl-14 px-8 h-full w-full  relative ">
                    <Image
                        src={doctor}
                        alt="doctor"
                        height={70}
                        width={70}
                        className="w-72 h-fit object-bottom absolute bottom-0 "
                    />
                </div>

                {/* ranking */}
                <div className="flex justify-start -mt-8 items-start h-full w-full col-span-1 row-span-1">
                    <div className="bg-gradient-to-t w-[350px] to-[#0F1012]  from-[#011610]
                p-8 rounded-xl shadow-md   space-y-3"  >
                        <h4 className="text-xl text-emerald-400 font-semibold">Boost Rank Faster!</h4>
                        <p className="text-lg mt-1">+100pts for each signup</p>
                        <p className="text-lg pb-5">+500 pts if they win a diagnosis</p>
                        <Button className=" bg-gradient-to-l from-[#248B63] via-[#25E69B] space-x-4 to-[#0F734C] font-semibold  px-20 py-1 rounded-md text-black text-sm  transition">
                            <Image
                                src={addUser}
                                alt="img"
                                width={30}
                                height={30}
                                className="w-6 h-6 object-contain  "
                            />
                            Invite Now</Button>
                    </div>
                </div>

                {/* prize money */}
                <div className="flex justify-start items-end   py-4  pr-14 h-full w-full col-span-2 row-span-2">
                    <div className="bg-gradient-to-t w-full h-fit to-[#0F1012]  from-[#011610]
                p-8 rounded-xl shadow-md ">
                        <h3 className="text-xl font-semibold text-emerald-400 mb-4">Weekly Prizes</h3>
                        <ul className="space-y-2">
                            {prizes.map((prize, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <FaStar className="text-emerald-400 mt-1" />
                                    <p className="text-sm sm:text-lg tracking-wider text-start">
                                        <span className="text-emerald-400 font-medium mr-1">
                                            {prize?.place || ""}
                                        </span>
                                        {prize.description}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex p-8 justify-between items-center h-full
                  w-full bg-gradient-to-b from-[#0F1012] to-[#011610] col-span-3 row-span-1">
                    <div className="p-4  shadow-md flex items-center gap-4">

                        <div>
                            <p className="text-xl font-semibold text-emerald-400">Med Fact Of The Day :</p>
                            <p className="text-lg mt-1">Did you know?</p>
                            <p className="text-lg mt-1">The olfactory nerve is the only cranial nerve that regenerates.</p>
                        </div>
                    </div>
                    <Button size={"lg"} className=" bg-gradient-to-l from-[#248B63] via-[#25E69B] to-[#0F734C] font-semibold  px-20 py-6 rounded-md text-black text-3xl  transition">Start Case</Button>
                </div>


            </div>


        </div>


    );
};

export default DiagnosisDashboard;
