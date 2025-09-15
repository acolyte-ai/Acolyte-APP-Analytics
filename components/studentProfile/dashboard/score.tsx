// components/Statistics.tsx
import React from 'react';
import Image from 'next/image';
import fire from "@/public/fire.svg"
import analysis from "@/public/analysis.svg"
import chart from "@/public/barChart.svg"
import { CardStudent } from '../UI/studentCardUI';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatisticData } from '@/components/Dashboards/student-profile/profileTypes';

type StatItem = {
    iconUrl: string;
    title: string;
    subtitle: string;
    value: string;
    parameter: string;
};

const stats: StatItem[] = [
    {
        iconUrl: fire, // Dummy image URL
        title: 'Study Streak',
        subtitle: 'Active Days',
        value: '8',
        parameter: 'd'
    },
    {
        iconUrl: analysis,
        title: 'This Week',
        subtitle: 'Total Study Hour',
        value: '12',
        parameter: 'hr'
    },
    {
        iconUrl: chart,
        title: 'Knowledge Rank',
        subtitle: 'Peer Standing',
        value: '5',
        parameter: '%'
    },
];

const Statistics: React.FC<{ data: StatisticData[] }> = ({ data }: { data: StatisticData[] }) => {
    return (


        <>

            {(data && data.length > 0) ? <CardStudent className='dark:bg-[#181A1D] bg-[#F3F4F9] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md
          h-[197px] max-lg:h-[230px] xl:h-[242px] max-lg:py-[18px] max-lg:px-[25px]  lg:py-[14px] lg:px-5  xl:py-[18px] xl:px-[25px]' title='Statistics' description=''>

                <ScrollArea className='w-full font-pt-sans flex items-center justify-center'>

                    {data.map((stat, index) => (
                        <div key={index} className="flex items-end justify-between w-full  max-lg:mb-[30px] lg:mb-4 xl:mb-6">
                            <div className="flex items-start gap-x-6">
                                {/* Icon container with responsive sizing */}
                                <div className="flex-shrink-0  relative">
                                    <Image
                                        src={stat.iconUrl === "fire" ? fire : stat.iconUrl === "analysis" ? analysis : chart}
                                        alt={stat.title}
                                        height={50}
                                        width={50}
                                        className="object-contain w-6 h-8 max-lg:w-[30px] max-lg:h-10 xl:w-[30px] xl:h-10"
                                    />
                                </div>

                                {/* Text content with responsive spacing and sizing */}
                                <div className="flex flex-col max-lg:gap-[8px] xl:gap-[8px]">
                                    <div className="font-medium lg:text-[17px]
                text-[12px] max-lg:text-[15px] xl:text-[15px]
                  ">
                                        {stat.title}
                                    </div>
                                    <div className="text-[#36AF8D] text-[10px] lg:text-xs max-lg:text-xs xl:text-xs
                  ">
                                        {stat.subtitle}
                                    </div>
                                </div>
                            </div>

                            {/* Value with responsive sizing */}
                            <div className="flex items-baseline justify-center">
                                <p className='text-[29px] text-lg:text-[35px] xl:text-[35px]'>{stat.value}</p>
                                <p className='text-[12px] text-lg:text-[15px] xl:text-[15px]'>{stat.parameter}</p>
                            </div>
                        </div>
                    ))}

                </ScrollArea>

            </CardStudent>
                :

                <CardStudent className='dark:bg-[#181A1D] bg-[#F3F4F9] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md
          h-[197px] max-lg:h-[230px] xl:h-[242px] max-lg:py-[18px] max-lg:px-[25px] flex w-full items-center justify-center text-center lg:py-[14px] lg:px-5  xl:py-[18px] xl:px-[25px]' title='Statistics' description=''>

                    <div className='flex  items-center justify-between gap-5'>
                        <Image
                            src={chart}
                            alt={"goals"}
                            height={50}
                            width={50}
                            className='h-[38px] w-[38px]'
                        >

                        </Image>
                        <div className='text-left' >
                            <p className='text-[#36AF8D] text-[16px]'>No Stats yet</p>
                            <p className='text-[16px]'>Plant the first seed of Progress today!</p>
                        </div>
                    </div>
                </CardStudent>

            }</>



    );
};

export default Statistics;
