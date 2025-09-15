import { useState } from "react";
import { CardElementHome } from "./UI/element-home-card";
import Image from "next/image"
import chart from "@/public/barChart.svg"

export default function PersonalizedRecommendation() {
    const [loading, setLoading] = useState<boolean>(false)

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


    return (
        <CardElementHome loading={loading} classes={""} title="Personalized Recommendation">
            <div className="space-y-[15px]">
                {recommendations.map((rec, index) => (
                    <div
                        key={index}
                        className="flex gap-4 p-5  border dark:border-[#303336] border-[#B8B8B8] rounded-[9px] "
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