"use client";
import React, { useState } from "react";
import SubjectRecentNotes from "@/components/notes/SubjectRecentNotes";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MedicalNavigation from "@/components/notes/createNotes";
import LatestMedicalUpdates from "@/components/notes/aiRecommendation";
import LatestPersonalizedUpdates from "@/components/notes/personalizedStudyPlan";
import FileGridSystem from "@/components/FileSystem/File";

export default function NoteDashboard() {
    const [switchOn, setSwitchOn] = useState(true);
    return (
        <div className="w-full h-auto overscroll-y-none flex items-start px-4 md:px-6 lg:px-8 justify-start max-md:mb-20 overflow-x-hidden">
            {/* Main Grid Container */}
            <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-7 no-scrollbar min-w-0">
                {/* First Component - Full Width */}
                <div className="col-span-1 lg:col-span-2">
                    <Card className=" p-0 bg-transparent dark:bg-transparent border-none shadow-none">
                        {/* <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Header Section</CardTitle>
                  <CardDescription>
                    This is the full-width header component spanning both columns
                  </CardDescription>
                </CardHeader> */}
                        <CardContent className="p-0 bg-transparent dark:bg-transparent border-none shadow-none">
                            <Tabs defaultValue="upload" className="w-full h-full shadow-none">
                                <TabsList
                                    className="grid w-full max-w-[250px] grid-cols-2
         dark:bg-[#181A1D] bg-[#F3F4F9] h-11 mb-[14px] dark:border-none border border-[#B8B8B8] shadow-md"
                                >
                                    <TabsTrigger
                                        value="upload"
                                        className="font-[futureHeadlineBold] text-base w-full text-[15px]  dark:text-white tracking-normal
          dark:data-[state=active]:text-black data-[state=active]:text-white text-[#184C3D]  dark:data-[state=active]:bg-[#36AF8D]
             data-[state=active]:border-[#36AF8D] data-[state=active]:font-thin data-[state=active]:bg-[#36AF8D] data-[state=active]:shadow-none
          "
                                    >
                                        Create New
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="recent"
                                        className="text-[15px] font-[futureHeadlineBold] text-base w-full dark:text-white tracking-normal
           dark:data-[state=active]:text-black data-[state=active]:text-white text-[#184C3D] dark:data-[state=active]:bg-[#36AF8D]
             data-[state=active]:border-[#36AF8D] data-[state=active]:font-thin data-[state=active]:bg-[#36AF8D] data-[state=active]:shadow-none
          "
                                    >
                                        Recent
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent
                                    value="upload"
                                    className="w-full bg-[#F3F4F9] dark:bg-[#181A1D]"
                                >
                                    <MedicalNavigation />
                                </TabsContent>
                                <TabsContent
                                    value="recent"
                                    className="w-full px-5 py-[21px] min-h-[153px] max-h-[200px] overflow-y-auto bg-[#F3F4F9] dark:bg-[#181A1D] rounded-[7px] shadow-[inset_0_0_8px_#B8B8B82B]"
                                    style={{
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                    }}
                                >
                                    <SubjectRecentNotes />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Second Component - Left Half */}
                <div className="col-span-1 min-w-0">
                    <Card className="h-full bg-transparent dark:bg-transparent border-none p-0 shadow-none">
                        <CardContent className="bg-transparent dark:bg-transparent border-none p-0">
                            <FileGridSystem fileType="note" />
                        </CardContent>
                    </Card>
                </div>

                {/* Third Component - Right Half with Sub-components */}
                <div className="col-span-1 min-w-0">
                    <Tabs defaultValue="upload" className="w-full  shadow-none ">
                        <TabsList className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-y-5 w-full bg-transparent dark:bg-transparent h-auto mb-[14px]">
                            <div className="w-full lg:w-auto min-w-0">
                                <CardTitle className="text-lg sm:text-xl lg:text-[22px] font-[futureHeadline] tracking-wider font-bold text-[#228367] dark:text-white overflow-hidden truncate">
                                    {switchOn ? "AI Recommendation" : "Personalized Study Plan"}
                                </CardTitle>
                            </div>
                            <div className="w-full lg:w-auto lg:max-w-[450px] dark:bg-[#181A1D] bg-[#F3F4F9] rounded-[7px] flex items-center justify-end dark:border-none min-w-0">
                                {/* border border-[#B8B8B8] shadow-md */}
                                {/* <TabsTrigger
                  value="upload"
                  className="font-[futureHeadlineBold] text-xs sm:text-sm md:text-base lg:text-[15px] dark:text-white h-6 max-sm:h-8
                dark:data-[state=active]:text-black data-[state=active]:text-white text-[#184C3D] dark:data-[state=active]:bg-[#36AF8D] text-wrap
                data-[state=active]:border-[#36AF8D] data-[state=active]:font-bold data-[state=active]:bg-[#36AF8D] data-[state=active]:shadow-none
                flex-1 text-center"
                  onClick={() => setSwitchOn(true)}
                >
                  AI Suggestion
                </TabsTrigger>
                <TabsTrigger
                  value="recent"
                  className="text-xs sm:text-sm md:text-base lg:text-[15px] font-[futureHeadlineBold] dark:text-white h-6 max-sm:h-8
                dark:data-[state=active]:text-black data-[state=active]:text-white text-[#184C3D] dark:data-[state=active]:bg-[#36AF8D] text-wrap
                data-[state=active]:border-[#36AF8D] data-[state=active]:font-bold data-[state=active]:bg-[#36AF8D] data-[state=active]:shadow-none
                flex-1 text-center"
                  onClick={() => setSwitchOn(false)}
                >
                  Study Plan
                </TabsTrigger> */}
                            </div>
                        </TabsList>
                        <TabsContent
                            value="upload"
                            className="w-full bg-transparent dark:bg-transparent "
                        >
                            {/* Sub-component 1 */}
                            <Card className=" flex-shrink-0 p-0 bg-transparent dark:bg-transparent border-none shadow-none">
                                <CardContent className="p-0 bg-transparent dark:bg-transparent border-none h-fit">
                                    <LatestMedicalUpdates />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent
                            value="recent"
                            className="w-full  bg-transparent dark:bg-transparent "
                        >
                            {/* Sub-component 2 */}
                            <Card className=" flex-shrink-0 p-0 bg-transparent dark:bg-transparent border-none shadow-none">
                                <CardContent className="p-0 bg-transparent dark:bg-transparent border-none h-fit ">
                                    <LatestPersonalizedUpdates />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

