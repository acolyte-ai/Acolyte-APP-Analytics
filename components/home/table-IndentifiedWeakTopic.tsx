import { useEffect, useState } from "react";
import { CardElementHome } from "./UI/element-home-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { IconDatabaseOff } from "@tabler/icons-react";

export default function IdentifiedWeakTopics() {
  const customData = [
    { "topic": "Anemia Diagnosis", "accuracy_pct": 28, "revisits": 1, "changes": 0 },
    { "topic": "Differential Diagnosis", "accuracy_pct": 24, "revisits": 1, "changes": 1 },
    { "topic": "Sinus Bradycardia", "accuracy_pct": 10, "revisits": 0, "changes": 1 },
    { "topic": "Management", "accuracy_pct": 31, "revisits": 1, "changes": 1 },
    { "topic": "Acute Kidney Injury Staging", "accuracy_pct": 22, "revisits": 2, "changes": 1 },
    { "topic": "Pediatric Murmurs", "accuracy_pct": 26, "revisits": 1, "changes": 0 }
  ];

  const [data, setData] = useState<{ topic: string; accuracy: string; revisits: number; changes: number }[]>([]);
  const [insights, setInsights] = useState<string>("These topics show the areas where you need the most improvement based on your performance data.")
  const [loading, setLoading] = useState(false);

  const PATTERN_COLORS = {
    Mature: "#34d399", // Green - Improvement
    Young: "#f87171", // Red - Regression
    Learning: "#f59e0b", // Orange - Needs work
    New: "#06b6d4", // Cyan - Consistent
  } as const;

  useEffect(() => {
    const modifiedData = customData.map(item => ({
      topic: item.topic,
      accuracy: `${item.accuracy_pct}%`,
      revisits: item.revisits,
      changes: item.changes,
    }));
    setData(modifiedData);
  }, []);

  const nodata = [
    {
      topic: "Topics",
      accuracy: "0%",
      revisits: 0,
      changes: 0,
    },
  ];
  return (
    <CardElementHome
      loading={loading}
      classes={"font-causten-normal max-h-[410px] max-lg:h-auto max-lg:max-h-full px-5 py-[26px]"}
      title="Identified Weak Topics"
    >
      <div className="border-[#DADADA]  dark:border-[#303336] border rounded-xl no-scrollbar overflow-hidden">



        <Table className="w-full text-base  rounded-t-xl no-scrollbar font-causten-normal ">
          {
            !data ?
              <div className="h-full py-10 flex-col items-center w-full flex justify-center">
                <IconDatabaseOff className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mb-4" />
                <h3 className="text-base font-medium dark:text-white text-black mb-2">
                  {"Data not available "}
                </h3>
              </div> :
              <TableBody className="border-[#DADADA]  dark:border-[#303336] border no-scrollbar ">
                <ScrollArea className="h-[250px] mb-4 " >
                  <TableHeader className="rounded-t-xl ">
                    <TableRow className="bg-[#DADADA] dark:bg-[#303336] rounded-t-xl font-causten-semibold">
                      <TableHead className="dark:text-[#CF8A25] text-black max-lg:text-sm rounded-tl-xl">
                        TOPIC
                      </TableHead>
                      <TableHead className="dark:text-[#CF8A25] text-black max-lg:text-sm">
                        ACCURACY
                      </TableHead>
                      <TableHead className="dark:text-[#CF8A25] text-black  max-lg:text-sm">
                        REVISITS
                      </TableHead>
                      <TableHead className="dark:text-[#CF8A25] text-black  max-lg:text-sm">
                        CHANGES
                      </TableHead>
                      {/* <TableHead className="dark:text-white text-black max-lg:text-sm font-medium rounded-tr-xl">
                  ACTION
                </TableHead> */}
                    </TableRow>
                  </TableHeader>
                  {data.map((item, index) => (
                    <TableRow
                      key={index}
                      className="border-t h-5  dark:text-white
                             text-black dark:border-[#303336] border-[#DADADA]"
                    >
                      <TableCell className="text-[#36AF8D] capitalize font-0">{item.topic}</TableCell>
                      <TableCell>{item.accuracy}</TableCell>
                      <TableCell>{item.revisits}</TableCell>
                      <TableCell>{item.changes}</TableCell>
                      {/* <TableCell className="place-items-end w-full flex items-center  justify-center">
                    <Button className="bg-[#36AF8D] hover:bg-[#2c8f73] dark:bg-[#36AF8D] dark:hover:bg-[#2c8f73] w-full text-white dark:text-black text-xs px-[14px] py-[13px]">
                      Review Now
                    </Button>
                  </TableCell> */}
                    </TableRow>
                  ))}

                </ScrollArea>
              </TableBody>
          }

        </Table>

        <div className=" text-sm p-5 py-[11px] pb-5 space-y-2  mt-[11px] font-causten-semibold ">
          <p className="text-[#36AF8D]  text-[16px]">Weak Topics Analysis</p>
          <p className="dark:text-[#BDBDBD] text-black text-[16px]">
            {insights || "No insights available at the moment."}
          </p>
        </div>
      </div>
    </CardElementHome>
  );
}
