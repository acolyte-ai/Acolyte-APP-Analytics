import { useEffect, useState } from "react";
import { CardElementHome } from "./UI/element-home-card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export default function AnswerChangeHome() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);


  const customData = [
    {
      name: "Incorrect -> Correct",
      value: 18,
      color: "#34d399", // Green - Improvement
    },
    {
      name: "Correct -> Incorrect",
      value: 66,
      color: "#f87171", // Red - Regression
    },
    {
      name: "Incorrect -> Incorrect",
      value: 8,
      color: "#f59e0b", // Orange - Needs work
    },
    {
      name: "Correct -> Correct",
      value: 4,
      color: "#06b6d4", // Cyan - Consistent
    },
    {
      name: "Correct",
      value: 2,
      color: "#10b981", // Emerald - Single correct
    },
    {
      name: "Incorrect",
      value: 2,
      color: "#ef4444", // Red - Single incorrect
    },
  ];


  const init = async () => {
    setLoading(true);
    setData(customData);
    setLoading(false);
  };

  const handlePieClick = (_data: any, index: number) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <CardElementHome
      loading={loading}
      classes={"lg:h-[373px] h-auto p-5 relative"}
      title="Answer Change Pattern"
    >
      <div className="h-full font-causten-normal">
        <div className="xl:max-w-28 2xl:max-w-52 lg:max-w-28 md:max-w-52 sm:max-w-52  md:absolute md:top-4 md:right-4 h-auto flex flex-col justify-center p-4 ">
          <div className="space-y-3 max-h-full overflow-y-auto">
            {data.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-[14px] font-causten-semibold dark:text-gray-300 text-gray-700 truncate">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div
          className="h-[373px] w-full flex flex-col
            items-center justify-start"
        >
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                className="2xl:text-sm text-xs"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={0}
                strokeWidth={0}
                labelLine={true}
                onClick={handlePieClick}
              // label={({ name, percent }) =>
              //   data[0]?.name === "null"
              //     ? ""
              //     : `${name} (${(percent * 100).toFixed(0)}%)`
              // }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={selectedIndex === index ? "#ffffff" : "none"}
                    strokeWidth={selectedIndex === index ? 3 : 0}
                    style={{
                      filter: selectedIndex === index ? "brightness(1.2)" : "brightness(1)",
                      cursor: "pointer"
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "3px solid #10b981",
                  borderRadius: "10px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                  padding: "12px 12px",
                  fontSize: "14px",
                  lineHeight: "1.4",
                  color: "black",
                }}
                labelStyle={{
                  color: "black",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
                itemStyle={{
                  color: "#374151",
                  padding: "0",
                  margin: "0",
                }}
                cursor={false}
                formatter={(value, name) => [
                  `${value}%`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-[16px] dark:text-[#BDBDBD] text-black font-causten-semibold ">
            Outcome of answer changes during exam
          </p>

        </div>

      </div>

      {/*
      <div className="flex flex-col gap-3 text-sm font-pt-sans absolute top-0 right-0p-4">
        {data.map((entry, index) => (
          entry.name !== "null" && (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-white text-xs">
                {entry.name}: {entry.value}%
              </span>
            </div>
          )
        ))}
      </div> */}
    </CardElementHome>
  );
}
