import { useState } from "react";
import { CardElementHome } from "./UI/element-home-card";
import useUserId from "@/hooks/useUserId";


export default function KnowledgeInsights() {
    const [loading, setLoading] = useState<boolean>(false)
    const userId = useUserId()
    const cardsData = [
        {
            heading: "Most Connected Concepts",
            title: "Heart",
            subtitle: "8 connections"
        },
        {
            heading: "Strongest connection",
            title: "Heart - cardiac cycle",
            subtitle: "90% relationship strength"
        },
        {
            heading: "Recommended focus",
            title: "Heart Failure",
            subtitle: "32% mastery high importance"
        }
    ];

    return (
        <CardElementHome loading={loading} classes={"h-[280px]"} title="Knowledge Insights">
            <div className="flex gap-4 font-pt-sans ">
                {cardsData.map((card, index) => (
                    <div
                        key={index}
                        className="bg-[#212427] border h-[240px] border-[#303336] rounded-[9px] px-[21px] py-[19px] flex-1"
                    >
                        <h3
                            className="text-[#36AF8D] text-[20px] font-medium mb-[17px]"
                        >
                            {card.heading}
                        </h3>
                        {
                            true ? (
                                <p className="text-[#BDBDBD] text-[14px] font-medium mb-1">
                                    No Learning Analytics yet to plant the first seed of progress today
                                </p>

                            ) : (

                                <>
                                    <p className="text-white text-[16px] font-medium mb-1">
                                        {card.title}
                                    </p>
                                    <p className="text-[#9D9D9D] text-[16px]">
                                        {card.subtitle}
                                    </p>
                                </>
                            )
                        }

                    </div>
                ))}
            </div>
        </CardElementHome>
    )
}