import React, { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    next: () => void
}


const CallSignScreen: React.FC<Props> = ({ next }) => {
    const [callSign, setCallSign] = useState("Dr.StrangeLove");

    return (

        <div className="w-fit  flex items-center justify-center flex-col  space-y-8 h-full px-10  bg-[url(/bg-blue.svg)] bg-center ">

            <h2 className="text-emerald-400 text-2xl max-sm:text-xl w-full font-semibold pb-4 text-start">
                One Case to Crack. <br />
                One Shot to Shine.

            </h2>

            <ul className="text-base space-y-4 w-full text-gray-200 pb-8">
                <li className="flex gap-4 w-full items-star">
                    <Star className="text-emerald-400 mt-1.5 fill-emerald-400 w-4 h-4 object-contain" />
                    <p className="text-wrap w-full"> Diagnose 1 mystery patient daily — 60-second timeout</p>
                </li>
                <li className="flex gap-4 w-full items-start">
                    <Star className="text-emerald-400 mt-1.5 fill-emerald-400 w-4 h-4" />
                    <p>Submit once — no do-overs</p>
                </li>
                <li className="flex gap-4 w-full items-start">
                    <Star className="text-emerald-400 mt-1.5 fill-emerald-400 w-4 h-4" />
                    <p>Correct diagnosis = XP </p>
                </li>
                <li className="flex gap-4 w-full  items-start">
                    <Star className="text-emerald-400 mt-1.5 fill-emerald-400 w-4 h-4" />
                    <p className="text-wrap w-full">7-day streak unlocks bonus cases + Free subscriptions</p>
                </li>
                <li className="flex gap-4 w-full items-start">
                    <Star className="text-emerald-400 mt-1.5 fill-emerald-400 w-4 h-4" />
                    <p>Win exclusive prizes </p>
                </li>
            </ul>



            <div className="flex w-full flex-col justify-start">
                <label className="block text-sm text-emerald-400 mb-2">
                    Pick your call sign shown on leaderboard
                </label>
                <input
                    type="text"
                    value={callSign}
                    onChange={(e) => setCallSign(e.target.value)}
                    className="w-full px-3 py-2 bg-transparent dark:bg-transparent border border-gray-600 rounded-md
                     text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
            </div>
            <Button className="bg-emerald-400 dark:bg-emerald-400 hover:bg-green-500 w-full text-black text-lg font-semibold  py-6 px-6 rounded-lg shadow-md transition-all duration-300"
                onClick={next}
            >
                PLAY TODAY’S CASE
            </Button>
        </div>

    );
};

export default CallSignScreen;