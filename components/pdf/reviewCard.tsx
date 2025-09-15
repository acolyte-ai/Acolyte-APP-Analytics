import React from 'react';
// import VibrantButtonUI from '../UIUX/buttonUI';
import { ScrollArea } from '../ui/scroll-area';
import VibrantButtonUI from '../Exam/UI/buttonUI';

interface ReviewCardProps {
    subject: string;
    title: string;
    bulletPoints: string[];
    onReviewClick?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
    subject,
    title,
    bulletPoints,
    onReviewClick
}) => {
    return (
        <div className="dark:bg-[#181A1D] bg-[#F3F4F9] dark:border-none border border-[#B8B8B8] shadow-md rounded-lg w-full  h-[200px] px-9 pt-4 pb-6
        flex flex-col items-start justify-center font-pt-sans 2xl:pt-[15px] 2xl:px-[34px] 2xl:pb-6
          xl:rounded-[7px]
        max-md:h-[200px] max-md:rounded-[7px]
        ">
            <ScrollArea className='h-full w-full '>

                {/* Subject */}
                <div className="dark:text-[#A3A3A3] w-fit text-[10px] p-1 rounded-[8px] mb-3 dark:bg-[#1C2626] bg-[#3ADE9E]  text-[white]">
                    {subject}
                </div>

                {/* Title */}
                <h3 className="dark:text-white text-black  text-sm font-medium mb-3 ">
                    {title}
                </h3>

                {/* Bullet points */}
                <ul className="list-disc pl-5 mb-6 ">
                    {bulletPoints.map((point, index) => (
                        <li key={index} className="text-[#9D9D9D] text-xs mb-1.5">
                            {point}
                        </li>
                    ))}
                </ul>

                {/* Review button */}
                <VibrantButtonUI size={"sm"} active={true} font={"font-pt-sans  text-base font-medium py-1 px-4"} onClick={() => console.log("clicked!")}  ><p className='dark:text-black text-white'>Review now</p></VibrantButtonUI>

            </ScrollArea>
        </div>
    );
};

export default ReviewCard;