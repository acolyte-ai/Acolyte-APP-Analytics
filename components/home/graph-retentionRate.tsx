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
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { RETENTION_ANALYTICS } from "./api/url";

// Define the input data structure
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

export default function RetentionRateCalculation() {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [insights, setInsights] = useState<string>("")
  const [subjects, setSubjects] = useState<{ subject: string, color: string }[]>([])
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  // Dynamic colors based on theme
  const axisTextColor = theme === 'dark' ? "#9CA3AF" : "#6B7280"; // zinc-400 for dark, zinc-500 for light
  const gridColor = theme === 'dark' ? "#E5E7EB" : "#374151"; // zinc-700 for dark, zinc-200 for light
  const legendTextColor = theme === 'dark' ? "#F9FAFB" : "#111827"; // zinc-50 for dark, zinc-900 for light

  function convertRetentionDataToChart(
    retentionData: SubjectRetention[],
    useRetentionPercentage: boolean = true
  ): ChartDataPoint[] {
    // Get all unique days from the data
    const allDays = [
      ...new Set(
        retentionData.flatMap((subject) =>
          subject.retentionRates.map((rate) => rate.day)
        )
      ),
    ].sort((a, b) => a - b);

    // Convert to chart format
    return allDays.map((day) => {
      const dataPoint: ChartDataPoint = {
        day: `Day ${day}`,
      };

      // Add each subject's data for this day
      retentionData.forEach((subject) => {
        const dayData = subject.retentionRates.find((rate) => rate.day === day);
        if (dayData) {
          dataPoint[subject.subject] = useRetentionPercentage
            ? Math.round(dayData.retention * 100) / 100 // Round to 2 decimal places
            : dayData.totalAttempts;
        } else {
          dataPoint[subject.subject] = 0;
        }
      });

      return dataPoint;
    });
  }

  const init = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using custom data instead of API call
      const customData = {
        "days": ["Day 1","Day 3","Day 7","Day 14","Day 21","Day 30"],
        "series": [
          {"subject":"Anatomy","retention_pct":[96,89,81,72,66,62]},
          {"subject":"Cardiology","retention_pct":[92,85,76,67,60,56]},
          {"subject":"Emergency medicine","retention_pct":[94,86,78,70,63,59]},
          {"subject":"Pathology","retention_pct":[90,82,73,64,57,53]},
          {"subject":"Radiology","retention_pct":[88,80,71,62,55,50]}
        ],
        "insight":"Typical forgetting curves (≈30–40% relative decay by Day 30 without review). Plan spaced reviews for Days 3, 7, 14, and 21."
      };

      const labels = customData.series.map((item, index) => {
        return {
          subject: item.subject,
          color: PATTERN_COLORS[index + 1] || "#525252"
        }
      });

      setSubjects(labels);
      
      // Convert custom data to chart format
      const chartData = customData.days.map((day, dayIndex) => {
        const dataPoint: ChartDataPoint = { day };
        customData.series.forEach((subject) => {
          dataPoint[subject.subject] = subject.retention_pct[dayIndex] || 0;
        });
        return dataPoint;
      });
      
      setInsights(customData.insight);
      setData(chartData);
      setLoading(false);
    } catch (err) {
      console.error("Error processing data:", err);
      setError(err instanceof Error ? err.message : "Failed to process data");
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`
          ${theme === 'dark' ? 'bg-zinc-800 border-zinc-600' : 'bg-white border-zinc-200'}
          border rounded-lg p-3 shadow-lg
        `}>
          <p className={`${theme === 'dark' ? 'text-white' : 'text-zinc-900'} font-medium`}>
            {`On ${label}`}
          </p>

          {payload.map((entry, index) => (
            <p key={index} className="text-sm grid grid-cols-2 gap-4" style={{ color: entry.color }}>
              <span className="">{entry.dataKey}:</span> <span>${entry.value}%</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-[14px] font-causten-semibold text-[#BDBDBD]" >
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <CardElementHome
      loading={loading}
      classes={"h-[449px] max-sm:h-[520px] max-[330px]:h-[570px] md:h-[500px] py-[19px] px-6 relative"}
      title="Retention Rate Calculation"
    >
      <div className="rounded-lg font-causten-semibold">
        <div className="h-[280px] max-md:h-[220px] max-sm:h-[280px] w-full max-sm:mb-2 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 40,
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
                tick={{ fill: axisTextColor, fontSize: 10 }}
              />
              <YAxis
                domain={[0, 180]}
                ticks={[0, 45, 90, 135, 180]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisTextColor, fontSize: 10 }}
              />
              <Tooltip
                content={
                  <CustomTooltip
                    active={undefined}
                    payload={undefined}
                    label={undefined}
                  />
                }
              />
              <Legend content={<CustomLegend payload={subjects} />} />

              {subjects.map((item, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={item.subject}
                  stroke={item.color}
                  strokeWidth={3}
                  dot={{ fill: item.color, strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: item.color, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-center dark:text-[#BDBDBD] text-black pb-4 text-[16px] max-sm:pb-2 max-sm:text-xs">
          Memory relation percentage over time since learning
        </p>

        <div className="mt-6 border dark:bg-[#222428] bg-transparent absolute w-[calc(100%-48px)] bottom-[19px] border-[#303336] px-5 py-[19px] rounded-[9px] text-[14px]">
          <h3 className="text-[#36AF8D] mb-3 text-[16px]">
            Retention Insight
          </h3>
          <p className="dark:text-[#BDBDBD] text-[16px] text-black">
            {insights || "No insights available at the moment."}
          </p>
        </div>
      </div>
    </CardElementHome>
  );
}