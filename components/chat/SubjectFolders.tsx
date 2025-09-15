"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import FileSystem from "@/components/FileSystem/FileSystem";

import close from "@/public/assets/images/subjectclose.svg";
import { AlertCircle, MoreVertical } from "lucide-react";
import { getFileById } from "@/db/pdf/fileSystem";
import { useRouter, usePathname } from "next/navigation";

import SubjectDetailsSkeleton from "../skeletons/chat-folder-skeleton";
import { useSettings } from "@/context/store";
import { Button } from "../ui/button";
import { RiCloseFill } from "react-icons/ri";
import { useViewCombination } from "@/hooks/useViewCombination.ts";


export default function SubjectFolders({ isExpanded, setIsExpanded }) {
  const [currentPath, setCurrentPath] = useState("");
  const { isFileSystemLoaded, setOpenPmDialogBox } =
    useSettings();

  const path = usePathname().split("/")[1]



  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [filesIds, setFileIds] = useState([])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeModal = () => {
    setIsExpanded(false);
    setOpenPmDialogBox(false);
    console.log("clikcedto close");
  };

  useEffect(() => {
    console.log(isExpanded);
  }, [isExpanded]);



  return (
    <>
      {isExpanded && (
        <div className="rounded-lg w-full  relative">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm h-screen w-screen flex justify-center items-center  z-30" >
            <div className=" rounded-xl
                max-w-4xl relative flex flex-col justify-center items-start">
              <div className="relative w-full  ">
                {isFileSystemLoaded ?
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-0 z-20 rounded-full  hover:bg-white/20 text-white"
                    onClick={(e) => {
                      // e.stopPropagation();
                      closeModal();
                    }}
                  >
                    <RiCloseFill size={20} className="scale-150" />
                  </Button>

                  :
                  <>
                    <SubjectDetailsSkeleton />
                  </>
                }

              </div>



              <FileSystem
                currentPath={currentPath}
                setCurrentPath={setCurrentPath}
                fileType="pdf"
                isChatTrigger={true}
                isSubjectFolderView
                inModal // This prop signals FileSystem to fill modal space
              />

            </div>
          </div>
        </div>
      )}




    </>
  );
}



const FileList = ({ filesIds = [] }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  const { fileSystem, setViewCombination } = useSettings()
  const { updateViewCombination } =
    useViewCombination();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        console.log(filesIds)
        setLoading(true);
        // Check if filesIds exists and has items
        if (filesIds && filesIds.length > 0) {
          // Create an array to hold all file data
          const fileData = [];

          // Fetch each file by ID
          for (const fileId of filesIds) {
            const fileResult = await getFileById(fileSystem, fileId);
            console.log(fileResult, fileId)
            if (fileResult) {
              fileData.push(fileResult);
            }
          }

          setFiles(fileData);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [filesIds]); // Add filesIds as a dependency so it re-runs when the IDs change

  if (loading) {
    return (
      <div className="w-full max-w-md h-[300px] flex items-center justify-center">
        <p>Loading files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="w-full max-w-md  h-[300px] flex items-center justify-center">
        <p>No files available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] py-2 md:px-8 overflow-y-auto mb-6 no-scrollbar">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center justify-between px-4 py-3 hover:backdrop-brightness-95 cursor-pointer"
          onClick={() => { router.push(`/workspace/${file?.id}`); updateViewCombination("chat") }}
        >
          <div className="flex items-center gap-3">
            <div className="text-blue-500">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">{file?.name}</p>
              <p className="text-xs brightness-75">{file?.uploadTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {file?.status === "error" ? (
              <div className="flex items-center text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span className="font-medium">Error</span>
              </div>
            ) : (
              <span className="text-sm brightness-75 font-medium">
                {file?.size}
              </span>
            )}
            <button className="p-1 hover:bg-gray-200 rounded-full">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
