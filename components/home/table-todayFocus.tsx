

// Updated component with the transformer function
import { useEffect, useState } from "react";
import { CardElementHome } from "./UI/element-home-card";
import axios from "axios";
import useUserId from "@/hooks/useUserId";
import { getDocName } from "@/lib/utils";
import { useSettings } from "@/context/store";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";



// Function to transform API response to match the expected card data format
const transformApiResponseToCardData = (apiResponse, fileSyste: []) => {
    if (!apiResponse || !apiResponse.todaysFocus) {
        return [];
    }

    const { todaysFocus } = apiResponse;

    // Transform weak areas
    const weakAreasItems = (todaysFocus.weak_areas || []).map(item => ({
        name: item.topic || "Unknown Topic",
        percentage: `${item.progress_pct || 0}%`,

    }));

    // Transform due for review
    const dueForReviewItems = (todaysFocus.due_for_review || []).map(item => ({
        name: getDocName(item.resource || "Unknown Resource", fileSyste),
        percentage: `${item.progress_pct || 0}%`,

    }));

    // Transform recently mastered
    const recentlyMasteredItems = (todaysFocus.recently_mastered || []).map(item => ({
        name: getDocName(item.topic || "Unknown Topic", fileSyste),
        percentage: `${item.retention_pct || 0}%`
    }));

    // Return the transformed data in the expected format
    return [
        {
            title: "Weak Areas",
            items: weakAreasItems.length > 0 ? weakAreasItems : [
                { name: "No weak areas", percentage: "0%" }
            ]
        },
        {
            title: "Due for review",
            items: dueForReviewItems.length > 0 ? dueForReviewItems : [
                { name: "Nothing due", percentage: "0%" }
            ]
        },
        {
            title: "Recently Mastered",
            items: recentlyMasteredItems.length > 0 ? recentlyMasteredItems : [
                { name: "Nothing mastered yet", percentage: "0%" }
            ]
        }
    ];
};

export default function TodayFocus() {
    const [data, setData] = useState<
        {
            subject: string;
            value: number;
            percentage: number;
            level: string;
            color: string;
        }[]
    >([
        {
            subject: "",
            value: 0,
            percentage: 0,
            level: "",
            color: "",
        },
    ]);
    const [cardsData, setCardsData] = useState([
        {
            title: "Weak Areas",
            items: [
                { name: "Anemia Diagnosis", percentage: "28%" },
                { name: "Differential Diagnosis", percentage: "24%" },
                { name: "Sinus Bradycardia", percentage: "10%" }
            ]
        },
        {
            title: "Due for review",
            items: [
                { name: "Hearing Loss", percentage: "29%" },
                { name: "medical education", percentage: "38%" },
                { name: "Diagnosis of Hearing Disorders", percentage: "42%" }
            ]
        },
        {
            title: "Recently Mastered",
            items: [
                { name: "Management", percentage: "31%" },
                { name: "Acute Kidney Injury Staging", percentage: "22%" },
                { name: "Pediatric Murmurs", percentage: "26%" }
            ]
        }
    ]);
    const [loading, setLoading] = useState(false);
    const { fileSystem } = useSettings()
    const [error, setError] = useState<string | null>(null);
    const userId = useUserId();

    const init = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(process.env.NEXT_PUBLIC_HOME_BASE_URL_GRAPHS + "/dev/v1/today-focus?userId=" + userId);
            const apiData = response.data;

            // Transform the API response to match the cards format
            const transformedCardData = transformApiResponseToCardData(apiData, fileSystem);
            setCardsData(transformedCardData);
            // Keep the original data transformation if you still need it
            setData(apiData);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(err.message || "Failed to fetch dashboard data");
            setData([{
                subject: "null",
                value: 100,
                percentage: 100,
                level: "",
                color: "#525252",
            }]);
            // Set fallback card data on error
            setCardsData([
                {
                    title: "Weak Areas",
                    items: [{ name: "Error loading data", percentage: "0%" }]
                },
                {
                    title: "Due for review",
                    items: [{ name: "Error loading data", percentage: "0%" }]
                },
                {
                    title: "Recently Mastered",
                    items: [{ name: "Error loading data", percentage: "0%" }]
                }
            ]);
            setLoading(false);
        }
    };

    useEffect(() => {
        // Commented out to use custom hardcoded values
        // if (!userId) return;
        // init();
    }, [userId, fileSystem]);

    return (
        <CardElementHome loading={loading} classes={"h-[300px] max-lg:h-auto  "} title="Today's Focus">
            <div className="flex gap-4 max-lg:flex-col max-lg:gap-5 h-full ">
                {cardsData.map((card, index) => (
                    <div
                        key={index}
                        className="bg-transparent border border-[#303336] rounded-[9px] px-[21px] py-[19px] flex-1 overflow-hidden h-auto"
                    >
                        <h3 className={`${card.title === "Weak Areas" ? "text-red" : card.title === "Due for review" ? "text-amber-500" : "text-[#36AF8D]"}  text-base md:text-lg lg:text-[22px] font-causten-semibold mb-[17px]`}>
                            {card.title}
                        </h3>

                        <div className="space-y-[13px] max-lg:space-y-2 no-scrollbar   overflow-y-auto h-[160px]">
                            {card.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center justify-between gap-[17px]">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            {/* <span className={`${card.title === "Weak Areas" ? "text-red" : card.title === "Due for review" ? "text-amber-500" : "text-[#36AF8D]"}  text-sm md:text-base lg:text-[18px] font-normal flex-1 truncate`}>  {item.name || "Topic"}  </span> */}
                                            <span className={`text-[#BDBDBD] text-[16px] md:text-base lg:text-[18px] font-causten-semibold flex-1 truncate`}>  {item.name || "Topic"}  </span>

                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p> {item.name || "Topic"}</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* <button className={`dark:bg-[#303336] bg-transparent ${card.title === "Weak Areas" ? "text-red border-red" : card.title === "Due for review" ? "text-amber-500 border-amber-500" : "text-[#36AF8D] border-[#36AF8D]"}  border  px-[22px]
                                     text-xs md:text-sm lg:text-base py-[7px] md:py-2 rounded-full text-center font-medium whitespace-nowrap`}> */}
                                    <button className={`bg-transparent text-[#BDBDBD] ${card.title === "Weak Areas" ? " border-red" : card.title === "Due for review" ? " border-amber-500" :
                                        "border-[#36AF8D]"} border px-[22px] text-[14px] font-causten-semibold md:text-sm lg:text-base py-[7px] md:py-2 rounded-full text-center font-medium whitespace-nowrap`}>
                                        {item.percentage || "0%"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </CardElementHome>
    )
}