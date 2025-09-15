import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';

export default function LatestMedicalUpdates() {
    const updates = [
        {
            id: 1,
            prefix: "New WHO",
            content: "guidelines on antibiotic resistance antibiotic resistance antibiotic"
        },
        {
            id: 2,
            prefix: "New WHO",
            content: "guidelines on antibiotic resistance antibiotic resistance antibiotic"
        },
        {
            id: 3,
            prefix: "New WHO",
            content: "guidelines on antibiotic resistance antibiotic resistance antibiotic"
        },

    ];

    return (
        <div
            className="flex max-lg:h-full lg:h-[325px] font-pt-sans px-[31px] py-[18px] flex-col dark:bg-[#181A1D] bg-[#F3F4F9] rounded-[7px] overflow-hidden
              items-start justify-center align-middle gap-6 flex-shrink-0 self-stretch   dark:shadow-[inset_0_0_8px_#B8B8B82B]  dark:border-none border border-[#B8B8B8] shadow-md"
        >
            {/* Header */}
            <h2 className="text-[22px] font-semibold  dark:text-[#36AF8D] text-[#006F50]" >
                Latest medical update
            </h2>
            <ScrollArea className='h-full w-full'>
                {/* Updates List */}
                <div className="flex flex-col gap-4 w-full items-center justify-center">
                    {updates.map((update) => (
                        <Card
                            key={update.id}
                            className=" flex  dark:bg-[#1D2527] bg-[#E8EAF3] dark:border-none border border-[#B8B8B8] shadow-md
                         justify-center items-center self-stretch cursor-pointer
                         hover:opacity-80 transition-opacity rounded-lg  dark:shadow-[inset_0_0_8px_#B8B8B82B]"
                        >
                            <p className="text-lg leading-relaxed px-[17px] py-[11px]">
                                <span className="font-medium text-[#36AF8D] dark:text-[#36AF8D]">
                                    {update.prefix}
                                </span>
                                <span className=" ml-1 dark:text-white text-black font-medium ">
                                    {update.content}
                                </span>
                            </p>
                        </Card>
                    ))}
                </div>
            </ScrollArea>

        </div>
    );
}