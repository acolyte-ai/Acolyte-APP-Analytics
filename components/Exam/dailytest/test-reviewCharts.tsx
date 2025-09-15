"use client";

import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface Props {
    data: {
        name: string,
        value: number,
        color: string,
    }[],
    dataQuestionNavigation: {
        name: string,
        value: number,
        color: string
    }[]
    chart_1_label: string, chart_2_label: string
    title1: string,
    title2: string,
    height: string
}

export default function AnswerChangeChartCard({ data, dataQuestionNavigation, chart_1_label, chart_2_label, title1, title2, height }: Props) {
    const [chartChange, setChartChange] = useState(true)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const handlePieClick = (data: any, index: number) => {
        setSelectedIndex(selectedIndex === index ? null : index);
    };

    return (
        <Card className="bg-transparent dark:bg-transparent h-full border-none p-0 text-white w-full shadow-none">
            <div className="flex items-center justify-between ">
                {chartChange ? <h3 className=" font-normal tracking-normal text-[24px] font-causten-semibold mb-[15px] text-[#228367] dark:text-white">{title1}</h3> :
                    <h3 className=" font-normal tracking-normal text-[24px] font-causten-semibold mb-[15px] text-[#228367] dark:text-white">{title2}</h3>
                }

                <div className="flex gap-4" onClick={() => setChartChange(!chartChange)}>
                    <ChevronLeft className={`${chartChange ? "dark:text-white text-black" : "text-[#7D7D7D]"} max-xl:w-3 max-xl:h-3 w-6 h-6`} />
                    <ChevronRight className={`${chartChange ? "text-[#7D7D7D]" : "dark:text-white text-black"} max-xl:w-3 max-xl:h-3 w-6 h-6`} />
                </div>

            </div>
            <CardContent className="p-0">
                <div className="w-full flex items-center  h-full flex-col py-[22px] relative rounded-xl dark:bg-[#181A1D] bg-[#F3F4F9]
                 dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md">
                    {
                        !chartChange ? <div className="xl:max-w-28 2xl:max-w-52 lg:max-w-28 md:max-w-52 sm:max-w-52   sm:absolute   top-4  right-4
                     h-auto flex flex-col justify-center p-4 ">
                            <div className="space-y-3 max-h-full overflow-y-auto">
                                {data.map((entry, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <div
                                            className="w-3 h-3 rounded-sm flex-shrink-0"
                                            style={{ backgroundColor: entry.color }}
                                        ></div>
                                        <span className="text-xs capitalize dark:text-gray-300 text-gray-700 truncate">
                                            {entry.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div> :

                            <div className="xl:max-w-28 2xl:max-w-52 lg:max-w-28 md:max-w-52 sm:max-w-52   sm:absolute   top-4  right-4
                     h-auto flex flex-col justify-center p-4 ">
                                <div className="space-y-3 max-h-full overflow-y-auto">
                                    {dataQuestionNavigation.map((entry, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <div
                                                className="w-3 h-3 rounded-sm flex-shrink-0"
                                                style={{ backgroundColor: entry.color }}
                                            ></div>
                                            <span className="text-xs capitalize dark:text-gray-300 text-gray-700 truncate">
                                                {entry.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                    }



                    <div className={`h-[314px] w-full flex items-center justify-center`}>
                        {!chartChange ? (
                            <>
                                {data && data.length > 0 ? (
                                    <div className="flex items-center justify-center flex-col w-full h-full">



                                        <ResponsiveContainer width="100%" height="100%" >
                                            <PieChart>
                                                <Pie
                                                    data={data}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    className="2xl:font-[16px] text-xs"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={0}
                                                    strokeWidth={0}
                                                    labelLine={false}
                                                    label={false}
                                                    onClick={handlePieClick}
                                                >
                                                    {data.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color}
                                                            stroke={selectedIndex === index ? "#ffffff" : "none"}
                                                            strokeWidth={selectedIndex === index ? 3 : 0}
                                                            style={{
                                                                filter: selectedIndex === index ? "brightness(1.2)" : "brightness(1)",
                                                                cursor: "pointer"
                                                            }}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "white",
                                                        border: "3px solid #10b981",
                                                        borderRadius: "10px",
                                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                                                        padding: "12px 12px",
                                                        fontSize: "14px",
                                                        lineHeight: "1.4",
                                                        color: "black",
                                                    }}
                                                    labelStyle={{
                                                        color: "black",
                                                        fontWeight: "600",
                                                        marginBottom: "4px",
                                                    }}
                                                    itemStyle={{
                                                        color: "#374151",
                                                        padding: "0",
                                                        margin: "0",
                                                    }}
                                                    cursor={false}
                                                    formatter={(value, name) => [
                                                        `${value}`,
                                                        name
                                                    ]}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>



                                    </div>
                                ) : (
                                    // Empty graph for first chart
                                    <ResponsiveContainer width="100%" height="100%" >
                                        <PieChart>
                                            <Pie
                                                data={[{ name: "No Data", value: 100, color: "#E5E5E5" }]}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                strokeWidth={0}
                                                label={false}
                                            >
                                                <Cell fill="#E5E5E5" />
                                            </Pie>
                                            <text
                                                x="50%"
                                                y="50%"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                className="fill-gray-400 font-[16px] font-medium"
                                            >
                                                No Data Available
                                            </text>
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </>
                        ) : (
                            <>
                                {dataQuestionNavigation && dataQuestionNavigation.length > 0 ? (
                                    <div className="flex items-center justify-center w-full h-full flex-col">



                                        <ResponsiveContainer width="100%" height="100%" >
                                            <PieChart>
                                                <Pie
                                                    data={dataQuestionNavigation}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={0}
                                                    strokeWidth={0}
                                                    labelLine={false}
                                                    label={false}
                                                    onClick={handlePieClick}
                                                >
                                                    {dataQuestionNavigation.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color}
                                                            stroke={selectedIndex === index ? "#ffffff" : "none"}
                                                            strokeWidth={selectedIndex === index ? 3 : 0}
                                                            style={{
                                                                filter: selectedIndex === index ? "brightness(1.2)" : "brightness(1)",
                                                                cursor: "pointer"
                                                            }}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "white",
                                                        border: "3px solid #10b981",
                                                        borderRadius: "10px",
                                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                                                        padding: "12px 12px",
                                                        fontSize: "14px",
                                                        lineHeight: "1.4",
                                                        color: "black",
                                                    }}
                                                    labelStyle={{
                                                        color: "black",
                                                        fontWeight: "600",
                                                        marginBottom: "4px",
                                                    }}
                                                    itemStyle={{
                                                        color: "#374151",
                                                        padding: "0",
                                                        margin: "0",
                                                    }}
                                                    cursor={false}
                                                    formatter={(value, name) => [
                                                        `${value}`,
                                                        name
                                                    ]}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>


                                ) : (
                                    // Empty graph for second chart
                                    <ResponsiveContainer width="100%" height="100%" >
                                        <PieChart>
                                            <Pie
                                                data={[{ name: "No Data", value: 100, color: "#E5E5E5" }]}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                strokeWidth={0}
                                                label={false}
                                            >
                                                <Cell fill="#E5E5E5" />
                                            </Pie>
                                            <text
                                                x="50%"
                                                y="50%"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                className="fill-gray-400 text-[16px] font-medium"
                                            >
                                                No Data Available
                                            </text>
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </>
                        )}
                    </div>

                    <p className="text-center text-[14px] capitalize  dark:text-[#BDBDBD] text-black font-causten-semibold sm:mt-2">
                        {chartChange ? chart_1_label : chart_2_label}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
