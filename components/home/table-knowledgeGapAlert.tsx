import { useState } from "react";
import { CardElementHome } from "./UI/element-home-card";
import { Button } from "../ui/button";
import chart from "@/public/barChart.svg"
import Image from 'next/image';
import useUserId from "@/hooks/useUserId";

export default function KnowledgeGapAlerts() {
    const [loading, setLoading] = useState<boolean>(false)
    const userId = useUserId()
    const cardsData = [
        {
            title: "Heart failure management",
            category: "Cardiovascular system",
            lastStudied: "Last studied : 21 days ago",
            retention: "38% Retention",
            buttonText: "Schedule Review"
        },
        {
            title: "Heart failure management",
            category: "Cardiovascular system",
            lastStudied: "Last studied : 21 days ago",
            retention: "38% Retention",
            buttonText: "Schedule Review"
        },
        {
            title: "Heart failure management",
            category: "Cardiovascular system",
            lastStudied: "Last studied : 21 days ago",
            retention: "38% Retention",
            buttonText: "Schedule Review"
        }
    ];
    return (
        <CardElementHome loading={loading} classes={"h-[500px]"} title="Knowledge Gap Alerts">
            <div className="space-y-4 p-4">
                {cardsData.map((card, index) => (
                    <div
                        key={index}
                        className="bg-transparent border border-[#303336] rounded-[9px] px-[21px] py-[19px] flex justify-between items-center"
                    >
                        <div className="flex-1">
                            <h3 className="text-[#36AF8D] text-[16px] font-normal mb-1">
                                {card.title}
                            </h3>
                            <p className="text-[#BDBDBD] text-[16px] font-medium mb-[17px]">
                                {card.category}
                            </p>
                            <p className="text-[#BDBDBD] text-[14px] font-medium">
                                {card.lastStudied}
                            </p>
                        </div>

                        <div className="flex flex-col gap-[17px] ml-6">
                            <Button className="bg-transparent border border-[#36AF8D] dark:bg-[#212427] text-[#36AF8D] dark:border-[#36AF8D] dark:text-[#36AF8D] rounded-full px-5 py-2  text-[14px] font-medium whitespace-nowrap">
                                {card.retention}
                            </Button>
                            <Button className="bg-transparent border border-[#36AF8D] dark:bg-transparent text-[#36AF8D] dark:border-[#36AF8D] dark:text-[#36AF8D] px-2 py-2 rounded-[9px] text-[14px] font-medium whitespace-nowrap">
                                {card.buttonText}
                            </Button>
                        </div>
                    </div>
                ))}

                {/* {

                    <div className='flex  items-center justify-center gap-5 h-[450px]'>
                        <Image src={chart}

                            alt={"goals"}
                            height={50}
                            width={50}
                            className='h-[38px] w-[38px]'
                        >

                        </Image>
                        <div className='text-left' >
                            <p className='text-[#36AF8D] text-[16px]'>No Data yet</p>
                            <p className='text-[16px]'>Plant the first seed of Progress today!</p>
                        </div>
                    </div>

                } */}
            </div>
        </CardElementHome>
    )
}