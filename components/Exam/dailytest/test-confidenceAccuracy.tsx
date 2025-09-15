"use client";

import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    ScatterChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Scatter,
    ResponsiveContainer,
} from "recharts";



export default function ConfidenceVsAccuracyCard({ data }) {
    return (
        <Card className="p-0 dark:text-white text-black h-full bg-transparent dark:bg-transparent w-full border-none">
            <h3 className=" font-normal tracking-normal text-[22px] font-[futureHeadlineBold] mb-[15px] text-[#228367] dark:text-white">Confidence vs. Accuracy</h3>
            <CardContent className="p-0  dark:bg-[#181A1D] bg-[#F3F4F9] mb-[15px] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md  px-5 py-5 rounded-xl">


                <div className="h-[308px] w-full">
                    <ResponsiveContainer className="text-dark dark:text-white" width="100%" height="100%">
                        <ScatterChart
                            margin={{ top: 10, right: 10, bottom: 30, left: 10 }}
                        >
                            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="x"
                                type="number"
                                domain={[40, 100]}
                                tick={{ fill: "#ccc", fontSize: 12 }}
                            />
                            <YAxis
                                dataKey="y"
                                type="number"
                                domain={[40, 100]}
                                tick={{ fill: "#ccc", fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#333", border: "none" }}
                                labelStyle={{ color: "#fff" }}
                                cursor={{ strokeDasharray: "3 3" }}
                            />
                            <Scatter name="Confidence vs Accuracy" data={data} fill="#6366F1" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

                <p className="text-center text-sm dark:text-white text-black  mt-4 font-pt-sans">
                    Self-assessed confidence vs actual accuracy
                </p>
            </CardContent>
        </Card >
    );
}
