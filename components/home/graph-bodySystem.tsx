import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { CardElementHome } from "./UI/element-home-card";
import { Bar, BarChart, LabelList, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BODY_SYSTEM_COMPLETION } from "./api/url";
import axios from "axios";
import useUserId from "@/hooks/useUserId";

export default function BodySystem() {
  const [data, setData] = useState([
    {
      bodySystem: "Endocrine System",
      completionPercentage: 100
    },
    {
      bodySystem: "Digestive System",
      completionPercentage: 50
    },
    {
      bodySystem: "Cardiovascular System",
      completionPercentage: 50
    },
    {
      bodySystem: "Integumentary System",
      completionPercentage: 36
    },
    {
      bodySystem: "Other",
      completionPercentage: 33
    },
    {
      bodySystem: "Nervous System",
      completionPercentage: 62
    },
    {
      bodySystem: "Respiratory System",
      completionPercentage: 58
    },
    {
      bodySystem: "Musculoskeletal System",
      completionPercentage: 47
    },
    {
      bodySystem: "Renal/Urinary System",
      completionPercentage: 54
    },
    {
      bodySystem: "Reproductive (OBGYN)",
      completionPercentage: 41
    },
    {
      bodySystem: "Hematologic/Lymphatic",
      completionPercentage: 45
    },
    {
      bodySystem: "Immune System",
      completionPercentage: 52
    },
    {
      bodySystem: "Special Senses (ENT/Ophth)",
      completionPercentage: 39
    }
  ]);
  const [insights, setInsights] = useState<string>("")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = useUserId();
  const { theme } = useTheme();

  // Dynamic colors based on theme
  const axisTextColor = theme === 'dark' ? "#9CA3AF" : "#6B7280"; // zinc-400 for dark, zinc-500 for light
  const yAxisTextColor = theme === 'dark' ? "#E5E7EB" : "#374151"; // zinc-200 for dark, zinc-700 for light
  const labelTextColor = theme === 'dark' ? "#595959" : "#9CA3AF"; // darker for dark mode, lighter for light mode
  const legendBorderColor = theme === 'dark' ? "border-zinc-300" : "border-zinc-300";
  const legendTextColor = theme === 'dark' ? "text-white" : "text-black";
  const descriptionTextColor = theme === 'dark' ? "text-white" : "text-black";
  const barBackgroundColor = theme === 'dark' ? "#1e3330" : "#8fdace"; // dark green for dark mode, light zinc for light mode

  const init = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(process.env.NEXT_PUBLIC_HOME_BASE_URL + BODY_SYSTEM_COMPLETION + userId);
      setData(response.data.bodySystemCompletion);
      setInsights(response.data.insights);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    init();
  }, [userId]);

  const noChartData = [
    { system: "Subject", completion: 0 },
    { system: "Subject", completion: 0 },
    { system: "Subject", completion: 0 },
    { system: "Subject", completion: 0 },
    { system: "Subject", completion: 0 },
    { system: "Subject", completion: 0 },
  ];

  const chartConfig = {
    Heart: {
      label: "Cardiovascular",
      color: "#36AF8D",
    },
    Endocrine: {
      label: "Endocrine System",
      color: "#36AF8D",
    },
    Surgery: {
      label: "Surgical Procedures",
      color: "#36AF8D",
    },
    Imaging: {
      label: "Medical Imaging",
      color: "#36AF8D",
    },
    Oncology: {
      label: "Oncology",
      color: "#36AF8D",
    },
    Respiratory: {
      label: "Respiratory System",
      color: "#36AF8D",
    },
    Emergency: {
      label: "Emergency Medicine",
      color: "#36AF8D",
    },
    Kidney: {
      label: "Renal System",
      color: "#36AF8D",
    },
    Genetics: {
      label: "Genetics",
      color: "#36AF8D",
    },
    "Nervous System": {
      label: "Nervous System",
      color: "#36AF8D",
    },
    Musculoskeletal: {
      label: "Musculoskeletal",
      color: "#36AF8D",
    },
    General: {
      label: "General Medicine",
      color: "#36AF8D",
    },
    "Immune System": {
      label: "Immune System",
      color: "#36AF8D",
    },
    Molecular: {
      label: "Molecular Biology",
      color: "#36AF8D",
    },
    Environment: {
      label: "Environmental Health",
      color: "#36AF8D",
    },
    Cellular: {
      label: "Cellular Biology",
      color: "#36AF8D",
    },
  } satisfies ChartConfig;

  // Let's add some sample progress data to make it more interesting
  const dataWithProgress = data.map((item, index) => ({
    ...item,
    completionPercentage: Math.floor(Math.random() * 100), // Random progress for demo
    completedCards: Math.floor(Math.random() * item.totalCards),
  }));

  // For scrollable display - show 5 items at a time
  const [scrollIndex, setScrollIndex] = useState(0);
  const itemsPerView = 5;
  const visibleData = data.slice(scrollIndex, scrollIndex + itemsPerView);

  return (
    <CardElementHome
      loading={loading}
      classes={"h-[550px] max-[380px]:h-[590px] flex flex-col px-5 py-[26px]"}
      title="Body System Completion"
    >
      <div className="flex-1 flex flex-col rounded-lg font-causten-normal">
        {/* Chart Container with Navigation - Takes available space */}
        <div className="flex-1 min-h-[200px] w-full mb-4 relative">
          {/* Navigation Controls - Top Right */}
          {data.length > itemsPerView && (
            <div className="absolute -bottom-[110px] right-0 z-10 flex items-center space-x-2  dark:bg-zinc-800/90 bg-zinc-50 backdrop-blur-sm px-3 py-2 rounded-lg">
              {/* Previous Button */}
              <button
                onClick={() => setScrollIndex(Math.max(0, scrollIndex - 1))}
                disabled={scrollIndex === 0}
                className={`w-6 h-6 rounded border transition-all duration-200 flex items-center justify-center
                  ${scrollIndex === 0
                    ? 'dark:border-zinc-600 dark:bg-[#36AF8D] border-zinc-300 bg-[#36AF8D] cursor-not-allowed'
                    : 'dark:border-zinc-500 dark:bg-[#36AF8D] dark:hover:bg-zinc-500 border-zinc-300 bg-[#36AF8D] hover:bg-zinc-400 active:scale-95'
                  }`}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  className={`${scrollIndex === 0 ? 'dark:text-white text-black' : 'dark:text-white text-black'}`}
                >
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="#fffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="rotate(-90 12 12)"
                  />
                </svg>
              </button>

              {/* Position Indicator */}
              <div className="flex items-center space-x-2">
                <span className="text-base font-medium dark:text-zinc-300 text-black">
                  {scrollIndex + 1}-{Math.min(scrollIndex + itemsPerView, data.length)} of {data.length}
                </span>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.ceil(data.length / itemsPerView) }, (_, index) => (
                    <div
                      key={index}
                      className={`w-1 h-1 rounded-full transition-all duration-200 ${Math.floor(scrollIndex / itemsPerView) === index
                        ? 'bg-zinc-300'
                        : 'bg-zinc-600'
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={() => setScrollIndex(Math.min(data.length - itemsPerView, scrollIndex + 1))}
                disabled={scrollIndex >= data.length - itemsPerView}
                className={`w-6 h-6 rounded border transition-all duration-200 flex items-center justify-center
                  ${scrollIndex >= data.length - itemsPerView
                    ? 'dark:border-zinc-600 dark:bg-[#36AF8D] border-zinc-300 bg-[#36AF8D] cursor-not-allowed'
                    : 'dark:border-zinc-500 dark:bg-[#36AF8D] dark:hover:bg-zinc-500 border-zinc-300 bg-[#36AF8D] hover:bg-zinc-400 active:scale-95'
                  }`}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  className={`${scrollIndex >= data.length - itemsPerView ? 'dark:text-white text-black' : 'dark:text-white text-black'}`}
                >
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="#fffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="rotate(-90 12 12)"
                  />
                </svg>
              </button>
            </div>
          )}

          <ChartContainer config={chartConfig} className="h-[400px] w-full p-[8px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                accessibilityLayer
                data={visibleData}
                layout="vertical"
                margin={{
                  left: 20,
                  right: 35,
                  top: 10,
                  bottom: 10,
                }}
              >
                <YAxis
                  dataKey="bodySystem"
                  type="category"
                  className="text-xs"
                  tickLine={true}
                  tickMargin={10}
                  axisLine={true}
                  width={80}
                  tick={{ fill: yAxisTextColor, fontSize: 12 }}
                  tickFormatter={(value: any) => {
                    const config = chartConfig[value as keyof typeof chartConfig];
                    return config?.label || value || "Unknown";
                  }}
                />
                <XAxis
                  dataKey="completionPercentage"
                  type="number"
                  domain={[0, 100]}
                  tickLine={true}
                  axisLine={true}
                  tick={{ fill: axisTextColor, fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="completionPercentage"
                  layout="vertical"
                  radius={2}
                  fill={"#36AF8D"}
                  barSize={30}
                  background={{ fill: barBackgroundColor, radius: 8 }}
                >
                  <LabelList
                    dataKey="completionPercentage"
                    position="right"
                    style={{
                      fill: labelTextColor,
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                    formatter={(value: any) => `${value}`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mb-3 font-normal font-[Inter]">
          <div className={`rounded-full p-1 border ${legendBorderColor}`}>
            <div className="w-2 h-2 rounded-full bg-[#36AF8D]"></div>
          </div>
          <span className="text-[#BDBDBD] font-causten-semibold text-[16px]">Completion %</span>
        </div>

        {/* Description */}
        <p className={`text-[#BDBDBD] font-causten-semibold text-[16px] text-center  mb-4 `}>
          Percentage of system curriculum completed
        </p>

        {/* Completion Insight - Now relative positioned */}
        {/* <div className="bg-[#222428] px-5 py-[19px] rounded-[9px] text-[14px] font-medium mt-auto">
          <p className="text-[#36AF8D] mb-3 text-[16px]">
            Completion Insight
          </p>
          <p>
            {insights || "No insights available at the moment."}
          </p>
        </div> */}
      </div>
    </CardElementHome>
  );
}