"use client"
import React, { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FLASHCARD_DASHBOARD, GET_FLASHCARD } from '@/components/flashcards/api/url';
import useUserId from '@/hooks/useUserId';
import axios from 'axios';
import FlashcardInterface from '@/components/flashcards/dashboard/flascard-dashboard-create';
import MyDecks from '@/components/flashcards/dashboard/flascard-dashboard-Decks';
import RecentCard from '@/components/flashcards/dashboard/flascard-dashboard-recent';
import AnswerChangeChartCard from '@/components/Exam/dailytest/test-reviewCharts';
import BookmarkedCards from '@/components/flashcards/dashboard/flascard-dashboard-bookmarks';
import AISuggestions from '@/components/flashcards/dashboard/flascard-dashboard-suggestions';
import { useUpdateLearningToolTime } from '@/hooks/useUpdateLearningToolTime';
import { toast } from 'sonner';
import { useSettings } from '@/context/store';
import { getDocName } from '@/lib/utils';


interface DashboardData {
    dueCards: {
        count: number;
        estimatedTime: number;
    };
    totalFlashcardCount: number;
    subjects: any[]; // Replace 'any[]' with the actual type if known
    recentSubjects: any[]; // Replace 'any[]' with the actual type if known
    books: { bookName: string; count: number }[];
    materialDistribution: { material: string; percentage: number }[];
    bookmarkedCards: any[]; // Replace 'any[]' with the actual type if known
}

interface MaturityData {
    Mature: number;
    Young: number;
    Learning: number;
    New: number;
}

interface TransformedMaturityItem {
    name: string;
    value: number;
    color: string;
}

