"use client"
import { CheckCircle, XCircle, RefreshCcw, SkipForward, ChevronLeft, ChevronRight } from "lucide-react";
import {
    Card,
    CardContent,

    CardFooter,

} from "@/components/ui/card"
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, CartesianGrid, YAxis, Tooltip, Legend, Rectangle } from 'recharts';
import { useEffect, useState } from "react";

export const description = "A stacked bar chart with a legend"






export default function QuestionAnalysisCard({ data, QuesData }) {
    const [chartChange, setChartChange] = useState(true)
    return (
        <Card className="bg-transparent dark:bg-transparent border-none text-white p-0  w-full  shadow-none">
            <div className="flex items-center justify-between mb-6">

                {chartChange ? <h3 className=" font-normal tracking-normal text-[22px] font-[futureHeadlineBold]  text-[#228367] dark:text-white">Question Analysis</h3> :
                    <h3 className=" font-normal tracking-normal text-[22px] font-[futureHeadlineBold]  text-[#228367] dark:text-white">Question Analysis</h3>
                }

                <div className="flex items-center gap-4" onClick={() => setChartChange(!chartChange)}>
                    <ChevronLeft className={`${chartChange ? "dark:text-white text-black" : "text-[#7D7D7D]"} max-xl:w-3 max-xl:h-3 w-6 h-6`} />
                    <ChevronRight className={`${chartChange ? "text-[#7D7D7D]" : "dark:text-white text-black"} max-xl:w-3 max-xl:h-3  w-6 h-6`} />
                </div>
            </div>


            <CardContent className=" dark:bg-[#181A1D] p-0 bg-[#F3F4F9] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none
             border border-[#B8B8B8] shadow-md  py-5 px-5 max-xl:pt-2  rounded-xl ">
                <Card className=" text-black border-none p-0 shadow-none bg-transparent dark:bg-transparent">
                    <CardContent className="dark:bg-[#181A1D] bg-[#F3F4F9] p-0 shadow-none">
                        {/* Check if data exists first */}
                        {data && data.length > 0 ? (
                            <>
                                {chartChange ? (
                                    <>
                                        <div className="h-32  w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    {/* <CartesianGrid strokeDasharray="1 1 1" vertical={false} /> */}
                                                    <XAxis
                                                        dataKey="label"
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tick={{ fontSize: 8 }}
                                                    />
                                                    <Bar
                                                        dataKey="value"
                                                        radius={[4, 4, 0, 0]}
                                                        minPointSize={1}
                                                        fill={"var(--color-value)"}
                                                    >
                                                        {data.map((entry, index) => (
                                                            <Cell cursor="pointer" fill={entry.color} key={`cell-${index}`} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {QuesData && QuesData.length > 0 ? (
                                            <div className="h-[170px] w-full flex items-center justify-start ">
                                                <ResponsiveContainer className=" h-full w-full">
                                                    <BarChart
                                                        width={500}
                                                        height={500}

                                                        data={QuesData}
                                                        margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="2 2" color=" #212121" />
                                                        <XAxis dataKey="label"
                                                            tickLine={false}
                                                            axisLine={false}
                                                            className="text-white dark:text-black"
                                                        />
                                                        <YAxis
                                                            tickLine={false}
                                                            axisLine={false}
                                                            className="text-white dark:text-black"
                                                        />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar dataKey="Avg. Second per Question" minPointSize={1} fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
                                                        <Bar dataKey="Accuracy" minPointSize={1} fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="w-full h-[190px] flex items-center justify-center text-center">
                                                <p className="text-gray-500">No question data available</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-[130px] flex items-center justify-center text-center">
                                <p className="text-gray-500">No data available</p>
                            </div>
                        )}
                    </CardContent>

                    {/* Show footer only when chartChange is true and data exists */}
                    {chartChange && data && data.length > 0 && (
                        <CardFooter className="flex-col items-center  text-sm dark:bg-[#181A1D] bg-[#F3F4F9] w-full">
                            <div className="grid grid-cols-4 gap-3 text-sm  max-xl:grid-cols-2 max-xl:gap-2 w-full max-md:grid-cols-4 max-sm:grid-cols-2 max-sm:gap-4">
                                {data.map((stat) => (
                                    <div key={stat.label} className="flex items-center justify-start max-sm:justify-between max-xl:justify-between w-full px-5 gap-3 ">
                                        <div className="flex items-center space-x-2 max-xl:text-xs">
                                            {stat.icon}
                                            <span>{stat.label}</span>
                                        </div>
                                        <span className="font-medium max-xl:text-xs" style={{ color: stat.color }}>
                                            {stat.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </CardContent>
        </Card>
    );
}







