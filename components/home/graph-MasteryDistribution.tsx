import { useEffect, useState } from "react";
import { CardElementHome } from "./UI/element-home-card";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Separator } from "../ui/separator";
import { IconChartPie, IconDatabaseOff } from "@tabler/icons-react";
export const description = "A radial chart with stacked sections";

interface DistributionData {
  count: number;
  percentage: number;
  topics: TopicsData[];
}

interface TopicsData {
  topicName: string;
  subject: string;
  masteryScore: number;
  masteryLevel: string;
  breakdown: {
    flashcardPerformance: number;
    completionRate: number;
    timeEfficiency: number;
  };
}

export default function MasteryDistribution() {
  const [data, setData] = useState<
    {
      subject: string;
      value: number;
      percentage: number;
      level: string;
      color: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const init = async () => {
    try {
      setLoading(true);
      setError(null);

      // Using custom hardcoded data
      const customData = {
        total_topics: 1200,
        percent: {"mastered": 2, "strong": 6, "developing": 4, "weak": 88},
        count: {"mastered": 24, "strong": 72, "developing": 48, "weak": 1056}
      };

      const chartData = Object.entries(customData.percent).map(
        ([level, percentage]) => ({
          subject: "All Subjects",
          value: percentage,
          percentage: percentage,
          level: level,
          color: getLevelColor(level.charAt(0).toUpperCase() + level.slice(1)),
        })
      );

      console.log("chartData:", chartData);

      setData(chartData);
      setHasData(chartData.length > 0);
      setLoading(false);
    } catch (err) {
      console.error("Error setting up dashboard data:", err);
      setError(err.message || "Failed to set up dashboard data");
      setData([]);
      setHasData(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const handlePieClick = (data: any, index: number) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "developing":
        return "#f87171";
      case "mastered":
        return "#10b981";
      case "strong":
        return "#3b82f6";
      case "weak":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Empty state component
  const EmptyState = () => (
    <div className="h-[450px] flex-col items-center w-full flex justify-center space-y-4">
      <IconChartPie className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mb-2" />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-causten-semibold dark:text-white text-black">
          No Mastery Data Available
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
          Start learning topics to see your mastery distribution here
        </p>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="h-[450px] flex-col items-center w-full flex justify-center space-y-4">
      <IconDatabaseOff className="w-16 h-16 text-red-400 dark:text-red-500 mb-2" />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium dark:text-white text-black">
          Unable to Load Data
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
          There was an error loading your mastery distribution
        </p>
        <button
          onClick={init}
          className="mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <CardElementHome
      loading={loading}
      classes={"h-[550px] max-sm:h-auto px-[30px] py-[5px]"}
      title="Mastery Distribution"
    >
      {/* Show empty state if no data, error state if error, otherwise show chart */}
      {!loading && !hasData && !error ? (
        <EmptyState />
      ) : !loading && error ? (
        <ErrorState />
      ) : (
        <div className="space-y-[50px] max-sm:space-y-5 w-full items-center justify-center h-full">
          <div className="w-full h-[280px] mb-4 flex justify-center items-center rotate-180">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%" // Center horizontally
                  cy="70%" // Position slightly lower for semi-circle
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={130}
                  fill="#8884d8"
                  paddingAngle={2}
                  strokeWidth={0}
                  dataKey="value"
                  onClick={handlePieClick}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke={selectedIndex === index ? "#ffffff" : "none"}
                      strokeWidth={selectedIndex === index ? 3 : 0}
                      style={{
                        filter: selectedIndex === index ? "brightness(1.2)" : "brightness(1)",
                        cursor: "pointer"
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-[9px]">
            {data.map((item, index) => (
              <div key={index} className="space-y-4 font-causten-normal">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-white text-sm font-medium">
                      {/* {item.subject} */}
                    </span>
                    <span
                      className="text-[16px] font-causten-semibold"
                      style={{ color: getLevelColor(item.level) }}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-white">
                    <span
                      className="text-[16px] font-causten-normal"
                      style={{ color: getLevelColor(item.level) }}
                    >
                      {item.level}
                    </span>
                    <div
                      className="w-1 h-4 rounded-full"
                      style={{ backgroundColor: getLevelColor(item.level) }}
                    ></div>
                  </div>
                </div>
                {index < data.length - 1 && (
                  <Separator className="dark:bg-muted bg-[#282B30]" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </CardElementHome>
  );
}
