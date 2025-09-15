"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";

import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import folderIcon from "@/public/folderIcon.svg";
import { useEffect, useState } from "react";
import axios from "axios";
import useUserId from "@/hooks/useUserId";
import TestScore from "./testscore";
import { useSettings } from "@/context/store";
import physiology from "@/public/foldersIcon/lungs.svg"
import Pathology from "@/public/foldersIcon/pathology.svg"
import chemistry from "@/public/foldersIcon/bioChemistry.svg"
import Anatomy from "@/public/foldersIcon/Anatomy.svg"
import Microbiology from "@/public/foldersIcon/microbiology.svg"
import Orthopedics from "@/public/foldersIcon/ortho.svg"
import Pediatrics from "@/public/foldersIcon/pediatrics.svg"
import cardiology from "@/public/foldersIcon/cardio.svg"
import oncology from "@/public/foldersIcon/oncology.svg"
import pharma from "@/public/foldersIcon/pharma.svg"
import dermatology from "@/public/foldersIcon/derma.svg"
import emergency from "@/public/foldersIcon/emergency.svg"
import psychiatry from "@/public/foldersIcon/psychiatrics.svg"
import obstetrics from "@/public/foldersIcon/cyg.svg"
import xray from "@/public/foldersIcon/x-ray.svg"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";


const subjectList = [
  { img: Anatomy, title: "Anatomy" },
  { img: physiology, title: "Physiology" },
  { img: chemistry, title: "Biochemistry" },
  { img: Microbiology, title: "Micro Biology" },
  { img: Pathology, title: "Pathology" },
  { img: pharma, title: "Pharmacology" },
  { img: cardiology, title: "Cardiology" },
  { img: Pediatrics, title: "Pediatrics" },
  { img: obstetrics, title: "Obstetrics & GyG" },
  { img: Orthopedics, title: "Orthopedics" },
  { img: dermatology, title: "Dermatology" },
  { img: oncology, title: "Oncology" },
  { img: emergency, title: "Emergency Medicine" },
  { img: psychiatry, title: "Psychiatry" },
  { img: xray, title: "Radiology" }
]


export function TestAnalysis() {
  const [dataWeek, setDataWeek] = useState<[]>([]);
  const [dataAll, setDataAll] = useState<[]>([]);
  const [dataToday, setDataToday] = useState<[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
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
        `${process.env.NEXT_PUBLIC_PM_BASE_URL}/dev/v1/exam/history/${userId}?timeframe=all`
      );

      const today = await axios.get(
        `${process.env.NEXT_PUBLIC_PM_BASE_URL}/dev/v1/exam/history/${userId}?timeframe=today`
      );

      // const notAttempted = await axios.get(process.env.NEXT_PUBLIC_PM_BASE_URL + "/dev/v1/exam/not-taken?userId=" + userId)
      console.log("notAttempted", response.data.notAttempted, response.data.history)

      setDataWeek(response.data.history || []);
      setDataAll(all.data.history || []);
      setDataToday(today.data.history || []);
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

    }

  }, [userId]);

  useEffect(() => {
    if (userId && notifyTest) {
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

  const filteredSubjects = subjectList.filter((item) =>
    item.title.toLowerCase()
  );

  return (
    <div className="col-span-8 overflow-y-scroll no-scrollbar">
      <Tabs defaultValue="all" className="w-full place-items-end max-lg:place-items-start " onValueChange={(value) => {
        if (value !== "subject") {
          setSelectedSubject(null)
        }
      }}>
        <div className="w-full flex max-lg:flex-col items-center justify-between max-lg:justify-start max-lg:items-start mb-9 max-lg:mb-4">
          {" "}
          <p className="text-[22px]  2xl:text-[24px]  font-semibold max-lg:pb-4 text-[#184C3D] dark:text-white">
            Recent tests{" "}
          </p>
          <TabsList className="grid w-[350px] max-[330px]:w-[260px] grid-cols-3   dark:bg-transparent bg-transparent font-medium  ">
            <TabsTrigger
              value="all"
              className="data-[state=active]:border-b-4   rounded-sm max-lg:rounded-xs data-[state=active]:text-[#184C3D] dark:data-[state=active]:text-white   dark:text-[#8C8C8C] text-[#184C3D]
             data-[state=active]:border-[#36AF8D] data-[state=active]:font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="data-[state=active]:border-b-4  rounded-sm max-lg:rounded-xs data-[state=active]:text-[#184C3D] dark:data-[state=active]:text-white   dark:text-[#8C8C8C] text-[#184C3D] data-[state=active]:border-[#36AF8D] data-[state=active]:font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              This week
            </TabsTrigger>
            <TabsTrigger
              value="subject"
              className="data-[state=active]:border-b-4  rounded-sm max-lg:rounded-xs data-[state=active]:text-[#184C3D] dark:data-[state=active]:text-white   dark:text-[#8C8C8C] text-[#184C3D] data-[state=active]:border-[#36AF8D] data-[state=active]:font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              By subject
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="all"
          className="w-full h-auto 2xl:h-[500px] max-[330px]:max-w-[275px] "
        >
          {dataAll.length > 0 ? <TestScore data={dataAll} /> : <Nodata />}
        </TabsContent>
        <TabsContent
          value="week"
          className="w-full h-auto 2xl:h-[500px] max-[330px]:max-w-[275px] "
        >
          {dataWeek.length > 0 ? <TestScore data={dataWeek} /> : <Nodata />}
        </TabsContent>
        <TabsContent
          value="subject"
          className="w-full h-auto 2xl:h-[500px] max-[330px]:max-w-[275px] "
        >
          {selectedSubject ? (
            <div className="w-full h-auto 2xl:h-[500px] max-[330px]:max-w-[275px] ">
              {(() => {
                const filteredData = dataAll.filter((test: any) =>
                  test.subject?.toLowerCase() === selectedSubject?.toLowerCase() ||
                  test.category?.toLowerCase() === selectedSubject?.toLowerCase()
                )
                return filteredData.length > 0 ? <TestScore data={filteredData} /> : <Nodata />
              })()}
            </div>
          ) : (
            <div className="gap-4 w-full grid grid-cols-5 max-lg:grid-cols-4 max-sm:grid-cols-3">
              {filteredSubjects.map((subject, index) => (
                <div key={index} className="space-y-3 text-center justify-center items-center flex flex-col">
                  <button
                    className="w-full flex items-center justify-center transition-all duration-200"
                    onClick={() => setSelectedSubject(subject.title)}
                  >
                    <div className="dark:bg-[#1D2527] bg-[#AADACD] rounded-lg w-full flex items-center justify-center py-4 px-6 hover:shadow-md transition-shadow">
                      <Image
                        src={subject.img}
                        alt={subject.title}
                        className="w-[50px] h-[50px] object-contain"
                        priority={true}
                        height={50}
                        width={50}
                      />
                    </div>
                  </button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="font-causten-semibold text-sm font-medium text-[#184C3D] dark:text-white text-center leading-tight">
                        {subject.title}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{subject.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
