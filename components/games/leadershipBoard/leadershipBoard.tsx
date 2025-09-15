import React, { useEffect, useState } from 'react';
import useUserId from "@/hooks/useUserId";
import Image from "next/image"
import badge from "@/public/fireBatch.svg"
import { FaStar } from "react-icons/fa";
interface Props {
    next: () => void;
}

const Leaderboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [leaderboardPeriod, setLeaderboardPeriod] = useState("all-time");
    const userId = useUserId();
    // const [leaderboardData, setLeaderboardData] = useState([]);

    const leaderboardData = [
        { rank: 1, name: 'Brandie', xp: 456, time: '13s' },
        { rank: 2, name: 'Kristin', xp: 622, time: '27s' },
        { rank: 3, name: 'Bessie', xp: 753, time: '4s' },
        { rank: 4, name: 'Tanya', xp: 545, time: '2s' },
        { rank: 5, name: 'Kathryn', xp: 234, time: '22s' },
        { rank: 6, name: 'Courtney', xp: 334, time: '17s' },
        { rank: 7, name: 'Aubrey', xp: 233, time: '19s' },
        // { rank: 8, name: 'Connie', xp: 543, time: '10s' },
        // { rank: 9, name: 'Arlene', xp: 546, time: '8s' },
        // { rank: 10, name: 'Audrey', xp: 444, time: '23s' },
    ];

    const prizes = [
        {
            // place: "1st.",
            description: "iPad accessories with Acolyte's Pro Subscription",
        },
        {
            // place: "2nd.",
            description: "Headphones with Acolyte's Pro Subscription",
        },
        {
            // place: "3rd.",
            description: "Exciting vouchers with Acolyte's Pro Subscription",
        },
    ];

    useEffect(() => {
        fetchLeaderboard()
    }, [])

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/dev";
            const response = await fetch(
                `${API_BASE_URL}/qotd/leaderboard?period=${leaderboardPeriod}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to load leaderboard data");
            }

            const data = await response.json();
            setLeaderboardData(data.leaderboard);
            // setError(null);
        } catch (err) {
            // setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center w-full  bg-[url(/bg-blue.svg)] bg-center mb-20">
            <div className=" px-4  max-w-sm w-full text-center text-white">

                <h2 className="text-3xl font-bold text-emerald-400 mb-2 tracking-wider">LEADERBOARD</h2>
                <p className="text-white mb-8 text-lg font-semibold">Where Diagnosis Turn Into Glory.<br />
                    Own the leaderboard.
                </p>

                <div className='grid grid-cols-3 w-full gap-2 mb-4'>
                    <div className='w-full bg-[#143A3A] border flex flex-col items-center justify-start gap-2 pl-4 border-[#EC990C] col-span-1 p-2 rounded-lg'>
                        <p>1. Brandie</p>
                        <div className='flex gap-1 items-center text-sm'><Image src={badge} alt="rank" width={15} height={15} className='w-5 h-5 object-contain' /> <p className='text-[#EC990C]'>192 Pts</p></div>
                        <p className='text-xs tracking-wider'>22D streak</p>
                    </div>

                    <div className='w-full bg-[#143A3A] border flex flex-col items-center justify-start gap-2 pl-4 border-[#B0B0B0] col-span-1 p-2 rounded-lg'>
                        <p>2. Brandie</p>
                        <div className='flex gap-1 items-center text-sm'><Image src={badge} alt="rank" width={15} height={15} className='w-5 h-5 object-contain' /> <p className='text-[#EC990C]'>192 Pts</p></div>
                        <p className='text-xs tracking-wider'>22D streak</p>
                    </div>

                    <div className='w-full bg-[#143A3A] border flex flex-col items-center justify-start gap-2 pl-4 border-[#B14F2C] col-span-1 p-2 rounded-lg'>
                        <p>3. Bessie</p>
                        <div className='flex gap-1 items-center justify-start text-sm'><Image src={badge} alt="rank" width={15} height={15} className='w-5 h-5 object-contain' /> <p className='text-[#EC990C]'>192 Pts</p></div>
                        <p className='text-xs tracking-wider'>22D streak</p>
                    </div>
                </div>

                <div className=" rounded-lg overflow-hidden mb-8 space-y-2">

                    {leaderboardData.map((entry, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-4 bg-[#143A3A] text-xs py-2 rounded-lg  "
                        >
                            <div className='text-base text-start pl-6 '>{index + 4}.</div>
                            <div className='text-base text-start'>{entry.name}</div>
                            <div className='text-amber-400 text-xs flex items-center gap-2'><Image src={badge} alt="rank" width={15} height={15} className='w-5 h-5 object-contain' />{entry.rank} pts</div>
                            <div className='text-xs text-start items-center flex'>{entry.xp}D streak</div>
                        </div>
                    ))}
                </div>

                <hr className="border-teal-800 mb-6" />

                <div className=" text-white  rounded-lg w-full max-w-md mx-auto">
                    <h2 className="text-emerald-400 text-center text-xl font-bold mb-4 tracking-wide">
                        PRIZES
                    </h2>
                    <ul className="space-y-2">
                        {prizes.map((prize, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <FaStar className="text-emerald-400 mt-1" />
                                <p className="text-sm sm:text-base text-start">
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
        </div>
    );
};

export default Leaderboard;
