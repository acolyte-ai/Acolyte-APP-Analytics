"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { getAllNoteIds } from "@/db/note/canvas";
import FileSystem from "@/components/FileSystem/FileSystem";
import { useSettings } from "@/context/store";
import { getFileById } from "@/db/pdf/fileSystem";
import { getAllPdfs } from "@/db/pdf/pdfFiles";
import { AlertCircle, MoreVertical } from "lucide-react";
import notes from "@/public/notepad.svg";
import { ScrollArea } from "../ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { formatLastAccessed } from "@/lib/utils";


const SubjectRecentNotes = () => {
  const router = useRouter();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [documentId, setDocumentId] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [files, setFiles] = useState([]);
  const { setcurrentDocument, setfirst, fileSystem, setIsPDFEnabled, setViewCombination } = useSettings();

  const openNotes = async (id) => {
    const pdfs = await getAllPdfs();
    const pdfExists = pdfs.some((pdf) => pdf.documentId === id);

    setcurrentDocument({ id: id, title: id, parentId: "" });
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
    <div className="w-full h-[191px] py-2 md:px-8 overflow-y-auto mb-6 no-scrollbar">
      {files.length === 0 ? (
        <div className="flex items-center justify-center h-full ">
          <p className="text-gray-500 text-sm">No files in this folder</p>
        </div>
      ) : (
        files.map((file, index) => (
          <div
            key={file.id || index} // Fixed: use unique key
            className="flex items-center justify-between px-4 py-3 border-spacing-3 pb-5
               border-b-[1px] border-zinc-800 hover:backdrop-brightness-95 cursor-pointer"

            onClick={() => openNotes(file.id)}

          >
            <div className="flex items-center gap-4">
              <div className=" bg-[#1D2527] p-[6px] rounded">
                <Image
                  src={notes}
                  alt="notes"
                  className="w-7 h-full object-contain"
                  priority={true}
                  height={50}
                  width={50}
                />
              </div>

              <Tooltip>
                <TooltipTrigger asChild >
                  <div className="flex flex-col">
                    <p className="xl:text-[16px] max-xl:text-[16px] max-md:w-36 font-causten-semibold tracking-wider w-60 xl:w-full truncate text-[#C2C2C2]">
                      {file.name.slice(0, -4) + ".note"}
                    </p>
                    <p className=" brightness-75 tracking-wide text-[#C2C2C2] xl:text-[14px] max-xl:text-[14px]">
                      {formatLastAccessed(file?.timestamp)}
                    </p>
                  </div>

                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-full">{file.name.slice(0, -4) + ".note"} </p>
                </TooltipContent>
              </Tooltip>


            </div>


            {/* <div className="flex items-center gap-4 max-md:gap-1">
              <button className="text-[#A9A9A9] text-[14px] border-none border-2 border-zinc-500 px-4 p-1 max-md:px-2">
                {file?.size || "220 MB"} 
              </button>
              <button
                className="p-1 hover:bg-gray-200 rounded-full"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent onClick
                  // Add your menu logic here
                }}
              >
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div> */}
          </div>
        ))
      )}


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