export default function FlashCardLayout() {
    const [chartData, setChartData] = useState([]);
    const [chartDatas, setChartDatas] = useState([]);
    const [dashboardData, setDashboardData] = useState<DashboardData | undefined>();
    const [bookMArks, setBookMarks] = useState([])
    const [decks, setDecks] = useState([])
    const [loading, setLoading] = useState<boolean>(false)
    const userId = useUserId();
    const startTimeRef = useRef(null);
    const { fileSystem } = useSettings();


    const { updateLearningToolTime } = useUpdateLearningToolTime(userId);
    // Color palette
    const colors = [
        // Emerald shades
        "#f59e0b", // golden amber
        "#06b6d4", // sky blue
        "#8b5cf6", // royal purple
        "#ec4899", // hot pink
        "#10b981", // forest green
        "#6366f1", // electric blue
        "#f97316", // vivid orange
        "#14b8a6", // turquoise

        // Amber shades
        "#FEF3C7", "#FDE68A", "#FCD34D", "#FBBF24", "#F59E0B",
        "#D97706", "#B45309", "#78350F", "#FFFBEB", "#FFF7ED",

        // Zinc shades (grays)
        "#FAFAFA", "#F4F4F5", "#E4E4E7", "#D4D4D8", "#A1A1AA",
        "#71717A", "#52525B", "#3F3F46", "#27272A", "#18181B",

        // More Emerald variants
        "#CCFBF1", "#99F6E4", "#5EEAD4", "#2DD4BF", "#14B8A6",
        "#0D9488", "#0F766E", "#115E59", "#134E4A", "#042F2E",

        // More Amber variants
        "#FFF3C4", "#FFE69A", "#FFD66E", "#FFC043", "#FFB020",
        "#F29E02", "#CC8500", "#B47200", "#8C5D00", "#5C3E00"
    ];







    const subjectList = [


        {
            subject: "Physiology",
            count: 0
        },
        {
            subject: "Pathology",
            count: 0
        },
        {
            subject: "Anatomy",
            count: 0
        },
        {
            subject: "Micro Biology",
            count: 0
        },
        {
            subject: "Pharmacology",
            count: 0
        },
        {
            subject: "Pediatrics",
            count: 0
        },
        {
            subject: "Obstetrics & GyG",
            count: 0
        },
        {
            subject: "Orthopedics",
            count: 0
        },
        {
            subject: "Oncology",
            count: 0
        },
        {
            subject: "Radiology",
            count: 0
        },
        {
            subject: "Dermatology",
            count: 0
        },
        {
            subject: "Cardiology",
            count: 0
        },
        {
            subject: "Emergency Medicine",
            count: 0
        },
        {
            subject: "Psychiatry",
            count: 0
        },
        {
            subject: "Biochemistry",
            count: 0
        }

    ]

    // Time tracking
    useEffect(() => {
        startTimeRef.current = Date.now();
        return () => {
            const endTime = Date.now();
            const timeSpentInSeconds = Math.floor((endTime - startTimeRef.current) / 1000);
            updateLearningToolTime("flashCardTime", timeSpentInSeconds);
        };
    }, [updateLearningToolTime]);


    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const response = await axios.get(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + FLASHCARD_DASHBOARD + userId);
            console.log("=====", response.data)
            setDashboardData(response.data);

            //decks
            const allSubjects = subjectList.map((item) => {
                const filteredData = response.data.subjects.filter((obj) => (obj.subject === item.subject))[0]
                console.log("=====", filteredData)
                if (item.subject === filteredData?.subject) {
                    return { subject: item.subject, count: filteredData.count }
                } else {
                    return { subject: item.subject, count: 0 }
                }
            })

            console.log("=====", allSubjects)
            setDecks(allSubjects)

            // Transform data to the required format
            const transformedDatas = response.data.books.map((item, index) => ({
                name: getDocName(item.bookName, fileSystem),
                value: item.count,
                color: colors[index % colors.length]
            }));

            setChartDatas(transformedDatas);

            const maturityData = response.data.maturity;

            // Transform data to the required format
            const transformedDatamaturityData = Object.entries(maturityData).map(([key, value], index) => ({
                name: key,
                value: value,
                color: colors[index % colors.length]
            }));



            setBookMarks(response.data.bookmarkedCards)
            setChartData(transformedDatamaturityData);
            setLoading(false)
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            console.log(err.message || 'Failed to fetch dashboard data');
            setLoading(false);
        }
    };


    useEffect(() => {
        if (!userId) return
        fetchDashboardData();
    }, [userId, fileSystem])


    const handleBookmark = async (id: string, heading: string) => {
        try {
            const response = await axios.post(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + "/dev/v1/flashcard/bookmark", {
                "flashcard_id": id,
                "userId": userId
            });
            toast.success("Bookmarked " + heading, {
                position: "bottom-right",
                style: {
                    fontSize: '16px', // Fixed syntax error and increased base font size

                    '--toast-icon-size': '24px', // Makes the tick icon bigger
                } as React.CSSProperties,
                actionButtonStyle: {
                    fontSize: '14px', // Button text size
                    padding: '8px 16px', // Makes button bigger
                    minHeight: '36px', // Button height
                }
            });
            fetchDashboardData()
            return true
        } catch (error) {
            console.log("error::", error?.message);
            return false
        }
    };

    const handleBookmarkDelete = async (id: string, heading: string) => {
        try {
            const response = await axios.patch(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + "/dev/v1/flashcard/bookmark", {
                "flashcard_id": id,
                "userId": userId
            });
            toast.success("deleted bookmark " + heading, {
                position: "bottom-right",
                style: {
                    fontSize: '16px', // Fixed syntax error and increased base font size

                    '--toast-icon-size': '24px', // Makes the tick icon bigger
                } as React.CSSProperties,
                actionButtonStyle: {
                    fontSize: '14px', // Button text size
                    padding: '8px 16px', // Makes button bigger
                    minHeight: '36px', // Button height
                }
            });
            fetchDashboardData()
            return true
        } catch (error) {
            console.log("error::", error?.message);
            return false
        }
    };


    const handleGEtFlashCard = async (id: string | undefined) => {
        console.log('Creating new deck...');
        try {
            const response = await axios.get(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + GET_FLASHCARD + `flashcard_id=${id}&userId=${userId}`);
            fetchDashboardData()
            return response.data.flashcard

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            console.log(err.message || 'Failed to fetch dashboard data');
            return null

        }
    };

    return (
        <div className="h-full flex flex-col pb-24 xl:pb-32 font-causten-semibold">
            <div className="flex-1 p-8 max-md:mb-10 overflow-y-auto no-scrollbar">
                <div className="space-y-[33px] max-md:space-y-[22px] xl:space-y-[36px] ">

                    {/* Row 1 */}
                    <div className="grid grid-cols-7 xl:grid-cols-6 2xl:grid-cols-4 max-lg:grid-cols-1
                          gap-[33px] max-md:gap-[22px] xl:gap-[36px] items-stretch">
                        <div className="col-span-3 max-lg:col-span-full 2xl:col-span-2">
                            <FlashcardInterface
                                handleBookmark={handleBookmark}
                                handleBookmarkDelete={handleBookmarkDelete}
                                handleGEtFlashCard={handleGEtFlashCard}
                                count={dashboardData?.dueCards.count || 0}
                                percentage={dashboardData?.totalFlashcardCount || 0}
                                estimatedTime={dashboardData?.dueCards.estimatedTime || 0}
                            />
                        </div>

                        <div className="col-span-4 xl:col-span-3 max-lg:col-span-full 2xl:col-span-2">
                            <MyDecks subjects={decks} handleBookmark={handleBookmark} handleBookmarkDelete={handleBookmarkDelete} handleGEtFlashCard={handleGEtFlashCard} />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-7 xl:grid-cols-6 2xl:grid-cols-4 max-lg:grid-cols-1
                gap-[33px] max-md:gap-[22px] xl:gap-x-[36px]  md:min-h-[420px] h-full">
                        <div className="col-span-3 max-lg:col-span-full 2xl:col-span-2 h-[420px]">
                            <RecentCard recent={dashboardData?.recentSubjects ?? []} />
                        </div>

                        <div className="col-span-4 xl:col-span-3 max-lg:col-span-full 2xl:col-span-2  max-sm:h-auto  h-[420px]">
                            <AnswerChangeChartCard
                                data={chartData}
                                dataQuestionNavigation={chartDatas}
                                title1={"Flashcard sources by material"}
                                title2={"Learning Stage"}
                                chart_1_label={"Distribution of flashcards sources by material"}
                                chart_2_label={"Distribution of cards by learning stage"}
                                height={"314px"}
                            />
                        </div>
                    </div>
                    {/* Row 3 */}
                    <div className="grid grid-cols-7 xl:grid-cols-6 2xl:grid-cols-4 max-lg:grid-cols-1 
                          gap-[33px] max-md:gap-[22px] xl:gap-[36px] items-start">
                        <div className="col-span-4 xl:col-span-4 max-lg:col-span-full 2xl:col-span-3">
                            <BookmarkedCards data={bookMArks} />
                        </div>

                        <div className="col-span-3 xl:col-span-2 max-lg:col-span-full 2xl:col-span-1">
                            <AISuggestions />
                        </div>
                    </div>
                </div>

                {/* Add some extra spacing at the bottom */}
                {/* <div className="h-3"></div> */}
            </div>
        </div>
    );

}







