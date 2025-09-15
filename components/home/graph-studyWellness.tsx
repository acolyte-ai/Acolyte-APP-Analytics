import { useEffect, useState } from "react";
import { CardElementHome } from "./UI/element-home-card";

type CircleProgressProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  isAnimating?: boolean;
};

const CircleProgress: React.FC<CircleProgressProps> = ({
  percentage,
  size = 48,
  strokeWidth = 4,
  isAnimating = false,
}) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    if (percentage > 0) {
      // Start animation after a short delay
      const timer = setTimeout(() => {
        setAnimatedPercentage(percentage);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [percentage]);

  return (
    <div className={`w-[100px] h-[100px] transition-all duration-500 ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg] w-full h-full"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          className="stroke-[#B9B9B9] dark:stroke-[#2d2d2d] transition-all duration-300"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#36AF8D"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1500 ease-out"
          style={{
            filter: animatedPercentage > 0 ? 'drop-shadow(0 0 4px rgba(54, 175, 141, 0.3))' : 'none'
          }}
        />
        {/* Percentage text */}
        <g transform={`rotate(90, ${size / 2}, ${size / 2})`}>
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="text-[8px] md:text-[10px] lg:text-sm xl:text-base 2xl:text-lg fill-[#34d399] transition-all duration-700 ease-out"
          >
            {Math.round(animatedPercentage)}%
          </text>
        </g>
      </svg>
    </div>
  );
};

export default function StudyWellness() {
  const [data, setData] = useState<{
    work_break_ratio: string;
    consistency_pct: number;
    note: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const init = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsAnimating(true);

      // Using custom values instead of API call
      const customData = {
        work_break_ratio: "4.3:1",
        consistency_pct: 82,
        note: "Healthy break cadence; strong daily activity."
      };

      setData(customData);
      setLoading(false);

      // Start entrance animation
      setTimeout(() => {
        setShowContent(true);
        setIsAnimating(false);
      }, 300);

    } catch (err) {
      console.error("Error setting dashboard data:", err);
      setError((err as Error).message || "Failed to set dashboard data");
      setData(null);
      setLoading(false);
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    init();
  }, []);


  // No Data Component
  const NoDataMessage = ({ message }: { message: string }) => {
    return (
      <div className="flex flex-col items-center justify-center h-[254px] max-sm:h-[300px] w-full space-y-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-causten-medium text-gray-900 dark:text-gray-100">
            No wellness data available
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-causten-normal max-w-xs">
            {message}
          </p>
        </div>
      </div>
    );
  };

  console.log("data??", data)

  return (
    <CardElementHome
      loading={loading}
      classes={"h-[340px] max-sm:h-[360px] relative"}
      title="Study Wellness"
    >
      <div className="flex flex-col w-full h-full gap-5 font-causten-semibold">


        {
          error && <NoDataMessage message={"Network Issues"} />

        }

        {
          !data && <NoDataMessage message={" Start studying to track your work-break ratio and consistency patterns"} />
        }

        {
          data && (
            <div className={`flex items-center justify-center gap-[60px] max-sm:gap-6 w-full h-[200px]`}>
              <div className={`space-y-4 text-center place-items-center transition-all duration-500 delay-200 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <CircleProgress
                  percentage={(() => {
                    // Convert "4.3:1" ratio to percentage
                    // 4.3:1 means 4.3 work units for 1 break unit
                    // Total = 4.3 + 1 = 5.3
                    // Work percentage = 4.3/5.3 * 100 ≈ 81%
                    const ratio = parseFloat(data.work_break_ratio.split(':')[0]);
                    const total = ratio + 1;
                    return Math.round((ratio / total) * 100);
                  })()}
                  size={100}
                  strokeWidth={6}
                  isAnimating={isAnimating}
                />
                <p className="text-[16px] md:text-[18px] lg:text-[21px] font-causten-semibold transition-all duration-300 hover:text-[#36AF8D] text-[#BDBDBD]">
                  Work Break Ratio
                </p>
              </div>

              <div className={`space-y-4 text-center place-items-center transition-all duration-500 delay-400 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <CircleProgress
                  percentage={data.consistency_pct}
                  size={100}
                  strokeWidth={6}
                  isAnimating={isAnimating}
                />
                <p className="text-sm md:text-[18px] lg:text-[21px] font-causten-semibold transition-all duration-300 hover:text-[#36AF8D] text-[#BDBDBD]">
                  Consistency
                </p>
              </div>
            </div>
          )
        }

        <div className={` bg-[#F3F4F9] dark:border-none border border-black
                      dark:bg-[#222428] px-5 py-[11px] rounded-[9px] transition-all font-causten-semibold duration-700 ease-out delay-600 transform overflow-y-auto max-h-32 scrollbar-hide ${showContent ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-98'}`}>
          <p className="text-[#36AF8D] mb-3 transition-all duration-300 text-[18px] ">
            Study Wellness Insights
          </p>
          <p className="transition-all dark:text-[#BDBDBD] text-black text-[16px] duration-300 break-words">
            {data?.note}
          </p>
        </div>
      </div>
    </CardElementHome>
  );
}