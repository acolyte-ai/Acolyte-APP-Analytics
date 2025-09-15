"use client"
import React, { useEffect, useState } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { CardStudent } from '../UI/studentCardUI';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LearningData } from '@/components/Dashboards/student-profile/profileTypes';

type LearningItem = {
    title: string;
    progress: number;
    date: string;
    improvement: number;
};

const learningData: LearningItem[] = [
    { title: 'Anatomy & Physiology', progress: 30, date: '2 days ago', improvement: 50 },
    { title: 'Pharmacology', progress: 40, date: '2 days ago', improvement: 60 },
    { title: 'Immunology', progress: 70, date: '2 days ago', improvement: 20 },
    { title: 'Pathology', progress: 50, date: '2 days ago', improvement: 80 },
    { title: 'Pharmacology', progress: 40, date: '2 days ago', improvement: 60 },
    { title: 'Immunology', progress: 70, date: '2 days ago', improvement: 20 },
    { title: 'Pathology', progress: 50, date: '2 days ago', improvement: 80 },
    { title: 'Immunology', progress: 70, date: '2 days ago', improvement: 20 },
    { title: 'Pathology', progress: 50, date: '2 days ago', improvement: 80 },
    { title: 'Pharmacology', progress: 40, date: '2 days ago', improvement: 60 },
    { title: 'Immunology', progress: 70, date: '2 days ago', improvement: 20 },
    { title: 'Pathology', progress: 50, date: '2 days ago', improvement: 80 },
];

type CircleProgressProps = {
    percentage: number;
    size?: number;
    strokeWidth?: number;
};

// const CircleProgress: React.FC<CircleProgressProps> = ({
//     percentage,
//     size = 48,
//     strokeWidth = 4,
// }) => {
//     const radius = (size - strokeWidth) / 2;
//     const circumference = 2 * Math.PI * radius;
//     const offset = circumference - (percentage / 100) * circumference;

//     return (
//         <svg width={size} height={size} className="rotate-[-90deg] relative">
//             <circle
//                 cx={size / 2}
//                 cy={size / 2}
//                 r={radius}
//                 fill="transparent"
//                 stroke="#2d2d2d"
//                 strokeWidth={strokeWidth}
//             />
//             <circle
//                 cx={size / 2}
//                 cy={size / 2}
//                 r={radius}
//                 fill="transparent"
//                 stroke="#4ade80"
//                 strokeWidth={strokeWidth}
//                 strokeDasharray={circumference}
//                 strokeDashoffset={offset}
//                 strokeLinecap="round"
//             />
//             <g transform={`rotate(90, ${size / 2}, ${size / 2})`}>
//                 <text
//                     x="50%"
//                     y="50%"
//                     dominantBaseline="middle"
//                     textAnchor="middle"
//                     fontSize="20"
//                     fill="#34d399"
//                 >
//                     {percentage}%
//                 </text>
//             </g>
//         </svg>
//     );
// };


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
                        className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base 2xl:text-lg fill-[#36AF8D]"
                    >
                        {percentage}%
                    </text>
                </g>
            </svg>
        </div>
    );
};


const MyLearning: React.FC<{ data: LearningData[] }> = ({ data }: { data: LearningData[] }) => {
    // State to store calculated size based on screen width
    const [circleSize, setCircleSize] = useState(48);

    // Function to calculate size based on viewport width
    const calculateSize = () => {
        const windowWidth = window.innerWidth;

        // Define breakpoints for responsive sizing
        if (windowWidth < 640) return 40;       // sm
        if (windowWidth < 768) return 48;       // md
        if (windowWidth < 1024) return 56;      // lg
        if (windowWidth < 1280) return 64;      // xl
        return 80;                              // 2xl and above
    };

    // Update size when window resizes
    useEffect(() => {
        const handleResize = () => {
            setCircleSize(calculateSize());
        };

        // Set initial size
        handleResize();

        // Add resize event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <>

            {
                data.length > 0 ? <CardStudent className='dark:bg-[#181A1D] bg-[#F3F4F9] h-[229px] max-lg:h-[274px]   dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8]
         shadow-md px-5 py-[10px] xl:px-[25px] xl:py-[21px]
             max-xl:px-[25px] max-xl:py-[13px]' title='My Learning' description=''>

                    <ScrollArea className=' w-full h-full font-pt-sans flex flex-col items-center justify-center '>

                        {data.map((item, index) => (
                            <div key={index} className="flex items-center  w-full gap-5 max-lg:gap-[30px] lg:gap-[27px] mb-[27px] max-lg:mb-[18px]">
                                {/* Progress circle container with fixed dimensions */}
                                <div className="flex-shrink-0 w-[38px] h-[38px] max-lg:h-[45px] max-lg:w-[45px] xl:h-[46px] xl:w-[46px]">
                                    <CircleProgress percentage={item.progress} size={circleSize} strokeWidth={circleSize * 0.08} />
                                </div>

                                {/* Content container with flexible width */}
                                <div className="flex-grow min-w-0 gap-[7px] ">
                                    <div className="font-medium truncate text-[14px] max-lg:text-[17px] xl:text-[17px]">
                                        {item.title}
                                    </div>
                                    <p className=' font-medium text-[#9D9D9D] text-[10px] max-lg:text-xs xl:text-xs'>
                                        {item.date}
                                    </p>
                                </div>

                                {/* Improvement percentage */}
                                <div className="flex-shrink-0 text-[#36AF8D] text-[10px] xl:text-xs max-lg:text-xs font-medium md:w-1/4 text-end">
                                    &bull; {item.improvement}%
                                </div>
                            </div>
                        ))}

                    </ScrollArea>

                </CardStudent > :

                    <CardStudent className='dark:bg-[#181A1D] bg-[#F3F4F9] h-[229px] max-lg:h-[274px]   dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8]
         shadow-md px-5 py-[10px] lg:px-[25px] lg:py-[21px] flex w-full items-center justify-center text-center
             max-lg:px-[25px] max-lg:py-[13px]' title='My Learning' description=''>
                        <div className=' space-y-6 tracking-wide'>
                            <p className="text-[#36AF8D] text-[16px]">No learning analytics yet</p>
                            <p className='text-[16px]'>Plant the first seed of Progress today!</p>
                        </div>


                    </CardStudent >
            }
        </>






    );
};

export default MyLearning;
