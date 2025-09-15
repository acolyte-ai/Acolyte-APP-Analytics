"use client"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,

} from "@/components/ui/card"
import {
    ChartConfig,
} from "@/components/ui/chart"
import { STUDY_PERFORMANCE_ANALYTICS } from "./api/url"
import { useEffect, useState } from "react"
import axios from "axios"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { CardElementHome } from "./UI/element-home-card"
import useUserId from "@/hooks/useUserId"
export const description = "A multiple bar chart"



const chartConfig = {
    "retentionScore": {
        label: "retentionScore",
        color: "#7086FD",
    },
    "hoursSpent": {
        label: "hoursSpent",
        color: "#6EE7B7",
    },
} satisfies ChartConfig

export function StudyPerformanceAnalytics() {
    const [chartData, setChartData] = useState<{
        "subject": string,
        "retentionScore": number,
        "hoursSpent": number,
        "status": string
    }[]>()
    const [loading, setLoading] = useState(false)
    const userId = useUserId()

    const init = async () => {
        try {
            setLoading(true);

            const response = await axios.get(process.env.NEXT_PUBLIC_HOME_BASE_URL + STUDY_PERFORMANCE_ANALYTICS + userId);

            setChartData(response.data.studyPerformance)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            console.log(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
            setLoading(false);
        }
    };


    useEffect(() => {
        if (!userId) return;
        init();
    }, [userId]);
    return (
        <>
            <CardElementHome loading={loading} classes={"h-[358px]"} title="Optimal Study Performance Analysis">
                {/* Main Chart */}
                <Card className="bg-transparent dark:bg-transparent border-none p-0 shadow-none">
                    <CardContent className="p-0">
                        <div className="h-[121px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="subject"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        domain={[0, 180]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        domain={[0, 60]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    />
                                    <Bar
                                        yAxisId="left"
                                        dataKey="hoursSpent"
                                        fill="#6366F1"
                                        barSize={45}
                                        radius={[2, 2, 0, 0]}
                                        name="Hours spent"
                                    />
                                    <Bar
                                        yAxisId="right"
                                        dataKey="retentionScore"
                                        fill="#10B981"
                                        barSize={45}
                                        radius={[2, 2, 0, 0]}
                                        name="Retention score %"
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center mt-4 space-x-6">
                            <div className="flex items-center space-x-2">
                                <div className="border border-gray-400 p-1 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-[#7086FD]"></div>
                                </div>
                                <span className="text-gray-300 text-sm">Hours spent</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="border border-gray-400 p-1 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                </div>
                                <span className="text-gray-300 text-sm">Retention score %</span>
                            </div>
                        </div>

                        {/* Chart Title */}
                        <p className="text-center text-gray-300 mt-[11px] text-sm">
                            Hours spent vs. retention score by subject
                        </p>

                        <div className="bg-[#222428] font-pt-sans px-5 py-[19px] mt-4 rounded-[9px] text-[14px] font-medium">
                            <p className="text-[#36AF8D] mb-3 text-[16px] ">Efficiency Insight</p>
                            <p>  Physiology shows the highest efficiency: 90% retention with just 12.8 hours.
                                Pathology requires more focus with 22.3 hours yielding 65% retention.</p>
                        </div>


                    </CardContent>
                </Card>
            </CardElementHome>
        </>
    )
}
