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

interface TopicPerformanceData {
  topic: string;
  accuracy: string;
  confidence: string;
  avgTime: string;
  answerChanges: string;
  calibration: string;
}

export default function TopicPerformanceBreakdown() {
  const [data, setData] = useState<TopicPerformanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const init = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using custom data instead of API call
      const customData = [
        {"topic":"Hearing Loss","accuracy_pct":29,"confidence_pct":50,"avg_time_sec":12,"answer_changes":0,"calibration_error":0.21},
        {"topic":"medical education","accuracy_pct":38,"confidence_pct":98,"avg_time_sec":48,"answer_changes":0,"calibration_error":0.60},
        {"topic":"Diagnosis of Hearing Disorders","accuracy_pct":42,"confidence_pct":50,"avg_time_sec":15,"answer_changes":0,"calibration_error":0.08},
        {"topic":"Etiology","accuracy_pct":50,"confidence_pct":50,"avg_time_sec":26,"answer_changes":2,"calibration_error":0.00},
        {"topic":"Diagnosis","accuracy_pct":50,"confidence_pct":50,"avg_time_sec":4,"answer_changes":2,"calibration_error":0.00}
      ];

      const modifiedData = customData.map((item) => ({
        topic: item.topic,
        accuracy: `${item.accuracy_pct}%`,
        confidence: `${item.confidence_pct}%`,
        avgTime: `${item.avg_time_sec}s`,
        answerChanges: item.answer_changes.toString(),
        calibration: item.calibration_error === 0 ? "Yes" : "No",
      }));

      setData(modifiedData);
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

  return (

    <CardElementHome
      loading={loading}
      classes={"max-h-[400px] max-lg:h-auto max-lg:max-h-full px-5 py-[26px]"}
      title="Topic Performance Breakdown"
    >
      <div className="w-full font-causten-normal  overflow-hidden">
        <Table className="rounded-[9px] border-[#303336] ">
          {/* Fixed Header */}
          {/* <TableHeader className="border-b border-[#303336]  sticky top-0 z-10">
            <TableRow className="border-b border-[#303336] h-10 bg-zinc-700 ">
              <TableHead className="text-[#CF8A25] dark:text-[#CF8A25] rounded-tl-[9px] max-lg:text-sm text-[15px] font-medium text-left">
                TOPIC
              </TableHead>
              <TableHead className="text-[#CF8A25] dark:text-[#CF8A25] text-[15px] max-lg:text-sm font-medium text-center">
                ACCURACY
              </TableHead>
              <TableHead className="text-[#CF8A25] dark:text-[#CF8A25] text-[15px] max-lg:text-sm font-medium text-center">
                CONFIDENCE
              </TableHead>
              <TableHead className="text-[#CF8A25] dark:text-[#CF8A25] text-[15px] max-lg:text-sm font-medium text-center">
                AVG TIME
              </TableHead>
              <TableHead className="text-[#CF8A25] dark:text-[#CF8A25] text-[15px] max-lg:text-sm font-medium text-center">
                ANSWER CHANGES
              </TableHead>
              <TableHead className="text-[#CF8A25] dark:text-[#CF8A25] rounded-tr-[9px] max-lg:text-sm text-[15px] font-medium text-center">
                CALIBRATION
              </TableHead>
            </TableRow>
          </TableHeader> */}


          <TableBody className="border border-[#DADADA] font-causten-semibold dark:border-[#303336] w-full">
            {/* Scrollable Body */}
            {
              !data ? <div className="h-full py-10 flex-col items-center w-full flex justify-center">
                <IconDatabaseOff className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mb-4" />
                <h3 className="text-base font-medium dark:text-white text-black mb-2">
                  {"Data not available "}
                </h3>
              </div>

                :

                <ScrollArea className="h-[300px] w-full">
                  <TableHeader className="border-b border-[#DADADA]  dark:border-[#303336]  sticky top-0 z-10">
                    <TableRow className="border-b border-[#DADADA]  dark:border-[#303336] h-10 dark:bg-zinc-700 bg-zinc-300 ">
                      <TableHead className="text-[#CF8A25] dark:text-[#CF8A25] rounded-tl-[9px] text-sm md:text-base lg:text-[17px] font-medium text-left">
                        TOPIC
                      </TableHead>
                      <TableHead className="text-[#CF8A25] dark:text-[#CF8A25] text-sm md:text-base lg:text-[17px] font-medium text-center">
                        ACCURACY
                      </TableHead>
                      <TableHead className="text-[#CF8A25] dark:text-[#CF8A25] text-sm md:text-base lg:text-[17px] font-medium text-center">
                        CONFIDENCE
                      </TableHead>
                      <TableHead className="text-[#CF8A25] dark:text-[#CF8A25] text-sm md:text-base lg:text-[17px] font-medium text-center">
                        AVG TIME
                      </TableHead>
                      <TableHead className="text-[#CF8A25] dark:text-[#CF8A25] text-sm md:text-base lg:text-[17px] font-medium text-center">
                        ANSWER CHANGES
                      </TableHead>
                      <TableHead className="text-[#CF8A25] dark:text-[#CF8A25] rounded-tr-[9px] text-sm md:text-base lg:text-[17px] font-medium text-center">
                        CALIBRATION
                      </TableHead>
                    </TableRow>

                  </TableHeader>

                  {data.map((row, index) => (
                    <TableRow
                      key={index}
                      className="border-b border-[#DADADA]  dark:border-[#303336] h-[52px] "
                    >
                      <TableCell className="text-[#36AF8D] text-sm md:text-base lg:text-[18px] font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                        {row?.topic ?? null}
                      </TableCell>
                      <TableCell className="dark:text-white text-black text-sm md:text-base lg:text-[18px] font-medium text-ellipsis whitespace-nowrap text-center">
                        {row?.accuracy ?? 0}
                      </TableCell>
                      <TableCell className="dark:text-white text-black text-sm md:text-base lg:text-[18px] font-medium text-ellipsis whitespace-nowrap text-center">
                        {row?.confidence ?? 0}
                      </TableCell>
                      <TableCell className="dark:text-white text-black text-sm md:text-base lg:text-[18px] font-medium text-ellipsis whitespace-nowrap text-center">
                        {row?.avgTime ?? 0}
                      </TableCell>
                      <TableCell className="dark:text-white text-black text-sm md:text-base lg:text-[18px] font-medium text-ellipsis whitespace-nowrap text-center">
                        {row?.answerChanges ?? 0}
                      </TableCell>
                      <TableCell className="text-[#36AF8D] text-sm md:text-base lg:text-[18px] font-medium text-ellipsis whitespace-nowrap text-center">
                        {row?.calibration ?? 0}
                      </TableCell>
                    </TableRow>
                  ))}


                </ScrollArea>
            }

          </TableBody>

        </Table>
      </div>
    </CardElementHome>
  );
}
