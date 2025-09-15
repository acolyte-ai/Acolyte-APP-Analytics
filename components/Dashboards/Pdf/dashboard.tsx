"use client";
import React from "react";
// import FileUpload from "@/components/pdf/file-upload";
// import FileGridSystem from "@/components/pdf/File";
// import { ContinueReading } from "../../components/StudyDashboard";
import { ReviewSection } from "@/components/pdf/StudyDashboard";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import FileUpload from "@/components/FileSystem/file-upload";
import FileGridSystem from "@/components/FileSystem/File";
// import { ContinueReading } from "@/components/FileSystem/StudyDashboard";
// import ContinueReading from "@/components/PDFViewer/analytics/ContinueReading";
import { ContinueReading } from "@/components/FileSystem/StudyDashboard";


const PdfDashboard = () => {
    return (
        <div className="w-full h-full px-4 md:px-6 lg:px-8 pb-6 overflow-y-scroll no-scrollbar">
            {/* Main content wrapper with TodoList sidebar */}
            <div className="w-full h-full pb-10 ">
                <div className="flex flex-col lg:flex-row w-full h-full  ">

                    {/* Left and center content */}
                    <div className="flex-1 gap-10 2xl:gap-11 flex flex-col h-full max-sm:gap-[30px]">
                        <div className="">
                            <FileUpload />
                        </div>

                        {/* Responsive grid for SubjectsFiles and ContinueReading */}

                        <div className="grid grid-cols-1 md:grid-cols-2
          gap-[35px] w-full md:h-[773px] ">
                            <div className="w-full h-[400px] max-md:h-fit">
                                {/* <SubjectsFiles fileType="pdf" /> */}
                                <FileGridSystem fileType="pdf" />
                            </div>
                            <div className="w-full h-full space-y-8 ">
                                <ContinueReading />
                                {/* <ReviewSection /> */}
                            </div>
                        </div>
                        <div className="w-full h-full space-y-8 max-md:pb-40 ">
                            {/* <ContinueReading /> */}
                            <ReviewSection />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PdfDashboard;
