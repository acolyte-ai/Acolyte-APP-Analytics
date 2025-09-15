"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";
import { STUDY_PERFORMANCE_ANALYTICS, TIME_SPENT_PER_SUBJECT } from "./api/url";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CardElementHome } from "./UI/element-home-card";
import { IconDatabaseOff } from "@tabler/icons-react";
export const description = "A multiple bar chart";

const chartConfig = {
  retentionScore: {
    label: "retentionScore",
    color: "#7086FD",
  },
  hoursSpent: {
    label: "hoursSpent",
    color: "#6EE7B7",
  },
} satisfies ChartConfig;

export function StudyTimeAnalytics() {
  const [chartData, setChartData] = useState<
    {
      subject: string;
      retentionScore: number;
      hoursSpent: number;
      status: string;
    }[]
  >();
  const [insights, setInsights] = useState<any>(null); // Changed type to any
  const [animatedData, setAnimatedData] = useState<
    {
      subject: string;
      retentionScore: number;
      hoursSpent: number;
      status: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const init = async () => {
    try {
      setLoading(true);
      setIsAnimating(true);

      // Custom data values
      const data = [
        { "timeSlot": "8–10 AM", "studyEfficiency": 6.9, "focusScore": 82 },
        { "timeSlot": "10–12 PM", "studyEfficiency": 6.1, "focusScore": 78 },
        { "timeSlot": "12–2 PM", "studyEfficiency": 4.1, "focusScore": 62 },
        { "timeSlot": "2–4 PM", "studyEfficiency": 5.0, "focusScore": 68 },
        { "timeSlot": "4–6 PM", "studyEfficiency": 6.3, "focusScore": 76 },
        { "timeSlot": "6–8 PM", "studyEfficiency": 7.4, "focusScore": 88 },
        { "timeSlot": "8–10 PM", "studyEfficiency": 6.8, "focusScore": 84 },
        { "timeSlot": "10–12 AM", "studyEfficiency": 5.2, "focusScore": 70 }
      ];

      // Custom insights
      setInsights({
        peakProductivityTime: "6-8 PM",
        recommendation: "Schedule your most challenging study sessions during evening hours for optimal performance",
        optimalRange: "6-8 PM shows highest efficiency (7.4) and focus (88%)"
      });

      // Initialize with zero values for animation
      const zeroData = data.map(item => ({
        ...item,
        studyEfficiency: 0,
        focusScore: 0
      }));

      setAnimatedData(zeroData);

      // Start entrance animation
      setTimeout(() => {
        setShowContent(true);
      }, 200);

      // Animate to actual values
      setTimeout(() => {
        setAnimatedData(data);
        setIsAnimating(false);
      }, 500);

      setLoading(false);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setLoading(false);
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  // Function to render insights object as formatted text
  const renderInsights = () => {
    if (!insights) return "No insights available at the moment.";

    // If insights is a string, return it directly
    if (typeof insights === 'string') return insights;

    // If insights is an object, format it nicely
    if (typeof insights === 'object') {
      return (
        <div className="space-y-2">
          {insights.peakProductivityTime && (
            <div>
              <span className="text-[#36AF8D]">Peak Time: </span>
              <span>{insights.peakProductivityTime}</span>
            </div>
          )}
          {insights.recommendation && (
            <div>
              <span className="text-[#36AF8D]">Recommendation: </span>
              <span>{insights.recommendation}</span>
            </div>
          )}
          {insights.optimalRange && (
            <div>
              <span className="text-[#36AF8D]">Optimal Range: </span>
              <span>{insights.optimalRange}</span>
            </div>
          )}
        </div>
      );
    }

    return "No insights available at the moment.";
  };

  return (
    <>
      <CardElementHome
        loading={loading}
        classes={" h-[600px] max-sm:h-[570px] py-[26px] relative w-full"}
        title="Optimal Study Time Analysis"
      >
        {/* Main Chart */}
        <Card className="bg-transparent dark:bg-transparent border-none p-0 shadow-none w-full ">

          {animatedData.length > 0 ?
            <CardContent className="p-0 w-full ">
              <div className={`h-[290px] max-sm:h-[250px] mb-4 transition-all duration-700 ease-out ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  className="text-[Inter]"
                >
                  <ComposedChart
                    data={animatedData}
                    margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      className="animate-in fade-in-0 duration-500 delay-300"
                    />
                    <XAxis
                      dataKey="timeSlot"
                      dominantBaseline={"middle"}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        position: 'insideBottom',
                        offset: -10,
                        style: { textAnchor: 'middle', fill: '#9CA3AF', fontSize: '12px' }
                      }}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      className="animate-in fade-in-0 duration-500 delay-500"
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      dataKey="studyEfficiency"
                      domain={[0, 180]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      className="animate-in fade-in-0 duration-500 delay-400"
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      dataKey="focusScore"
                      domain={[0, 60]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      className="animate-in fade-in-0 duration-500 delay-400"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="studyEfficiency"
                      fill="#6366F1"
                      barSize={50}
                      radius={[2, 2, 0, 0]}
                      name="study efficiency"
                      animationDuration={1500}
                      animationEasing="ease-out"
                      animationBegin={600}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="focusScore"
                      fill="#10B981"
                      barSize={50}
                      radius={[2, 2, 0, 0]}
                      name="focus score %"
                      animationDuration={1500}
                      animationEasing="ease-out"
                      animationBegin={800}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className={`flex items-center justify-center font-causten-semibold mb-4 max-sm:mb-2 space-x-6 max-sm:space-x-3 transition-all duration-500 delay-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <div className="flex items-center space-x-2 transition-all duration-300 hover:scale-105">
                  <div className="w-3 h-3 rounded-full bg-[#7086FD] transition-all duration-300"></div>
                  <span className="dark:text-[#BDBDBD] text-black text-[16px] max-sm:text-xs transition-all duration-300">Study Efficiency</span>
                </div>
                <div className="flex items-center space-x-2 transition-all duration-300 hover:scale-105">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 transition-all duration-300"></div>
                  <span className="dark:text-[#BDBDBD] text-black text-[16px] max-sm:text-xs transition-all duration-300">Focus Score %</span>
                </div>
              </div>

              {/* Chart Title */}
              <p className={`text-center dark:text-[#BDBDBD] text-black mb-4 max-sm:mb-2 text-[16px] max-sm:text-xs transition-all duration-500 delay-800 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                Study efficiency and focus by time of day
              </p>

              <div className={`absolute bottom-[26px] font-pt-sans w-[calc(100%-50px)] dark:bg-[#222428] font-causten-semibold bg-transparent border border-[#303336] px-5 py-[19px] mt-4 rounded-[9px] text-[14px] font-medium transition-all duration-700 ease-out delay-1000 transform ${showContent ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-98'}`}>
                <p className="text-[#36AF8D] mb-3 text-[18px] transition-all duration-300">
                  Time Optimization
                </p>
                <div className="dark:text-[#BDBDBD] text-black text-[16px] transition-all duration-300">
                  {renderInsights()}
                </div>
              </div>
            </CardContent> :
            <div className="h-[450px] flex-col items-center w-full flex justify-center">
              <IconDatabaseOff className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mb-4" />
              <h3 className="text-base font-medium dark:text-white text-black mb-2">
                {"Data not available "}
              </h3>
            </div>
          }
        </Card>
      </CardElementHome>
    </>
  );
}