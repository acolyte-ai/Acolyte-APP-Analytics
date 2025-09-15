import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const MyRecentSkeleton = () => {
    return (


        <Card className="dark:bg-transparent bg-transparent border-none shadow-none h-full w-full">
            <CardHeader className='p-0 pb-[15px]'>
                <CardTitle className="text-[#184C3D] dark:text-white text-[22px] xl:text-[24px]"> </CardTitle>
            </CardHeader>
            <CardContent className='dark:bg-[#181A1D] bg-[#F3F4F9] rounded-[7px] w-full  py-[26px] px-[20px] h-auto
             2xl:py-[28px] 2xl:px-[22px]   dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border
             border-[#B8B8B8] shadow-md xl:py-[17px] xl:px-[33px]'>
                <div className="space-y-4">
                    {Array.from({ length: 7 }).map((item, index) => (
                        <div key={index} className='space-y-6'>


                            <div className="flex items-center justify-between font-causten-semibold  rounded  cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Skeleton className='w-[22px] h-[22px] xl:w-[18px] xl:h-5' />
                                    <Skeleton className="dark:text-white text-black text-base 2xl:text-[17px]"></Skeleton>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="text-[15px] dark:text-[#C6C6C6] text-black 2xl:text-[16px]"></Skeleton>
                                    <ChevronRight className="w-4 h-4 dark:text-[#C6C6C6] text-gray-300" />
                                </div>
                            </div>



                            {/* Add separator after each item except the last one */}

                            <Separator className=" dark:bg-muted bg-gray-200" />

                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

    );
};

export default MyRecentSkeleton;