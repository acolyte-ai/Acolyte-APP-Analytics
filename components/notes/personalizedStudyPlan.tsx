import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';

export default function LatestPersonalizedUpdates() {
    const updates = [
        {
            id: 1,
            prefix: "Complete neurology",
            content: "system review before next exam"
        },
        {
            id: 2,
            prefix: "Complete neurology",
            content: "system review before next exam"
        },
        {
            id: 3,
            prefix: "Complete neurology",
            content: "system review before next exam"
        }
    ];

    return (
        <div
            className="flex  max-lg:h-full lg:h-[325px] font-causten-semibold px-[31px] py-[18px] flex-col dark:bg-[#181A1D] bg-[#F3F4F9] rounded-[7px] overflow-hidden
            items-start gap-6 flex-shrink-0 self-stretch   dark:shadow-[inset_0_0_8px_#B8B8B82B]  dark:border-none border border-[#B8B8B8] shadow-md"
        >
            {/* Header */}
            <h2 className="text-[22px]  font-causten-semibold  dark:text-[#36AF8D] text-[#006F50]" >
                Personalized Study Plan
            </h2>
            <ScrollArea className='h-full w-full'>
                {/* Updates List */}
                <div className="flex flex-col gap-4 w-full ">
                    {updates.map((update) => (
                        <Card
                            key={update.id}
                            className=" flex  dark:bg-[#1D2527] bg-[#E8EAF3]
                         justify-center items-center self-stretch cursor-pointer
                         hover:opacity-80 transition-opacity rounded-lg dark:shadow-[inset_0_0_8px_#B8B8B82B]  dark:border-none border border-[#B8B8B8] shadow-md"
                        >
                            <p className="text-lg leading-relaxed px-[17px] py-[11px]">
                                <span className="font-causten-semibold text-[#36AF8D] dark:text-[#36AF8D]">
                                    {update.prefix}
                                </span>
                                <span className=" ml-1 dark:text-white text-black font-medium font-causten-semibold">
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