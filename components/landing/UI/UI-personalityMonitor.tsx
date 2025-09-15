import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MoveLeft } from 'lucide-react';

const PersonalityTestHeader = ({ progress, currentQuestion, totalQuestions, handlePrevious, start }) => {


    return (

        <div className=" bg-gradient-to-l  from-[#141414] to-[#191F1D]  flex items-center justify-center w-full my-20 h-[232px]">
            <Card className="px-[72px] py-[35px] max-w-7xl grow bg-gradient-to-l rounded-[20px] to-[#1f2523] from-[#171717] border-none  shadow-drop-[10px]">
                <CardContent className="p-0 font-[hartwellAlt]">
                    {/* Header Text */}
                    <div className="text-center mb-[57px]">
                        <h1 className="text-[45px] font-medium text-[#D8D8D8] mb-[33px]">
                            Personality Test
                        </h1>
                        <p className="text-[#B7B7B7] text-[20px] ">
                            Understand How You Think, Learn, And Grow.
                        </p>
                    </div>

                    {/* Progress Section */}
                    <div className="flex items-center justify-between gap-[29px]">
                        {
                            start !== 0 && <Button
                                type="button"
                                onClick={handlePrevious}
                                className="bg-transparent space-x-5 dark:bg-transparent border-emerald-500 dark:border-emerald-500 rounded-full px-20 font-bold text-[20px] py-3"
                                variant="outline"
                            >
                                <MoveLeft className='scale-150' />   <p>Previous</p>
                            </Button>
                        }
                        <span className="text-[#38977C] font-medium text-[20px]">
                            {progress}%
                        </span>
                        <div className="w-full bg-[#244038] rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-[#38977C] transition-all duration-300 ease-out rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-[#38977C] font-medium text-[20px]">
                            {currentQuestion}/{totalQuestions}
                        </span>
                    </div>



                </CardContent>
            </Card>
        </div>

    );
};

export default PersonalityTestHeader;