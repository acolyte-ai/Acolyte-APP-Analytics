import { useRouter } from "next/navigation"
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useSettings } from "@/context/store";
import useUserId from "@/hooks/useUserId";
import folderIcon from "@/public/folderIcon.svg";
import TestScore from "../practiceTest-dashboard/testscore";
import axios from "axios";

interface Props {
  icon: string;
  title: string;
  content: string
}


export default function RetakeTestUI({ icon, title, content }: Props) {
  const [dataAll, setDataAll] = useState<[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = useUserId();
  const { notifyTest, setNotifyTest } = useSettings()

  const init = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PM_BASE_URL}/dev/v1/exam/history/${userId}?timeframe=seven`
      );

      const all = await axios.get(
        `${process.env.NEXT_PUBLIC_PM_BASE_URL}/dev/v1/exam/history/attempted/${userId}`
      );

      const today = await axios.get(
        `${process.env.NEXT_PUBLIC_PM_BASE_URL}/dev/v1/exam/history/${userId}?timeframe=today`
      );

      // const notAttempted = await axios.get(process.env.NEXT_PUBLIC_PM_BASE_URL + "/dev/v1/exam/not-taken?userId=" + userId)
      console.log("notAttempted", response.data.notAttempted, response.data.history)
      // setDataWeek(response.data.history || []);
      setDataAll(all.data.history || []);
      // setDataToday(today.data.history || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to fetch dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      init();
      setNotifyTest(false)
    }

  }, [userId, notifyTest]);

  const Nodata = () => {
    return (
      <div
        className="  font-causten-semibold  rounded-[7px]
             py-[26px] px-[20px]  dark:bg-[#181A1D]  bg-[#F3F4F9]
              dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8]
               shadow-md h-full w-full flex items-center justify-center"
      >
        <div className="space-y-6 w-full text-center flex items-center justify-center flex-col ">
          <Image
            src={folderIcon}
            height={50}
            width={50}
            className="h-[45px] w-[54px] opacity-35"
            alt={"folder"}
          />
          <p className="font-normal text-lg">
            No results found <br></br>
            Take test to get results
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger className="p-0 m-0">
        <div
          className="w-full h-full flex items-center justify-between dark:bg-[#1C2626] bg-[#F3F4F9] cursor-pointer font-causten-semibold
         rounded-xl xl:py-4 max-md:py-2 py-4 border border-[#B8B8B8] shadow-md dark:shadow-none dark:border-none"
        >
          <div className="grid grid-cols-12 grid-rows-2 gap-2 max-sm:gap-1 max-md:gap-1 text-wrap h-full w-full px-4 xl:px-6 items-stretch"
          // onClick={() => router.push(("/assesment/dailyTest/" + localStorage.getItem("aco-recent-test")) || "/assesment/dailyTest/null")}
          >
            <div className="col-span-3 row-span-2 max-md:col-span-1 max-sm:col-span-2 max-xl:row-span-2 max-md:row-span-2 flex items-start justify-start md:items-start w-full  h-full">
              <Image
                src={icon}
                height={45}
                width={45}
                alt={icon}
                className="brightness-75 dark:brightness-100 object-contain contrast-150 dark:contrast-100 dark:hue-rotate-0 hue-rotate-0 h-auto p-2"
              />
            </div>
            <p className="col-span-9 row-span-1 flex items-start justify-start text-left text-[18px] xl:text-[22px] w-full text-wrap font-causten-semibold
             text-[#184C3D] dark:text-white font-medium leading-tight">
              {title}
            </p>
            <p className="col-span-9 row-span-1 justify-start max-xl:col-span-9 flex items-start text-[13px] xl:text-[14px] font-causten-semibold
            w-full text-wrap break-words text-[#747474] dark:text-[#C6C6C6] font-medium leading-relaxed">
              {content}
            </p>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="bg-transparent dark:bg-transparent p-0 shadow-none border-none">
        <DialogTitle className="text-[22px] max-md:text-start max-md:col-span-2 mb-2 2xl:text-[24px] tracking-tight font-normal  font-causten-semibold
                   dark:text-white text-[#228367] col-span-1 capitalize shadow-teal-200 text-nowrap w-full">
          {title}
        </DialogTitle>
        {dataAll.length > 0 ? <TestScore data={dataAll} /> : <Nodata />}
      </DialogContent>
    </Dialog>
  )
}