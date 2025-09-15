import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';

const CreateFlashcardSkeleton = () => {
    return (
        <div className="p-6">
            <div className="mx-auto space-y-6">

                {/* Create Flashcard Section Skeleton */}
                <Card className="border-none bg-transparent dark:bg-transparent">
                    <CardHeader className='p-0 pb-[22px]'>
                        <CardTitle className="text-lg font-causten-semibold">
                            Create Flashcard
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-9 py-[26px] px-5 dark:bg-[#181A1D] bg-[#F3F4F9]">
                        <div className="flex justify-center">
                            <Skeleton className="w-16 h-16 rounded-lg" />
                        </div>
                        <Skeleton className="w-full h-10 rounded-md" />
                    </CardContent>
                </Card>

                {/* Cards Due Today Section Skeleton */}
                <Card className="border-none bg-transparent dark:bg-transparent">
                    <CardContent className="dark:bg-[#181A1D] bg-[#F3F4F9] py-[26px] px-5">
                        <div className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors">
                            <div className="flex items-center flex-col space-x-[13px] font-causten-semibold w-full">
                                <div className='flex justify-between w-full items-center'>
                                    <Skeleton className="h-6 w-32" />
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-6 w-8" />
                                        <ChevronRight className="text-gray-500 w-5 h-5" />
                                    </div>
                                </div>

                                <Skeleton className="h-2 w-full mt-4" />

                                <div className="flex items-center justify-between w-full mt-4">
                                    <Skeleton className="h-5 w-28" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CreateFlashcardSkeleton;