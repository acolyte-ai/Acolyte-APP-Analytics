// FileList.jsx
import { useState, useEffect } from "react";
import { MoreVertical, ChevronRight, ChevronDown } from "lucide-react";
import { Upload } from "lucide-react";
import { addPdf, getAllPdfs } from "@/db/pdf/pdfFiles";
import FileSystem from "@/components/FileSystem/FileSystem";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

import { pdfCache } from "@/components/pdf/utils/pdfCache";

import dragdrop from "@/public/dropfile.svg";
import Image from "next/image";
import notes from "@/public/notepad.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SUBJECT_LIST } from "@/components/pdf/lib/config";
import UploadFilePopUp from "./newUploadbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSettings } from "@/context/store";
import VibrantButtonUI from "../Exam/UI/buttonUI";
import { toast } from "sonner";
import { useViewCombination } from "@/hooks/useViewCombination.ts";
import axios from "axios";
import useUserId from "@/hooks/useUserId";
import { formatLastAccessed } from "@/lib/utils";


interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: "pdf" | "note";
  parentId: string | null;
  timestamp?: any;
}

interface FileListProps {
  selectedFolderId?: string;
  fileSystem?: any; // Define proper type based on your needs
}

const FileList = ({ selectedFolderId, fileSystem }: FileListProps) => {
  const [files, setFiles] = useState<FileSystemItem[]>([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // Fixed: lowercase 'i'
  const { updateViewCombination } = useViewCombination();
  const userId = useUserId();

  useEffect(() => {
    if (userId) {
      init();
    }
  }, [userId]);

  const init = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PDF_ANALYTICS_BASE_URL}/dev/v1/pdf/dashboard-data?userId=${userId}`
      );

      setFiles(response.data.data.recentPdfs ?? []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false); // Fixed: moved to finally block
    }
  };

  console.log("===!!!===>", files);

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-[191px] py-2 md:px-8 overflow-y-auto mb-6 no-scrollbar">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm font-causten-semibold">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[191px] py-2 md:px-8 overflow-y-auto mb-6 no-scrollbar">
      {files.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm font-causten-semibold">No files in this folder</p>
        </div>
      ) : (
        files.map((file, index) => (
          <div
            key={file.pdfId || index} // Fixed: use unique key
            className="flex items-center justify-between px-4 py-3 border-spacing-3 pb-5
             border-b-[1px] border-zinc-800 hover:backdrop-brightness-95 cursor-pointer"
            onClick={() => {
              updateViewCombination("pdf");
              router.push(`/workspace/${file?.pdfId}`);
            }}
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
                      {file?.bookName}
                    </p>
                    <p className="brightness-75 tracking-wide text-[#C2C2C2] xl:text-[14px] max-xl:text-[14px] font-causten-semibold">
                      {formatLastAccessed(file?.lastSeen)}
                    </p>
                  </div>

                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-full font-causten-semibold">{file?.bookName}</p>
                </TooltipContent>
              </Tooltip>


            </div>


            <div className="flex items-center gap-4 max-md:gap-1">
              <button className="text-[#A9A9A9] text-[14px] border-none border-2 border-zinc-500 px-4 p-1 max-md:px-2">
                {file?.fileSize || "220 MB"} {/* Made dynamic */}
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
            </div>
          </div>
        ))
      )}
    </div>
  );
};



// Expandable Dropdown Component


const FileUpload = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [files, setFiles] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState("");
  const [documentId, setDocumentId] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [file, setfile] = useState();
  const [openBox, setOpenBox] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { setViewCombination, fileSystem, setFileSystem, openUploadFiles, setOpenUploadFiles } = useSettings();

  const router = useRouter();
  const { updateViewCombination } =
    useViewCombination();



  useEffect(() => {
    if (!fileSystem) return;

    const createSlug = (name) => {
      return name.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, 'and');
    };

    // Initialize/check parent directories from SUBJECT_LIST
    const initializeSubjectDirectories = () => {
      console.log("Checking and initializing subject directories...");

      // Get existing root folders (parentId === null)
      const existingRootFolders = fileSystem.filter(item =>
        item.type === 'folder' && item.parentId === null
      );

      // Find missing subject directories
      const missingDirectories = [];
      const currentTimestamp = new Date().toISOString();

      SUBJECT_LIST.forEach(subject => {
        const folderId = `folder-${createSlug(subject)}`;

        // Check if this subject directory already exists
        const existingFolder = existingRootFolders.find(folder =>
          folder.id === folderId
        );

        if (!existingFolder) {
          // Create missing directory
          const newDirectory = {
            id: folderId,
            name: subject,
            type: 'folder',
            parentId: null,
            timestamp: currentTimestamp,
            createdAt: currentTimestamp
          };

          missingDirectories.push(newDirectory);
          console.log(`Creating missing directory: ${subject}`);
        } else {
          console.log(`Directory already exists: ${subject}`);
        }
      });

      // Add missing directories to file system
      if (missingDirectories.length > 0) {
        setFileSystem(prev => [...(prev || []), ...missingDirectories]);
        console.log(`Added ${missingDirectories.length} missing directories`);
      } else {
        console.log("All subject directories already exist");
      }
    };

    // Handle orphaned files
    const handleOrphanedFiles = () => {
      // Check for orphaned files (files without parent directories or with invalid parentIds)
      const orphanedFiles = fileSystem.filter(item =>
        item.type === 'file' &&
        (!item.parentId || !fileSystem.find(folder => folder.id === item.parentId))
      );

      if (orphanedFiles.length > 0) {
        console.log("Found orphaned files, handling 'Others' folder...");

        // Check if 'Others' folder already exists
        const othersFolder = fileSystem.find(item => item.id === 'others-folder');

        if (!othersFolder) {
          // Create 'Others' folder
          const newOthersFolder = {
            id: 'others-folder',
            name: 'Others',
            type: 'folder',
            parentId: null,
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };

          // Move orphaned files to 'Others' folder
          const updatedFileSystem = fileSystem.map(item => {
            if (orphanedFiles.includes(item)) {
              return { ...item, parentId: 'others-folder' };
            }
            return item;
          });

          // Add 'Others' folder to the file system
          setFileSystem([...updatedFileSystem, newOthersFolder]);
          console.log(`Created 'Others' folder and moved ${orphanedFiles.length} orphaned files`);
        } else {
          // Just update orphaned files to point to existing 'Others' folder
          const updatedFileSystem = fileSystem.map(item => {
            if (orphanedFiles.includes(item) && item.parentId !== 'others-folder') {
              return { ...item, parentId: 'others-folder' };
            }
            return item;
          });

          setFileSystem(updatedFileSystem);
          console.log(`Moved ${orphanedFiles.length} orphaned files to existing 'Others' folder`);
        }
      }
    };

    // Always check for missing subject directories first
    initializeSubjectDirectories();

    // Then handle orphaned files if any exist
    const hasFiles = fileSystem.some(item => item.type === 'file');
    if (hasFiles) {
      handleOrphanedFiles();
    }



  }, [fileSystem?.length]);


  useEffect(() => {
    fetchFilesFromIndexedDB();
  }, []);

  const fetchFilesFromIndexedDB = async () => {
    const pdfs = await getAllPdfs();
    setFiles(pdfs);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSaveFile = async (file, selectedFolder) => {
    try {
      console.log(`Saving file "${file.name}" to folder "${selectedFolder}"`);
      setUploadProgress(0);

      // Generate unique ID for the file
      const fileId = file.id || uuidv4();

      // Find or create the folder in the file system
      let folderId = `folder-${createSlug(selectedFolder)}`;
      let folder = fileSystem?.find(item => item.id === folderId);

      if (!folder) {
        // Create folder if it doesn't exist
        folder = {
          id: folderId,
          name: selectedFolder,
          type: 'folder',
          parentId: null,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };

        console.log("Creating new folder:", folder);
        setFileSystem(prev => [...(prev || []), folder]);
      }

      // Helper function to generate unique filename
      const generateUniqueFileName = (originalName, existingFiles) => {
        const fileExtension = originalName.substring(originalName.lastIndexOf('.'));
        const nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf('.'));

        let counter = 0;
        let newFileName = originalName;

        while (existingFiles.some(f => f.name.toLowerCase() === newFileName.toLowerCase())) {
          counter++;
          newFileName = `${nameWithoutExtension}(${counter})${fileExtension}`;
        }

        return newFileName;
      };

      // Get existing files in the target folder
      const existingFilesInFolder = fileSystem?.filter(item =>
        item.type === 'file' && item.parentId === folderId
      ) || [];

      // Generate unique filename if needed
      const uniqueFileName = generateUniqueFileName(file.name, existingFilesInFolder);

      if (uniqueFileName !== file.name) {
        console.log(`File name conflict detected. Renamed from "${file.name}" to "${uniqueFileName}"`);
      }

      // Process the actual file (convert to ArrayBuffer)
      console.log("Processing file...");
      const { arrayBuffer } = await readFileAsArrayBufferWithProgress(file.file);

      // Store in PDF cache
      console.log("Storing in cache...");
      await pdfCache.storePdf(fileId, arrayBuffer);

      // Create file entry for the file system
      const fileEntry = {
        id: fileId,
        name: uniqueFileName,
        type: 'file',
        fileType: 'pdf',
        parentId: folderId,
        size: file.size,
        timestamp: new Date().toISOString(),
        uploadTime: new Date().toLocaleString(),
        status: 'complete',
        inCache: true,
        cacheTimestamp: Date.now()
      };

      console.log("Adding file to file system:", fileEntry);
      setFileSystem(prev => [...(prev || []), fileEntry]);

      // Store in IndexedDB
      console.log("Storing in database...");
      await addPdf({
        documentId: fileId,
        name: uniqueFileName,
        size: file.size,
        uploadTime: new Date().toLocaleString(),
        status: "complete",
        inCache: true,
        cacheTimestamp: Date.now(),
        folderId: folderId,
        folderName: selectedFolder
      });

      console.log("File saved successfully!");
      toast.success("File " + uniqueFileName + " saved successfully!", {
        position: "bottom-right",
      });

      // Reset selected file and progress
      setSelectedFile(null);
      setUploadProgress(0);
      updateViewCombination("pdf")

      router.push(`/workspace/${fileId}`);

    } catch (error) {
      console.error("Error saving file:", error);
      setUploadProgress(0);
      throw error;
    }
  };

  const handleFileInput = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== selectedFiles.length) {
      alert("Only PDF files are allowed.");
      return;
    }

    if (pdfFiles.length > 0) {
      const file = pdfFiles[0];
      const fileWithMetadata = {
        id: uuidv4(),
        name: file.name,
        size: formatFileSize(file.size),
        file: file,
        uploadTime: "Just now",
        status: "pending"
      };

      setSelectedFile(fileWithMetadata);
      setOpenUploadFiles(true);
    }

    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== droppedFiles.length) {
      alert("Only PDF files are allowed.");
      return;
    }

    if (pdfFiles.length > 0) {
      const file = pdfFiles[0];
      const fileWithMetadata = {
        id: uuidv4(),
        name: file.name,
        size: formatFileSize(file.size),
        file: file,
        uploadTime: "Just now",
        status: "pending"
      };

      setSelectedFile(fileWithMetadata);
      setOpenUploadFiles(true);
    }
  };

  // Helper functions
  const createSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, 'and');
  };

  const formatFileSize = (size) => {
    if (size < 1024) return size + " bytes";
    if (size < 1048576) return (size / 1024).toFixed(2) + " KB";
    return (size / 1048576).toFixed(2) + " MB";
  };

  const readFileAsArrayBufferWithProgress = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      reader.onload = (event) => {
        setUploadProgress(100);
        resolve({
          arrayBuffer: event.target.result,
          size: file.size,
        });
      };

      reader.onerror = () => {
        console.error("Error reading file:", reader.error);
        reject(reader.error);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const clearUploads = () => {
    console.log("cleared!!!!!");
    setUploadingFiles([]);
  };

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      setOpenBox(false);
    }
  };

  useEffect(() => {
    if (!setOpenUploadFiles) {
      setUploadProgress(0);
    }
  }, [setOpenUploadFiles]);
  return (
    <div className="w-full font-causten-semibold" id="upload-pdf">
      {/* Folder Navigation Dropdown */}

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-[250px] grid-cols-2 dark:bg-[#181A1D] bg-[#F3F4F9] h-11 mb-[14px] dark:border-none border border-[#B8B8B8] shadow-md">
          <TabsTrigger
            value="upload"
            className="font-causten-semibold tracking-wide  max-xl:text-[18px] xl:text-[16px] w-full  dark:text-white
          dark:data-[state=active]:text-black data-[state=active]:text-white text-[#184C3D] dark:data-[state=active]:bg-[#36AF8D]
             data-[state=active]:border-[#36AF8D] data-[state=active]:bg-[#36AF8D] data-[state=active]:shadow-none"
          >
            New Upload
          </TabsTrigger>
          <TabsTrigger
            value="recent"
            className="text-[15px] font-causten-semibold tracking-wide max-xl:text-[18px] xl:text-[16px] w-full dark:text-white
           dark:data-[state=active]:text-black data-[state=active]:text-white text-[#184C3D] dark:data-[state=active]:bg-[#36AF8D]
             data-[state=active]:border-[#36AF8D] data-[state=active]:bg-[#36AF8D] data-[state=active]:shadow-none"
          >
            Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="w-full">
          <div className="w-full dark:bg-[#181A1D] bg-[#F3F4F9] dark:border-none border border-[#B8B8B8] shadow-md rounded-xl flex flex-col items-center justify-center px-[25px] py-[6px]">
            <div className="w-full p-[10px]">
              <input
                type="file"
                id="fileInput"
                multiple
                accept="application/pdf"
                className="hidden"
                onChange={handleFileInput}
              />

              <label
                htmlFor="fileInput"
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed w-full h-[104px] rounded-2xl p-16
                flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-[#6A6E73] dark:bg-[#181A1D] bg-[#F3F4F9]"
                  }`}
              >
                <Image src={dragdrop} alt={"dragdrop"} height={30} width={30} />
                <Upload
                  className={`w-6 h-6 mb-3 ${isDragging ? "text-emerald-500" : "text-gray-400"
                    }`}
                />
                <p className="text-sm text-center font-causten-semibold lg:text-md xl:text-lg">
                  <p className="text-[#6A6E73] tracking-normal font-causten-semibold text-[16px] leading-[21px]">
                    Drop your medical PDF's here{" "}
                  </p>
                  <p className="text-[#36AF8D] tracking-normal font-causten-semibold text-[16px] leading-[21px]">
                    or click to browse
                  </p>
                </p>
              </label>

              <div className="flex justify-end items-end gap-[10px] mt-[11px] mb-[5px]">
                <VibrantButtonUI
                  size={"sm"}
                  active={false}
                  disable={uploadingFiles.length === 0}
                  onClick={() => clearUploads()}
                  font={"font-causten-semibold text-xs dark:text-white text-black dark:border-none border border-[#B8B8B8] shadow-md"}
                >
                  <p className="text-[16px] font-causten-semibold">Clear Upload</p>
                </VibrantButtonUI>
                <VibrantButtonUI
                  size={"sm"}
                  active={true}
                  disable={uploadingFiles.length === 0}
                  font="font-causten-semibold text-xs dark:text-black text-white dark:border-none border border-[#B8B8B8] shadow-md"
                >
                  <p className="text-[16px] font-causten-semibold">Upload PDF</p>
                </VibrantButtonUI>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="w-full">
          <div className="w-full dark:bg-[#181A1D] bg-[#F3F4F9] rounded-xl flex flex-col items-center justify-center max-xl:px-[33px] max-xl:py-[23px]
          max-sm:py-[5px] max-sm:px-[22px] xl:py-5 xl:px-[21px]
          ">
            <FileList selectedFolderId={selectedFolderId} fileSystem={fileSystem} />
          </div>
        </TabsContent>
      </Tabs>

      {openBox && (
        <div
          className="fixed inset-0 w-full h-full backdrop-blur-sm flex justify-center items-center"
          style={{ zIndex: 100 }}
          onClick={handleOutsideClick}
        >
          <div className="rounded-xl p-4 flex flex-col">
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-center font-causten-semibold">{`Processing PDF: ${uploadProgress}%`}</p>
              </div>
            )}

            <FileSystem
              currentPath={currentPath}
              setCurrentPath={setCurrentPath}
              fileType="pdf"
              file={{
                documentId,
                fileName,
              }}
              saveFile={saveFile}
              modalClose={() => setOpenBox(false)}
            />
          </div>
        </div>
      )}

      <UploadFilePopUp
        selectedFile={selectedFile}
        onSaveFile={handleSaveFile}
      />
    </div>
  );
};

export default FileUpload;