import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CardElementFlashcard } from '../UI/element-flashcard-card';

const MasteryOverview = () => {
    const masteryData = [
        { label: 'Well knows', count: 5, color: 'text-[#36AF8D]' },
        { label: 'Need review', count: 3, color: 'text-[#36AF8D]' },
        { label: 'Skill Learning', count: 2, color: 'text-[#36AF8D]' },
        { label: 'Review now', count: 1, color: 'text-[#36AF8D]' }
    ];

    return (

        <CardElementFlashcard loading={false} backgroundHidden={true} classes={""} title={"Mastery Overview"} >
            <div className="
            font-pt-sans px-5 py-[26px] xl:py-[17px] xl:px-[33px] h-full flex flex-col items-center justify-center w-full">


                <div className="grid grid-cols-2 gap-5 xl:gap-[22px] w-full">
                    {masteryData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between w-full">
                            <span className={`${item.color} text-xl xl:text-[22px] font-medium text-[#36AF8D]`}>
                                {item.label}
                            </span>
                            <span className={`${item.color} text-xl xl:text-[22px] font-medium text-[#CF8A25]`}>
                                {item.count}
                            </span>
                        </div>
                    ))}
                </div>

            </div>
        </CardElementFlashcard>
    );
};

export default MasteryOverview;