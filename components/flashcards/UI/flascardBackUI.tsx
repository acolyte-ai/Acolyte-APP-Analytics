import React from 'react';
import { RiVoiceprintFill } from 'react-icons/ri';
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import dna from "@/public/dna.svg"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import axios from 'axios';
import useUserId from '@/hooks/useUserId';
interface Props {
    flipFn: () => void;
    description: string;
    title: string;
    review?: (val: "Good" | "Hard" | "Easy" | null) => void
    // closeFlashCard: () => void
}


export default function FlashcardBack({ flipFn, description, title, review }: Props) {


    return (
        <div className="relative  w-full p-0 grid grid-cols-6  font-pt-sans overflow-hidden">

            {/* Title and Audio Button */}
            <div className="col-span-5 w-full flex items-center justify-start   text-ellipsis">

                <Tooltip>
                    <TooltipTrigger asChild>
                        <h2 className="text-[45px] xl:text-[54px] truncate  w-6/7 max-sm:text-2xl font-bold text-black dark:text-white uppercase text-nowrap " >{title}      </h2>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{title}</p>
                    </TooltipContent>
                </Tooltip>


            </div>



            {/* Subheading / Description */}

            <ScrollArea className=" w-full max-h-[10vh]   max-sm:max-h-[38px]  overflow-hidden  col-span-full  mt-[25px] max-sm:mt-[11px]">
                <div
                    className="text-[#6D7688] max-sm:text-[13px] text-[28px] font-medium font-pt-sans "

                >

                    {description}


                </div>
            </ScrollArea>

            {/* Response Buttons */}
            <div className="  col-span-full flex justify-between items-center w-full h-full mt-[20px] max-sm:mb-4 max-sm:mt-6">
                <div className='w-full gap-3 flex items-center '>
                    <button className="bg-[#D22A2C] text-white h-full py-[6px] max-sm:py-[3px] max-sm:px-2 px-4 active:scale-105 hover:scale-105 rounded-full text-sm max-sm:text-[10px] font-medium shadow-sm w-full" onClick={() => {
                        flipFn()

                    }}>Again</button>
                    <button disabled={!review} className="bg-[#FFB23D] disabled:cursor-not-allowed active:scale-105 hover:scale-105 text-white h-full py-[6px] max-sm:py-[3px] max-sm:px-2 px-4 rounded-full text-sm max-sm:text-[10px] font-medium shadow-sm w-full" onClick={() => {
                        if (review) { review("Hard") }
                        // closeFlashCard()
                    }}>Hard</button>
                    <button disabled={!review} className="bg-[#39A74E] disabled:cursor-not-allowed active:scale-105 hover:scale-105 text-white h-full py-[6px] max-sm:py-[3px] max-sm:px-2 px-4 rounded-full text-sm max-sm:text-[10px] font-medium shadow-sm w-full" onClick={() => {
                        if (review) { review("Good") }
                        // closeFlashCard()
                    }}>Good</button>
                    <button disabled={!review} className="bg-[#009CEF] disabled:cursor-not-allowed active:scale-105 hover:scale-105 text-white h-full py-[6px] max-sm:py-[3px] max-sm:px-2 px-4 rounded-full text-sm max-sm:text-[10px] font-medium shadow-sm w-full" onClick={() => {
                        if (review) { review("Easy") }
                        // closeFlashCard()
                    }}>Easy</button>
                </div>

                <div className='w-full items-end flex justify-end'>
                    <button className="w-[76px] h-[76px] max-sm:h-[35px] mb-4 max-sm:w-[35px] max-sm:p-[10px] px-[19px] py-[22px] gradient-r from:bg-[#262A32] border dark:border-[#15181d] border-[#E0CCF9]  to:bg-[#1E2228] rounded-full flex items-center justify-center shadow-md">
                        <RiVoiceprintFill className="dark:brightness-100 brightness-75 text-[#36AF8D] " size={30} />
                    </button>
                </div>

            </div>


            <div className=" absolute -right-10 -top-14 max-sm:-right-5 max-sm:-top-7  darK:opacity-0 opacity-30">
                <Image
                    src={dna}
                    alt="dna"
                    height={30}
                    width={30}
                    className="h-72 w-72 max-sm:h-40 max-sm:w-40"
                />
            </div>

        </div>
    );
};

//dark:text-white dark:text-gray-100 dark:bg-white/10 dark:text-[#36AF8D]