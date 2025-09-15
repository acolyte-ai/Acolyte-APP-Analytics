import { useEffect, useState } from "react";
import { CardElementHome } from "./UI/element-home-card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export default function CardCreationSource() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);


  const customData = [
    {
      name: "cardiology-10pages.pdf",
      value: 58,
      color: "#34d399", // mint green
    },
    {
      name: "hair-anatomy-and-material-science.pdf",
      value: 22,
      color: "#f87171", // coral red
    },
    {
      name: "Essentials of Cardiology",
      value: 14,
      color: "#f59e0b", // golden amber
    },
    {
      name: "018843ac-0971-43bd-xxxx",
      value: 6,
      color: "#06b6d4", // sky blue
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
      classes={"md:h-[300px] h-auto  p-5 relative"}
      title="Card Creation Sources"
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
                <span className="text-[15px] font-causten-semibold dark:text-[#BDBDBD] text-gray-700 truncate">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>


        <div className="h-[250px]  w-full flex flex-col items-center justify-start">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                className="2xl:text-sm text-xs"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={0}
                labelLine={true}
                strokeWidth={0}
                onClick={handlePieClick}
              // label={({ name, percent }) =>
              //   data[0]?.name === "null"
              //     ? ""
              //     : `${name.slice(0, 20)} (${(percent * 100).toFixed(0)}%)`

              // }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry?.color}
                    stroke={selectedIndex === index ? "#ffffff" : "none"}
                    strokeWidth={selectedIndex === index ? 3 : 0}
                    style={{
                      filter: selectedIndex === index ? "brightness(1.2)" : "brightness(1)",
                      cursor: "pointer"
                    }}
                  />
                ))}
              </Pie>
              {/* <Tooltip
                contentStyle={{ backgroundColor: "white", border: "none" }}
                labelStyle={{ color: "#fff" }}
              /> */}

              <Tooltip
                contentStyle={{
                  backgroundColor: "#181A1D",
                  // border: "3px solid #10b981",
                  borderRadius: "10px",
                  // boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
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
                  color: "#BDBDBD",
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
          <p className="text-center text-[16px] font-causten-semibold dark:text-[#BDBDBD] text-black mt-4 ">
            Distribution of flashcards by material
          </p>


        </div>
      </div>


    </CardElementHome >
  );
}
