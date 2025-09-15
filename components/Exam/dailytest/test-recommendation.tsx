"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const recommendations = [
    {
        title: "Time Management",
        icon: "/newIcons/alarm.svg", // update with actual file path
        description:
            "Allocate more time to Biochemistry questions where you have lower accuracy (65%) despite spending only 28 minutes. Be more cautious with Anatomy questions where your confidence (85%) exceeds your accuracy (76%), leading to errors.",
    },
    {
        title: "Confidence Calibration",
        icon: "/newIcons/pieChart.svg", // update with actual file path
        description:
            "Be more cautious with Anatomy questions where your confidence (85%) exceeds your accuracy (76%), leading to errors.",
    },
    {
        title: "Topic Focus",
        icon: "/newIcons/notes.svg", // update with actual file path
        description:
            "Prioritize reviewing Genetic Disorders (62% accuracy) and Liver Pathology (65% accuracy) where you show consistent weakness.",
    },
];


export default function RecommendationsCard() {
    return (
        <Card className="h-full bg-transparent dark:bg-transparent text-white border-none p-0  w-full ">
            <CardContent className="p-0 shadow-none">
                <h3 className="text-[22px] font-bold mb-6 text-[#184C3D] dark:text-white">
                    Personalized Recommendations
                </h3>

                <div className="space-y-4 dark:bg-[#181A1D] bg-[#F3F4F9]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md  rounded-xl px-[26px] py-5">
                    {recommendations.map((rec, index) => (
                        <div
                            key={index}
                            className="flex gap-4 p-5  border dark:border-[#303336] border-[#B8B8B8]  rounded-[9px] "
                        >
                            <div className="min-w-[28px] mt-1">
                                <Image
                                    src={rec.icon}
                                    alt={`${rec.title} icon`}
                                    width={32}
                                    height={32}
                                />
                            </div>
                            <div className="font-pt-sans">
                                <h4 className="text-[#36AF8D] text-base font-medium mb-4">
                                    {rec.title}
                                </h4>
                                <p className="text-sm text-[#BDBDBD]">{rec.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
