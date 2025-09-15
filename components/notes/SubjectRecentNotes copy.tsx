"use client";
import React, { useEffect, useState } from "react";
// import { Folder } from 'lucide-react';
import File from "@/public/assets/images/noteplain.svg";
import Filecreate from "@/public/assets/images/notecreate.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { getAllNoteIds } from "@/db/note/canvas";
import FileSystem from "@/components/FileSystem/FileSystem";
import { useSettings } from "@/context/store";
import { getFileById } from "@/db/pdf/fileSystem";
import { getAllPdfs } from "@/db/pdf/pdfFiles";
import { Button } from "../ui/button";
import { AlertCircle, MoreVertical } from "lucide-react";

const SubjectRecentNotes = () => {
  const router = useRouter();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [documentId, setDocumentId] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [file, setfile] = useState();
  const [files, setFiles] = useState([]);
  const { setcurrentDocument, setcurrentView, setfirst, fileSystem, setIsPDFEnabled, setViewCombination } = useSettings();

  const openNotes = async (id) => {
    const pdfs = await getAllPdfs();
    const pdfExists = pdfs.some((pdf) => pdf.documentId === id);

    setcurrentDocument({ id: id, title: id });
    setfirst(true);

    if (pdfExists) {
      setViewCombination("notes")
      router.push(`/workspace/${id}`);
    } else {
      setViewCombination("notes")
      router.push(`/workspace/${id}`);
    }
  };

  const createNote = async () => {
    setDocumentId(documentId);
    setIsOverlayOpen(false);

    try {
      setIsPDFEnabled(false)
      setViewCombination("notes")
      router.push(`/workspace/${documentId}`);
    } catch (error) {
      console.error("Error saving PDF:", error);
      alert("Failed to save the PDF. Please try again.");
    }
  };

  const fetchFilesFromIndexedDB = async () => {
    const ids = await getAllNoteIds();
    console.log(ids)
    console.log(fileSystem)


    const files = await Promise.all(
      ids.map(async (id) => await getFileById(fileSystem, id))
    );
    console.log(files)

    const validFiles = files.filter(Boolean); // Remove null values

    console.log(validFiles);
    setFiles(validFiles); // Update state with only valid files
  };


  useEffect(() => {
    fetchFilesFromIndexedDB();
  }, [fileSystem]);

  const createNotes = () => {
    const id = uuidv4();
    setIsOverlayOpen(true);
    setFileName("Note");
    setDocumentId(id);
    // router.push(`/note/${uuidv4()}`);
  };

  // Handle outside click to close the overlay
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOverlayOpen(false);
    }
  };

  return (
    <div className=" w-full">
      {/* <h2 className="text-2xl font-semibold text-green-700 mb-4">
        Recent Notes
      </h2> */}
      <div className="bg-[#ecf1f0] dark:bg-[#444444] rounded-xl w-full  h-[220px] overflow-y-auto no-scrollbar" id="notes-recent">
        {/* Create New */}

        {/* Folder Items */}
        {files.length > 0 ? (
          <div
            className="  px-4
           grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6 "
          >
            <div
              className="relative group flex flex-col items-center cursor-pointer flex-shrink-0"
              onClick={createNotes}
            >
              <div className="relative rounded-lg p-6 flex flex-col items-center">
                <Image
                  alt="folder"
                  src={Filecreate}
                  className="w-[102px] h-[128px]
                   sm:w-[120px] sm:h-[150px]
                   "
                />
                <div className="mt-2 text-center text-xs sm:text-sm md:text-md text-nowrap  font-medium rounded px-2 py-0.5">
                  Create New
                </div>
              </div>
            </div>
            {files.map((file, index) => (
              <div
                key={index}
                className="relative group flex flex-col items-center cursor-pointer flex-shrink-0"
                onClick={() => openNotes(file.id)}
              >
                <div className="relative rounded-lg p-6 flex flex-col items-center">
                  <Image
                    alt="folder"
                    src={File}
                    className="w-[102px] h-[128px]
                    sm:w-[120px] sm:h-[150px]

                     "
                  />
                  <div className="mt-2 text-center text-xs
                  sm:text-sm md:text-md font-medium rounded px-2 py-0.5">
                    {file?.name?.endsWith(".pdf")
                      ? file.name.slice(0, -4) + ".note"
                      : file?.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full flex items-center justify-center h-full">
            {currentPath.length === 0 && <div className="w-full h-full bg-[#f6f7f9] dark:bg-[#444444] rounded-xl flex flex-col items-center justify-center p-4 py-6">
              <div className="w-full p-10">
                <div
                  onClick={createNotes}
                  className="border-2 border-dashed w-full h-[190px] rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer transition-colors border-gray-300 bg-[#ecf1f0] dark:bg-[#444444] dark:border-gray-600"
                >
                  <p className="text-sm text-center font-bold lg:text-md xl:text-lg text-gray-400">
                    Create Notes
                  </p>
                </div>
              </div>
            </div>}
          </div>
        )}
      </div>

      <div className="w-full h-[191px] py-2 md:px-8 overflow-y-auto mb-6 no-scrollbar">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-4 py-3 border-spacing-3 pb-5
                   border-b-[1px] border-zinc-800  hover:backdrop-brightness-95 cursor-pointer"
            onClick={() => openNotes(file.id)}
          >
            <div className="flex items-center gap-3 ">
              <div className="text-blue-500">
                <Image
                  src={notes}
                  alt={"notes"}
                  className="w-5 2xl:w-7 h-fit object-contain"
                  priority={true}
                  height={50}
                  width={50}
                />
              </div>
              <div>
                <p className="text-sm max-md:w-36 font-medium tracking-wider truncate text-[#C2C2C2]">
                  {file.name.slice(0, -4) + ".note"}
                </p>
                <p className="text-xs brightness-75 tracking-wide text-[#C2C2C2]">
                  {file.timestamp}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 max-md:gap-1">
              <button
                className="text-[#A9A9A9] text-[10px]
                   border-2 border-zinc-500 px-4 p-1 max-md:px-2"
              >
                220 MB
              </button>
              {file.status === "error" ? (
                <div className="flex items-center text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="font-medium">Error</span>
                </div>
              ) : (
                <span className="text-sm brightness-75 font-medium">
                  {file.size}
                </span>
              )}
              <button className="p-1 hover:bg-gray-200 rounded-full">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isOverlayOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-[#464444a0] backdrop-blur-sm flex justify-center items-center"
          style={{ zIndex: 100 }}
          onClick={handleOutsideClick}
        >
          <div className="w-full max-w-4xl flex justify-center items-center rounded-xl p-4 bg-[#ecf1f0] dark:bg-[#444444]">
            <FileSystem
              currentPath={currentPath}
              setCurrentPath={setCurrentPath}
              file={{ documentId, fileName }} // Pass the documentId and fileName
              fileType="note"
              saveFile={createNote}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default SubjectRecentNotes;
