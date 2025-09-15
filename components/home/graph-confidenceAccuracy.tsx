import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { CardElementHome } from "./UI/element-home-card";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function ConfidenceAccuracy() {
  const [data, setData] = useState<{ x: number; y: number; subject: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string>("Students show varying confidence-accuracy alignment across subjects. Medicine and Physiology demonstrate well-calibrated confidence, while Surgery and Pharmacology show overconfidence patterns.")
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  // Dynamic colors based on theme
  const axisTextColor = theme === 'dark' ? "#CCCCCC" : "#666666"; // lighter for dark, darker for light
  const gridColor = theme === 'dark' ? "#E5E7EB" : "#333333"; // darker for dark, lighter for light
  const tooltipBg = theme === 'dark' ? "#333333" : "#FFFFFF"; // dark bg for dark mode, white for light
  const tooltipBorder = theme === 'dark' ? "none" : "1px solid #E5E7EB"; // no border for dark, light border for light
  const tooltipTextColor = theme === 'dark' ? "#FFFFFF" : "#000000"; // white text for dark, black for light
  const descriptionTextColor = theme === 'dark' ? "text-[#BDBDBD]" : "text-gray-600";

  const PATTERN_COLORS = {
    Mature: "#34d399", // Green - Improvement
    Young: "#f87171", // Red - Regression
    Learning: "#f59e0b", // Orange - Needs work
    New: "#06b6d4", // Cyan - Consistent
  } as const;

  const customData = [
    {"subject":"Anatomy","confidence_pct":78,"accuracy_pct":72},
    {"subject":"Physiology","confidence_pct":82,"accuracy_pct":85},
    {"subject":"Pathology","confidence_pct":74,"accuracy_pct":69},
    {"subject":"Pharmacology","confidence_pct":70,"accuracy_pct":66},
    {"subject":"Microbiology","confidence_pct":76,"accuracy_pct":80},
    {"subject":"OBGYN","confidence_pct":71,"accuracy_pct":68},
    {"subject":"Pediatrics","confidence_pct":73,"accuracy_pct":75},
    {"subject":"Medicine","confidence_pct":80,"accuracy_pct":78},
    {"subject":"Surgery","confidence_pct":69,"accuracy_pct":63},
    {"subject":"ENT/Ophthalmology","confidence_pct":74,"accuracy_pct":71}
  ];

  useEffect(() => {
    const modifiedData = customData.map((item) => ({
      x: item.confidence_pct,
      y: item.accuracy_pct,
      subject: item.subject,
    }));
    setData(modifiedData);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="rounded-lg p-3 shadow-lg"
          style={{
            backgroundColor: tooltipBg,
            border: tooltipBorder,
            color: tooltipTextColor
          }}
        >
          <p className="text-sm font-medium mb-2">
            {payload[0]?.payload?.subject}
          </p>
          <p className="text-sm font-medium mb-1">
            Confidence: {payload[0]?.payload?.x}%
          </p>
          <p className="text-sm">
            Accuracy: {payload[0]?.payload?.y}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <CardElementHome
      loading={loading}
      classes={"h-[500px] max-[370px]:h-[590px] max-sm:h-[530px] px-5 py-[26px] relative"}
      title="Confidence vs Accuracy"
    >
      <div className="h-[448px] space-y-4 ">
        <div className="h-[248px] w-full font-causten-normal">
          <ResponsiveContainer
            className="text-dark dark:text-[#BDBDBD] flex w-full items-center justify-center "
            width="100%"
            height="100%"
          >
            <ScatterChart margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
              <CartesianGrid
                stroke={gridColor}
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="x"
                type="number"
                domain={[40, 100]}
                tick={{ fill: axisTextColor, fontSize: 12 }}
              />
              <YAxis
                dataKey="y"
                type="number"
                domain={[40, 100]}
                tick={{ fill: axisTextColor, fontSize: 12 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ strokeDasharray: "3 3" }}
              />
              <Scatter
                name="Confidence vs Accuracy"
                data={data}
                fill="#6366F1"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <p className={`text-center dark:text-[#BDBDBD] text-black text-[16px] ${descriptionTextColor} font-causten-semibold`}>
          Self-assessed confidence vs actual accuracy
        </p>

        <div className="dark:bg-[#222428] bg-transparent border border-black font-causten-semibold px-5 absolute bottom-[26px] w-[calc(100%-40px)] py-[19px] rounded-[9px] text-[16px] dark:border dark:border-[#303336]">
          <p className="text-[#36AF8D] mb-3 ">Confidence Calibration</p>
          <p>
            {insights}
          </p>
        </div>
      </div>
    </CardElementHome>
  );
}