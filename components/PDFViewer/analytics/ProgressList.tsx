"use client";
import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import AnalyticsService from "./analyticsService";
import useUserId from "@/hooks/useUserId";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/store";
import { getPdfById } from "@/db/pdf/fileSystem";
import Image from "next/image";
import folderIcon from "@/public/folderIcon.svg";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
import { useGetPdfNameById } from "@/hooks/useGetPdfNameById";
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
import { getDocName } from "@/lib/utils";
import { toast } from "sonner";

// Fallback dummy data if API fails
const fallbackData = [
  {
    id: "doc1",
    title: "Introduction to React",
    color: "#10b981", // emerald-500
    lastAccessed: "Today, 2:30 PM",
    completedPages: 45,
    totalPages: 78,
    progress: 58,
    documentId: "react-intro-2023",
    userId: "user123",
    timeSpent: "3h 45m",
    visitedSections: ["Getting Started", "Components", "State Management"],
  },
  // other fallback items...
];

// Function to format time
const formatTime = (milliseconds) => {
  if (!milliseconds) return "0s";

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// Function to format last accessed date
const formatLastAccessed = (timestamp) => {
  if (!timestamp) return "Unknown";

  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};

const ProgressList = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRedirect, setIsLoadingRedirect] = useState(false);
  const [error, setError] = useState(null);
  const userId = useUserId(); // Get the current user ID if available
  // Store data from API to prevent losing it on re-renders
  const analyticsDataRef = React.useRef(null);
  const router = useRouter();
  const { fileSystem, setViewCombination } = useSettings();
  const getPdfNameById = useGetPdfNameById();

  useEffect(() => {
    if (userId) {
      init();
    }
  }, [userId]);

  const init = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_PDF_ANALYTICS_BASE_URL +
        `/dev/v1/pdf/dashboard-data?userId=${userId}`
      );

      setDocuments(response.data.data.continueReading ?? []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Function to handle click on a document item
  const handleDocumentClick = (document) => {
    setIsLoadingRedirect(true)
    if (!document || !document.pdfId) {
      console.error("Invalid document or missing document ID");
      toast.info("Document is not available!")
      setIsLoadingRedirect(false)
      return;
    }

    // Show more detailed information in console for debugging
    if (document.analyticsData) {
      console.log("Original analytics data:", document.analyticsData);
    }

    setViewCombination("pdf");
    // Navigate to the document
    router.push(`/workspace/${document.pdfId}`);
    setIsLoadingRedirect(false)
  };
  const createSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, 'and');
  };
  function folderIconFunction(subject: string) {

    const folderIconMap = {
      "folder-anatomy": Anatomy,
      "folder-physiology": physiology,
      "folder-biochemistry": chemistry,
      "folder-micro-biology": Microbiology,
      "folder-pathology": Pathology,
      "folder-pharmacology": pharma,
      "folder-cardiology": cardiology,
      "folder-pediatrics": Pediatrics,
      "folder-obstetrics-and-gyg": obstetrics,
      "folder-orthopedics": Orthopedics,
      "folder-dermatology": dermatology,
      "folder-oncology": oncology,
      "folder-emergency-medicine": emergency,
      "folder-psychiatry": psychiatry,
      "folder-radiology": xray
    };

    return folderIconMap[subject] || folderIcon;
  }



  // Show loading state
  if (isLoading) {
    return (
      <div className="  dark:bg-[#181A1D] bg-[#F3F4F9] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md rounded-lg w-full h-[320px] mt-2.5  overflow-hidden  dark:border-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 font-causten-semibold">
            Loading your reading progress...
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingRedirect) {
    return (
      <div className="dark:bg-[#181A1D] bg-[#F3F4F9] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md rounded-lg w-full h-[320px] mt-2.5 overflow-hidden dark:border-gray-700 flex items-center justify-center">
        <div className="text-center">

          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-causten-semibold">
              Redirecting to MyAcolyte PDF Viewer...
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-causten-semibold">
              Please wait while we prepare your document
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-transparent rounded-2xl w-full h-full
      flex flex-col  "
    >
      <div className="flex-1  overflow-hidden w-full">
        {error && (
          <div className="text-center p-4 text-red-500 text-sm">{error}</div>
        )}
        <div className="h-[335px] overflow-y-auto  w-full remove-scrollbar no-scrollbar ">
          {!error && documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center  h-[300px] text-center">
              <div className="text-gray-400 mb-3">
                <FileText size={48} />
              </div>
              <h3 className="text-gray-700 dark:text-gray-300 font-causten-semibold mb-1">
                No reading progress yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-causten-semibold">
                Start reading documents to track your progress
              </p>
            </div>
          ) : (
            <div className=" space-y-6 w-full pt-4">
              {documents.map((document) => (
                <div
                  className="dark:bg-[#181A1D] bg-[#F3F4F9] p-[14px] 2xl:py-[14px] 2xl:px-[82px] dark:shadow-[inset_0_0_8px_#B8B8B82B] rounded-lg w-full dark:border-none border border-[#B8B8B8] shadow-md"
                  key={document.pdfId}
                  onClick={() => handleDocumentClick(document)}
                >
                  <div className="grid grid-cols-12 grid-rows-2 max-md:grid-rows-4 gap-3 max-md:gap-y-1 w-full">
                    {/* Folder icon */}
                    <div className="w-full flex items-center justify-center col-span-2 row-span-2 max-md:row-span-4 max-md:justify-start max-md:items-start max-md:h-fit">
                      <div className="dark:bg-[#1D2527] bg-[#AADACD] m-1 rounded-lg w-full h-full flex items-center justify-center py-[5px] px-[6px] max-lg:p-2">
                        <Image
                          src={folderIconFunction(createSlug("folder-" + document.subject))}
                          alt={document?.pdfId || ""}
                          className="w-10 h-10 max-sm:h-full object-contain"
                          priority={true}
                          height={30}
                          width={30}
                        />
                      </div>
                    </div>


                    {/* Progress bar - moved to left */}
                    <div className="relative h-1 dark:bg-[#2A2D32] bg-[#B9B9B9] max-md:row-span-1 max-md:col-span-5 rounded-full overflow-hidden w-full col-span-2 px-2 mt-2.5">
                      <div
                        className="absolute top-0 left-0 h-full dark:bg-[#3ADE9E] bg-[#139571] rounded-full"
                        style={{ width: `${document.progressPercentage}%` }}
                      ></div>
                    </div>

                    {/* Progress percentage - moved to left */}
                    <div className="text-xs font-causten-semibold flex items-center justify-start dark:text-[#3ADE9E] text-[#139571] col-span-1 max-md:row-span-1 max-md:col-span-3">
                      <span className="h-1 w-1 dark:bg-[#3ADE9E] bg-[#139571] rounded-full mr-2"></span>
                      <span className="text-nowrap">
                        {document.progressPercentage}%
                      </span>
                    </div>

                    {/* File name - expanded to take more space */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-full col-span-5 max-md:row-span-1 max-md:col-span-9 items-center justify-start flex cursor-pointer">
                            <h2 className="dark:text-white text-black text-[16px] font-medium font-causten-semibold w-full overflow-hidden text-ellipsis whitespace-nowrap">
                              {getDocName(document?.bookName, fileSystem)}
                            </h2>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getDocName(document?.bookName, fileSystem)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Time spent - moved to right */}
                    <span className="text-[#9D9D9D] font-causten-semibold truncate col-span-2 flex items-center max-md:row-span-1 max-md:col-span-4 text-xs w-full justify-end">
                      {formatTime(document.totalTimeSpent)}
                    </span>

                    <span className="text-[#9D9D9D] md:hidden flex items-center text-xs tracking-wider max-md:row-span-1 max-md:col-span-9 font-causten-semibold w-full justify-start">
                      {formatLastAccessed(document.lastSeen).split(",")[0]}
                    </span>

                    <span className="text-[#9D9D9D] col-span-3 truncate flex items-center text-xs tracking-wider w-full max-md:hidden justify-start font-causten-semibold">
                      {formatLastAccessed(document.lastSeen).split(",")[0]}
                    </span>
                    
                    <span className="text-[#B77C26] font-causten-semibold col-span-3 flex items-center text-xs w-full justify-start max-md:row-span-1 max-md:col-span-5">
                      <span className="h-2 w-2 bg-[#B77C26] rounded-full mr-1"></span>
                      <span className="text-nowrap uppercase text-xs">
                        {document?.subject}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressList;
