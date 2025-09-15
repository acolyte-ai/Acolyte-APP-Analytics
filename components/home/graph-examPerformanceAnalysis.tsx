import { useEffect, useState } from "react";
import { CardElementHome } from "./UI/element-home-card";
import Image from "next/image";
import chart from "@/public/barChart.svg";
import { IconDatabaseOff } from "@tabler/icons-react";

export default function ExamPerformanceAnalysis() {
  const [data, setData] = useState<[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);




  const transformAnalyticsWithCustomIcons = (analytics, iconMap = {}) => {
    const defaultIcons = {
      totalTime: "/newIcons/alarm.svg",
      accuracy: "/newIcons/circles.svg",
      answerChanges: "/newIcons/Repeat.svg",
      weakTopics: "/newIcons/warning.svg"
    };

    const icons = { ...defaultIcons, ...iconMap };

    return [
      {
        icon: icons.totalTime,
        title: "Total Time",
        value: analytics.totalTime?.value || "0m",
        subtitle: analytics.totalTime?.trend || "No change",
      },
      {
        icon: icons.accuracy,
        title: "Accuracy",
        value: analytics.accuracy?.value || "0%",
        subtitle: analytics.accuracy?.trend || "No change",
      },
      {
        icon: icons.answerChanges,
        title: "Answer Changes",
        value: analytics.answerChanges?.value?.toString() || "0",
        subtitle: `${analytics.answerChanges?.beneficial || 0} beneficial`,
      },
      {
        icon: icons.weakTopics,
        title: "Weak Topics",
        value: analytics.weakTopics?.value?.toString() || "0",
        subtitle: analytics.weakTopics?.status || "All good",
      },
    ];
  };



  const init = async () => {
    try {
      setLoading(true);
      setError(null);

      // Using custom hardcoded data
      const customAnalytics = {
        totalTime: {
          value: "45m",
          trend: "2m faster than last exam"
        },
        accuracy: {
          value: "78%",
          trend: "5% improvement"
        },
        answerChanges: {
          value: 12,
          beneficial: 8
        },
        weakTopics: {
          value: 3,
          status: "Focus on Cardiology"
        }
      };

      const mappedData = transformAnalyticsWithCustomIcons(customAnalytics);
      setData(mappedData);
      setLoading(false);
    } catch (err) {
      console.error("Error processing dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to process dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);



  return (
    <CardElementHome
      loading={loading}
      classes={"h-[500px] py-[26px] px-5"}
      title="Exam Performance Analysis"
    >
      <div className="space-y-[15px] font-causten-semibold">
        {data && data.length > 0 ?
          data.map((stat, index) => (
            <div
              key={index}
              className="bg-transparent border border-[#303336] h-[100px]
                         rounded-[9px] px-[21px] py-[19px] flex items-top"
            >
              <Image
                src={stat.icon}
                alt={stat.title}
                width={30}
                height={30}
                className="w-6 h-6 mr-4 mt-2"
              />

              <div className="flex flex-col ">
                <h3 className="text-[#36AF8D] text-sm md:text-base lg:text-[18px] font-normal ">
                  {stat.title}
                </h3>
                <p className="dark:text-[#BDBDBD] text-black text-base md:text-lg lg:text-[20px] font-bold ">
                  {stat.value}
                </p>
                <p className="dark:text-[#BDBDBD] text-black text-xs md:text-sm lg:text-[16px] font-medium">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          ))
          : <div className="h-[450px] flex-col items-center w-full flex justify-center">
            <IconDatabaseOff className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mb-4" />
            <h3 className="text-base font-medium dark:text-white text-black mb-2">
              {"Data not available "}
            </h3>
          </div>

        }
        {/* {

                    <div className='flex  items-center justify-center gap-5 h-[450px]'>
                        <Image src={chart}

                            alt={"goals"}
                            height={50}
                            width={50}
                            className='h-[38px] w-[38px]'
                        >

                        </Image>
                        <div className='text-left' >
                            <p className='text-[#36AF8D] text-[16px]'>No Data yet</p>
                            <p className='text-[16px]'>Plant the first seed of Progress today!</p>
                        </div>
                    </div>

                } */}
      </div>
    </CardElementHome>
  );
}
