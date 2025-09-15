"use client";

import * as React from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import axios from "axios";
import { TOOL_USAGE } from "./api/url";
import { CardElementHome } from "./UI/element-home-card";
import { RadialBar, RadialBarChart } from "recharts";
import { Separator } from "../ui/separator";
import Image from "next/image";

const chartConfig = {
  Flashcards: {
    label: "Flashcards",
    color: "#A7F3D0",
  },
  "PDF Reader": {
    label: "PDF Reader",
    color: "#6EE7B7",
  },
  "AI Chat": {
    label: "AI Chat",
    color: "#34D399",
  },
  "Practice Tests": {
    label: "Practice Tests",
    color: "#10B981",
  },
} satisfies ChartConfig;

export function ToolUsage() {
  const [chartData, setChartData] = useState<
    {
      type: string;
      percentage: number;
      fill: string;
    }[]
  >([]); // Initialize with empty array instead of undefined
  const [animatedData, setAnimatedData] = useState<
    {
      type: string;
      percentage: number;
      fill: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation function to gradually increase percentages
  const animateChart = (targetData: typeof chartData) => {
    setIsAnimating(true);
    const duration = 1500; // 1.5 seconds
    const steps = 60; // 60 frames for smooth animation
    const stepDuration = duration / steps;
    let currentStep = 0;

    // Start with 0 values
    const initialData = targetData.map(item => ({
      ...item,
      percentage: 0
    }));
    setAnimatedData(initialData);

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutCubic = 1 - Math.pow(1 - progress, 3); // Smooth easing

      const currentData = targetData.map(item => ({
        ...item,
        percentage: Math.round(item.percentage * easeOutCubic)
      }));

      setAnimatedData(currentData);

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedData(targetData); // Ensure final values are exact
        setIsAnimating(false);
      }
    }, stepDuration);
  };

  const init = async () => {
    try {
      setLoading(true);

      // Custom hardcoded data
      const customData = [
        { tool: "PDF Reader", percent: 46 },
        { tool: "AI Chat", percent: 39 },
        { tool: "Flashcards", percent: 12 },
        { tool: "Practice Tests", percent: 3 },
      ];

      const defaultColors = [
        "#C93939",
        "#7086FD",
        "#34D399",
        "#CF8A25",
        "#059669",
        "#047857",
        "#065F46",
      ];

      const data = customData.map((item, index) => ({
        type: item.tool,
        percentage: item.percent,
        fill: defaultColors[index % defaultColors.length],
      }));

      console.log("Processed chart data:", data);
      setChartData(data);
      // Start animation after setting data
      setTimeout(() => animateChart(data), 100);
    } catch (err) {
      console.error("Error processing dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const totalVisitors = React.useMemo(() => {
    return chartData?.reduce((acc, curr) => acc + curr.percentage, 0) || 0;
  }, [chartData]);

  return (
    <CardElementHome
      loading={loading}
      classes={"h-[401px] "}
      title="Learning Tool Used"
    >
      <div className="flex flex-col w-full h-full space-y-4 ">
        {
          chartData.length > 0 ? <>
            <div className="transition-all duration-500 ease-in-out">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-[190px] "
              >
                <RadialBarChart
                  data={animatedData}
                  innerRadius={60}
                  outerRadius={90}
                  startAngle={90}
                  endAngle={450}
                  barGap={10}
                  className=" w-full "
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="type" />}
                  />
                  <RadialBar
                    dataKey="percentage"
                    cornerRadius={4}
                    fill="#8884d8"
                    background
                  // animationBegin={0}
                  // animationDuration={1500}
                  // animationEasing="ease-out"
                  />

                  <foreignObject
                    x="50%"
                    y="50%"
                    width="48"
                    height="48"
                    transform="translate(-24, -24)"
                    className="animate-fade-in"
                    style={{
                      animation: "fadeIn 1s ease-in-out 0.5s both"
                    }}
                  >
                    <Image
                      width={30}
                      height={30}
                      src="/bigOwl.svg"
                      alt="Center image"
                      className="w-12 h-12 rounded-full object-fill transition-transform duration-300 hover:scale-110"
                      style={{ display: "block" }}
                    />
                  </foreignObject>
                </RadialBarChart>
              </ChartContainer>
            </div>

            <div className="space-y-4">
              {animatedData.map((subject, index) => (
                <div
                  key={index}
                  className="flex items-center flex-col gap-[6px] font-causten-semibold text-[16px] opacity-0 animate-slide-up"
                  style={{
                    animation: `slideUp 0.6s ease-out ${0.2 + index * 0.1}s both`
                  }}
                >
                  <div className="flex items-center justify-between w-full group">
                    <span
                      className={`text-[14px] px-2 dark:text-[#BDBDBD] text-black border-l-2 transition-all duration-300 hover:border-l-4 hover:px-3`}
                      style={{ borderLeftColor: subject.fill }}
                    >
                      {subject.type || "options"}
                    </span>
                    <span className="text-[14px] dark:text-[#BDBDBD] text-black w-8 transition-all duration-300 group-hover:scale-110">
                      {subject.percentage}%
                    </span>
                  </div>
                  {index < animatedData.length - 1 && (
                    <Separator className="dark:bg-muted bg-[#282B30] transition-opacity duration-300 hover:opacity-70" />
                  )}
                </div>
              ))}
            </div>
          </> : <>
            <div className="transition-all duration-500 ease-in-out opacity-50">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-[190px] "
              >
                <RadialBarChart
                  data={[
                    { type: "Options", percentage: 0, fill: "#595959" },
                    { type: "Options", percentage: 0, fill: "#595959" },
                    { type: "Options", percentage: 0, fill: "#595959" },
                    { type: "Options", percentage: 0, fill: "#595959" },
                  ]}
                  innerRadius={60}
                  outerRadius={90}
                  startAngle={90}
                  endAngle={450}
                  barGap={10}
                  className=" w-full "
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="type" />}
                  />
                  <RadialBar
                    dataKey="percentage"
                    cornerRadius={4}
                    fill="#8884d8"
                    background
                  />

                  <foreignObject
                    x="50%"
                    y="50%"
                    width="48"
                    height="48"
                    transform="translate(-24, -24)"
                    className="animate-pulse"
                  >
                    <Image
                      width={30}
                      height={30}
                      src="/bigOwl.svg"
                      alt="Center image"
                      className="w-12 h-12 rounded-full object-fill"
                      style={{ display: "block" }}
                    />
                  </foreignObject>
                </RadialBarChart>
              </ChartContainer>
            </div>

            <div className="space-y-2 opacity-50">
              {[
                { type: "Options", percentage: 0, fill: "#595959" },
                { type: "Options", percentage: 0, fill: "#595959" },
                { type: "Options", percentage: 0, fill: "#595959" },
                { type: "Options", percentage: 0, fill: "#595959" },
              ].map((subject, index) => (
                <div
                  key={index}
                  className="flex items-center flex-col gap-[9px] font-pt-sans mb-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[16px] px-2 dark:text-white text-black border-l`}
                      style={{ borderLeftColor: subject.fill }}
                    >
                      {/* {subject.type} */}
                    </span>
                    <span className="text-[16px] dark:text-white text-black w-8">
                      {subject.percentage}%
                    </span>
                  </div>
                  {index < 3 && (
                    <Separator className=" dark:bg-muted bg-[#282B30]" />
                  )}
                </div>
              ))}
            </div>
          </>
        }

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translate(-24px, -24px) scale(0.8);
            }
            to {
              opacity: 1;
              transform: translate(-24px, -24px) scale(1);
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </CardElementHome>
  );
}