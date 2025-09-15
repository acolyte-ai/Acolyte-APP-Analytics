import React from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const MyDecksSkeleton = () => {
    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-8 w-24" />

                    {/* Toggle Buttons Skeleton */}
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-28 rounded-full" />
                        <Skeleton className="h-9 w-32 rounded-full" />
                    </div>
                </div>

                {/* Decks Grid Skeleton */}
                <div className="grid grid-cols-2 gap-[30px]">
                    {Array.from({ length: 6 }).map((_, index) => (

                        <Card
                            key={index}
                            className=" px-5 py-[26px] xl:py-[18px]  dark:bg-[#181A1D]/70 bg-[#F3F4F9]/70 transition-colors cursor-pointer"
                        >
                            <CardHeader className="p-0 space-y-7 space-x-[22px]">
                                <div className="flex items-center justify-between font-causten-semibold">
                                    <div className='space-y-2'>
                                        <Skeleton className="dark:text-white text-black font-causten-semibold max-sm:text-sm text-xl xl:text-[23px] h-5 w-10">

                                        </Skeleton>
                                        <Skeleton className="dark:text-[#C6C6C6] text-black max-sm:text-xs text-[15px] xl:text-[17px] h-5 w-7">

                                        </Skeleton>
                                    </div>
                                    <div className="  flex items-center justify-center">
                                        <Skeleton

                                            width={15}
                                            height={15}
                                            alt="Flashcard icon"
                                            className="w-9 h-9 xl:h-[51px] object-contain max-sm:w-5 max-sm:h-5 "
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyDecksSkeleton;