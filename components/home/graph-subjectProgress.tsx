"use client";

import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { CardElementHome } from "./UI/element-home-card";
import { MdWarningAmber } from "react-icons/md";
import { useTheme } from "next-themes";

export const description = "A radar chart";
// Consistent color scheme
const CHART_COLOR = "#36AF8D";


const chartConfig = {
  progressScore: {
    label: "Progress Score",
    color: CHART_COLOR,
  },
} satisfies ChartConfig;

export default function SubjectProgress() {
  const [chartData, setChartData] = useState<
    { progressScore: number; subject: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { theme } = useTheme();

  // Dynamic colors based on theme
  const GRID_COLOR = theme === 'dark' ? "#e5e7eb" : "#374151";
  const TEXT_COLOR = theme === 'dark' ? "#9ca3af" : "#6b7280";

  const init = async () => {
    try {
      setLoading(true);
      setError(null);

      // Custom hardcoded data
      const customData = [
        { "subject": "Anatomy", "progress_pct": 82 },
        { "subject": "Cardiology", "progress_pct": 47 },
        { "subject": "Pathology", "progress_pct": 24 },
        { "subject": "Radiology", "progress_pct": 64 },
        { "subject": "Psychiatry", "progress_pct": 55 },
        { "subject": "Biochemistry", "progress_pct": 90 }
      ];

      // Transform data to match expected format
      const validatedData = customData.map(item => ({
        subject: item.subject,
        progressScore: item.progress_pct
      }));

      setChartData(validatedData);
      setLoading(false);
    } catch (err) {
      console.error("Error setting dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to set dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <CardElementHome
        loading={loading}
        classes={"h-[340px]"}
        title="Study Progress"
      >
        <div className="h-[320px] flex flex-col p-2">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <MdWarningAmber className="text-zinc-400 h-10 w-10" />
              <p className="text-zinc-300 text-sm md:text-base font-causten-regular">Error: {error}</p>
            </div>
          ) : chartData.length > 0 ? (
            <>
              <div className="flex-1 flex items-center justify-center">
                <ChartContainer
                  config={chartConfig}
                  className="w-full h-full transition-all duration-1000 ease-out"
                >
                  <RadarChart
                    data={chartData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <defs>
                      <radialGradient id="colorGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.6} />
                        <stop offset="70%" stopColor={CHART_COLOR} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0.1} />
                      </radialGradient>
                    </defs>

                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />

                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{
                        fill: TEXT_COLOR,
                        fontFamily: 'font-causten-medium',
                        fontSize: 15,
                        fontWeight: 400,
                      }}
                      className="transition-all duration-700 ease-out font-causten-medium "
                    />

                    <PolarGrid
                      stroke={GRID_COLOR}
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      className="opacity-60"
                    />

                    <Radar
                      dataKey="progressScore"
                      fill="url(#colorGradient)"
                      fillOpacity={0.4}
                      stroke={CHART_COLOR}
                      strokeWidth={2.5}
                      dot={{
                        fill: CHART_COLOR,
                        strokeWidth: 2,
                        stroke: '#fff',
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                        fill: CHART_COLOR,
                        stroke: '#fff',
                        strokeWidth: 3,
                      }}
                      animationBegin={300}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </RadarChart>
                </ChartContainer>
              </div>
              <div className="flex items-center gap-2 justify-center mt-auto mb-2 transition-all duration-500 delay-700">
                <div className="p-1 border border-gray-400 rounded-full transition-all duration-300 hover:scale-110">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CHART_COLOR }}
                  ></div>
                </div>
                <span className="text-[18px]  font-causten-semibold" style={{ color: CHART_COLOR }}>
                  Progress
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-base md:text-lg font-causten-regular">No data available</p>
            </div>
          )}


        </div>
      </CardElementHome>
    </>
  );
}
