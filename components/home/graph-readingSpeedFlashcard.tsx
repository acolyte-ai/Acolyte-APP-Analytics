import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { CardElementHome } from "./UI/element-home-card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { FLASHCARD_ANALYTICS } from "./api/url";
import axios from "axios";

interface RetentionRate {
    day: number;
    retention: number;
    totalAttempts: number;
    correctAnswers: number;
}

interface SubjectRetention {
    subject: string;
    retentionRates: RetentionRate[];
}

interface RetentionData {
    retentionData: SubjectRetention[];
}

// Define the output data structure
interface ChartDataPoint {
    day: string;
    [subject: string]: string | number;
}

const PATTERN_COLORS: { [val: number]: string } = {
    1: "#34d399", // mint green
    2: "#f87171", // coral red
    3: "#f59e0b", // golden amber
    4: "#06b6d4", // sky blue
    5: "#8b5cf6", // royal purple
    6: "#ec4899", // hot pink
    7: "#10b981", // forest green
    8: "#6366f1", // electric blue
    9: "#f97316", // vivid orange
    10: "#14b8a6", // turquoise
    11: "#a855f7", // deep purple
    12: "#ef4444", // bright red
    13: "#3b82f6", // ocean blue
    14: "#22c55e", // fresh green
    15: "#eab308", // sunshine yellow
    16: "#d946ef", // magenta
    17: "#0891b2", // steel blue
    18: "#84cc16", // lime green
    19: "#f43f5e", // rose pink
    20: "#64748b", // slate zinc
};

// Function to transform the API data to chart format
const transformFlashcardDataToChart = (flashcardData) => {
    if (!flashcardData || flashcardData.length === 0) {
        return [];
    }

    // Get all unique days from the first subject (assuming all subjects have same days)
    const days = flashcardData[0]?.dailyData || [];

    // Transform data: each day becomes a row, each subject becomes a column
    const chartData = days.map(dayInfo => {
        const dataPoint = {
            day: dayInfo.day, // "Day 1", "Day 2", etc.
            dayNumber: dayInfo.dayNumber,
            date: dayInfo.date
        };

        // Add each subject's flashcard count for this day
        flashcardData.forEach(subjectData => {
            const dayData = subjectData.dailyData.find(d => d.dayNumber === dayInfo.dayNumber);
            dataPoint[subjectData.subject] = dayData ? dayData.flashcardsCreated : 0;
        });

        return dataPoint;
    });

    return chartData;
};

export default function ReadingSpeedFlashCard() {
    const [data, setData] = useState<ChartDataPoint[]>([])
    const [loading, setLoading] = useState(false)
    const [subjects, setSubjects] = useState<{ subject: string, color: string }[]>([])
    const [insights, setInsights] = useState<string>("")
    const [error, setError] = useState<string | null>(null)
    const { theme } = useTheme();

    // Dynamic colors based on theme
    const axisTextColor = theme === 'dark' ? "#9CA3AF" : "#6B7280"; // zinc-400 for dark, zinc-500 for light
    const gridColor = theme === 'dark' ? "#E5E7EB" : "#374151"// zinc-700 for dark, zinc-200 for light
    const legendTextColor = theme === 'dark' ? "#F9FAFB" : "#111827"; // zinc-50 for dark, zinc-900 for light
    const descriptionTextColor = theme === 'dark' ? "text-zinc-300" : "text-zinc-600"; // zinc-300 for dark, zinc-600 for light

    const init = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Using custom data instead of API call
            const customData = {
                "days": ["Day 1","Day 2","Day 3","Day 4","Day 5","Day 6"],
                "series": [
                    {"subject":"Anatomy","cards_created":[4,5,6,6,5,7]},
                    {"subject":"Cardiology","cards_created":[3,4,5,4,3,5]},
                    {"subject":"Emergency medicine","cards_created":[2,2,3,3,2,4]},
                    {"subject":"Pathology","cards_created":[1,2,2,2,3,3]},
                    {"subject":"Radiology","cards_created":[0,1,1,2,2,2]}
                ],
                "insight":"Card creation ramps through the week, peaking on Day 6 (Anatomy 7). Keep Anatomy/Cardiology daily; schedule Radiology on alternate days."
            };

            // Convert custom data to chart format
            const chartData = customData.days.map((day, dayIndex) => {
                const dataPoint: ChartDataPoint = { day };
                customData.series.forEach((subject) => {
                    dataPoint[subject.subject] = subject.cards_created[dayIndex] || 0;
                });
                return dataPoint;
            });

            setInsights(customData.insight);

            // Create subject labels with colors
            const labels = customData.series.map((item, index) => {
                return {
                    subject: item.subject,
                    color: PATTERN_COLORS[index + 1] || "#525252"
                }
            });

            setSubjects(labels);
            setData(chartData);
            setLoading(false);
        } catch (err) {
            console.error('Error processing data:', err);
            setError(err instanceof Error ? err.message : 'Failed to process data');
            setLoading(false);
        }
    };

    useEffect(() => {
        init();
    }, []);

    const CustomLegend = ({ payload }) => {
        return (
            <div className="flex justify-center gap-6 mt-4 flex-wrap">
                {subjects.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-[14px] text-[#BDBDBD]" >
                            {entry.subject}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`
                    ${theme === 'dark' ? 'bg-zinc-800 border-zinc-600' : 'bg-white border-zinc-200'}
                    border rounded-lg p-3 shadow-lg
                `}>
                    <p className={`${theme === 'dark' ? 'text-white' : 'text-zinc-900'} font-medium mb-2`}>
                        On {label}
                    </p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm grid grid-cols-2 gap-4" style={{ color: entry.color }}>
                            <span className="">{entry.dataKey}:</span> <span>{entry.value} Flashcards viewed</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };
    return (
        <CardElementHome loading={loading} classes={"h-[449px] max-sm:h-[520px] max-[330px]:h-[570px] md:h-[500px] py-[19px] px-6 relative"} title="Reading Speed & Flashcard Creation">
            <div className="rounded-lg font-causten-semibold">
                <div className="h-[280px] max-md:h-[220px] max-sm:h-[280px] w-full max-sm:mb-2 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{
                                top: 20,
                                right: 20,
                                left: -10,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={gridColor}
                                opacity={0.3}
                            />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: axisTextColor, fontSize: 12 }}
                            />
                            <YAxis
                                domain={[0, 'dataMax + 10']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: axisTextColor, fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={<CustomLegend payload={subjects} />} />
                            {
                                subjects.map((item, index) => (
                                    <Line
                                        key={index}
                                        type="monotone"
                                        dataKey={item.subject}
                                        stroke={item.color}
                                        strokeWidth={3}
                                        dot={{ fill: item.color, strokeWidth: 2, r: 5 }}
                                        activeDot={{ r: 7, stroke: item.color, strokeWidth: 2 }}
                                    />
                                ))
                            }
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <p className={`text-center  dark:text-[#BDBDBD] text-black  mb-4 text-[16px] max-sm:mb-2 max-sm:text-xs`}>
                    Daily flashcard creation by subject
                </p>

                <div className="mt-6 border w-[calc(100%-48px)] absolute bottom-[19px] dark:bg-[#222428] bg-transparent border-[#303336] px-5 py-[19px] rounded-[9px] text-[14px]">
                    <h3 className="text-[#36AF8D] mb-3 text-[16px] font-causten-semibold">
                        Flashcard creation Insight
                    </h3>
                    <p className="dark:text-[#BDBDBD] text-[16px] text-black">
                        {insights || "No insights available at the moment."}
                    </p>
                </div>
            </div>
        </CardElementHome>
    )
}