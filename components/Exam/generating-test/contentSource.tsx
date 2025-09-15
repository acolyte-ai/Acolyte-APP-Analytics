import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSettings } from '@/context/store';
import React, { useState } from 'react';

const ContentSource: React.FC = () => {
    const { selectedFile } = useSettings()



    return (
        <div className="space-y-6 2xl:space-y-6 col-span-1 max-md:col-span-4">
            <p className="text-[18px] 2xl:text-[20px] mb-[13px] dark:text-[#C1C1C1] text-[#184C3D] text-nowrap font-pt-sans font-semibold truncate">Content sources</p>
            <div className="dark:border-none border dark:border-[#B8B8B8] border-[#C7C7C7] bg-[#F3F4F9]
            dark:bg-[#1F2323] px-6 py-3 mb-2  2xl:px-[18px] h-[65px] 2xl:py-[16px] dark:shadow-none shadow-md
             rounded-lg max-md:rounded-md flex items-center justify-right gap-4 ">

                <Tooltip>
                    <TooltipTrigger asChild>
                        <label className="relative  dark:text-gray-300 text-black  truncate  font-medium w-full text-center
            rounded-md text-[13px] 2xl:text-[14px] cursor-pointer overflow-hidden">
                            {selectedFile?.fileName}  </label>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{selectedFile?.fileName} </p>
                    </TooltipContent>
                </Tooltip>

            </div>


        </div>
    );
};

export default ContentSource;