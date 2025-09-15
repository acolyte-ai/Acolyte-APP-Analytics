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



// Helper function to create slug from subject name
const createSlug = (name) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, 'and');
};

// Helper function to remove existing A-H folders
const removeOldFolders = (fileSystem) => {
  const oldFolderIds = ['A', 'B', 'C', 'D', "others"];
  return fileSystem.filter(item => !oldFolderIds.includes(item.id));
};

interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: "pdf" | "note";
  parentId: string | null;
  timestamp?: any;
}

const FileList = ({ selectedFolderId, fileSystem }) => {
  const [files, setFiles] = useState<FileSystemItem[]>([]);
  const router = useRouter();
  const { setViewCombination, setRootFolder } = useSettings();
  const { currentViewCombination, activeFeatures, updateViewCombination } =
    useViewCombination();

  useEffect(() => {
    if (!fileSystem || !selectedFolderId) {
      setFiles([]);
      return;
    }

    // Get files from the selected folder
    const folderFiles = fileSystem
      .filter((item) => item.type === "file" && item.parentId === selectedFolderId && item.fileType === "pdf")
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map((file) => ({
        ...file,
        formattedTimestamp: new Date(file.timestamp).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      }));

    setFiles(folderFiles);
  }, [selectedFolderId, fileSystem]);

  return (
    <div className="w-full h-[191px] py-2 md:px-8 overflow-y-auto mb-6 no-scrollbar">
      {files.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">No files in this folder</p>
        </div>
      ) : (
        files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-4 py-3 border-spacing-3 pb-5
               border-b-[1px] border-zinc-800 hover:backdrop-brightness-95 cursor-pointer"
            onClick={() => {
              // setViewCombination("pdf");
              updateViewCombination("pdf")
              router.push(`/workspace/${file.id}`);
            }}
          >
            <div className="flex items-center gap-3">
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


                <Tooltip>
                  <TooltipTrigger asChild >   <p className="text-sm max-md:w-36 font-medium tracking-wider w-60 xl:w-96 truncate  text-[#C2C2C2]"></p>{file.name}</TooltipTrigger>
                  <TooltipContent>
                    <p className="w-full"> {file.name}</p>
                  </TooltipContent>
                </Tooltip>

                <p className="text-xs brightness-75 tracking-wide text-[#C2C2C2]">
                  {file.formattedTimestamp}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 max-md:gap-1">
              <button className="text-[#A9A9A9] text-[10px] border-2 border-zinc-500 px-4 p-1 max-md:px-2">
                220 MB
              </button>
              <button className="p-1 hover:bg-gray-200 rounded-full">
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
const ExpandableDropdown = ({ fileSystem, onFolderSelect, selectedFolderId }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { setRootFolder } = useSettings()

  // Get root level folders
  const rootFolders = fileSystem?.filter(item => item.type === "folder" && item.parentId === null) || [];

  // Get subfolders for a parent
  const getSubFolders = (parentId) => {
    return fileSystem?.filter(item => item.type === "folder" && item.parentId === parentId) || [];
  };

  // Get selected folder name for display
  const getSelectedFolderName = () => {
    if (!selectedFolderId || !fileSystem) return "Select a folder";
    const folder = fileSystem.find(item => item.id === selectedFolderId);
    return folder ? folder.name : "Select a folder";
  };

  // Toggle folder expansion
  const toggleExpansion = (folderId, event) => {
    event.stopPropagation(); // Prevent dropdown from closing
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Handle folder selection
  const handleFolderClick = (folderId, hasSubfolders, event) => {
    event.stopPropagation();

    if (hasSubfolders) {
      // For parent folders with subfolders, just expand/collapse
      toggleExpansion(folderId, event);
    } else {
      // For leaf folders (folders without subfolders), select them
      onFolderSelect(folderId);
      setIsDropdownOpen(false); // Close dropdown after selection
    }
  };

  // Handle subfolder selection
  const handleSubFolderClick = (folderId, event) => {
    event.stopPropagation();
    onFolderSelect(folderId);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="w-full max-w-md dropdown-container relative">
      {/* Dropdown Trigger */}
      <div
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-sm cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📁</span>
          <span className="text-sm font-medium dark:text-white">
            {getSelectedFolderName()}
          </span>
        </div>
        <div className="text-gray-400 transition-transform duration-200">
          {isDropdownOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </div>

      {/* Dropdown Content */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-lg z-50">
          <div className="max-h-64 overflow-y-auto">
            {rootFolders.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                No folders available
              </div>
            ) : (
              rootFolders.map(folder => {
                const subFolders = getSubFolders(folder.id);
                const hasSubfolders = subFolders.length > 0;
                const isExpanded = expandedFolders.has(folder.id);
                const isSelected = selectedFolderId === folder.id;

                return (
                  <div key={folder.id} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                    {/* Root folder */}
                    <div
                      className={`flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${isSelected && !hasSubfolders ? 'bg-blue-100 dark:bg-blue-900' : ''
                        }`}
                      onClick={(e) => {
                        handleFolderClick(folder.id, hasSubfolders, e)
                        setRootFolder(folder.name)

                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📁</span>
                        <span className="text-sm font-medium dark:text-white">
                          {folder.name}
                        </span>
                        {hasSubfolders && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({subFolders.length})
                          </span>
                        )}
                      </div>
                      {hasSubfolders && (
                        <div className="text-gray-400 transition-transform duration-200">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                      )}
                    </div>

                    {/* Subfolders (expanded) */}
                    {hasSubfolders && isExpanded && (
                      <div className="bg-gray-50 dark:bg-gray-900">
                        {subFolders.length === 0 ? (
                          <div className="p-3 pl-8 text-sm text-gray-500 dark:text-gray-400">
                            No subfolders
                          </div>
                        ) : (
                          subFolders.map((subFolder, index) => {
                            const isSubSelected = selectedFolderId === subFolder.id;
                            return (
                              <div
                                key={subFolder.id}
                                className={`flex items-center gap-2 p-3 pl-8 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${index !== subFolders.length - 1 ? 'border-b border-gray-200 dark:border-gray-600' : ''
                                  } ${isSubSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
                                  }`}
                                onClick={(e) => handleSubFolderClick(subFolder.id, e)}
                              >
                                <span className="text-sm">📂</span>
                                <span className="text-sm dark:text-gray-300">
                                  {subFolder.name}
                                </span>
                                {isSubSelected && (
                                  <span className="ml-auto text-xs text-blue-600 dark:text-blue-400">
                                    ✓
                                  </span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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

  // File system initialization effect
  useEffect(() => {
    if (!fileSystem) return;

    // Initialize parent directories from SUBJECT_LIST if fileSystem is empty
    if (fileSystem.length === 0) {
      console.log("Initializing file system with subject directories...");

      const subjectDirectories = SUBJECT_LIST.map(subject => ({
        id: `folder-${createSlug(subject)}`,
        name: subject,
        type: 'folder',
        parentId: null,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }));

      setFileSystem(subjectDirectories);
      return;
    }

    // Check for orphaned files (files without parent directories or with invalid parentIds)
    const orphanedFiles = fileSystem.filter(item =>
      item.type === 'file' &&
      (!item.parentId || !fileSystem.find(folder => folder.id === item.parentId))
    );

    if (orphanedFiles.length > 0) {
      console.log("Found orphaned files, creating 'Others' folder...");

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
      } else {
        // Just update orphaned files to point to existing 'Others' folder
        const updatedFileSystem = fileSystem.map(item => {
          if (orphanedFiles.includes(item)) {
            return { ...item, parentId: 'others-folder' };
          }
          return item;
        });

        setFileSystem(updatedFileSystem);
      }
    }
  }, [fileSystem, setFileSystem]);

  // Handle folder selection from dropdown
  const handleFolderSelect = (folderId) => {
    console.log("Selected folder:", folderId);
    setSelectedFolderId(folderId);
  };

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
      toast.success("File saved successfully!", {
        position: "bottom-right",
      });

      // Reset selected file and progress
      setSelectedFile(null);
      setUploadProgress(0);

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
    <div className="w-full font-rubik" id="upload-pdf">
      {/* Folder Navigation Dropdown */}

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-[250px] grid-cols-2 dark:bg-[#181A1D] bg-[#F3F4F9] h-11 mb-[14px] dark:border-none border border-[#B8B8B8] shadow-md">
          <TabsTrigger
            value="upload"
            className="font-[futureHeadlineBold]  text-base w-full text-[15px] dark:text-white
          dark:data-[state=active]:text-black data-[state=active]:text-white text-[#184C3D] dark:data-[state=active]:bg-[#36AF8D]
             data-[state=active]:border-[#36AF8D] data-[state=active]:font-bold data-[state=active]:bg-[#36AF8D] data-[state=active]:shadow-none"
          >
            New Upload
          </TabsTrigger>
          <TabsTrigger
            value="recent"
            className="text-[15px] font-[futureHeadlineBold]  text-base w-full dark:text-white
           dark:data-[state=active]:text-black data-[state=active]:text-white text-[#184C3D] dark:data-[state=active]:bg-[#36AF8D]
             data-[state=active]:border-[#36AF8D] data-[state=active]:font-bold data-[state=active]:bg-[#36AF8D] data-[state=active]:shadow-none"
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
                <p className="text-sm text-center font-bold lg:text-md xl:text-lg">
                  <p className="text-[#6A6E73] font-semibold text-[13px] font-[Inter] font-[600] leading-[21px]">
                    Drop your medical PDF's here{" "}
                  </p>
                  <p className="text-[#3ADE9E] font-semibold text-[13px] font-[Inter] leading-[21px]">
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
                  font={"font-[futureHeadlineBold] font-medium text-xs dark:text-white text-black dark:border-none border border-[#B8B8B8] shadow-md"}
                >
                  <p className="text-[13px]">Clear Upload</p>
                </VibrantButtonUI>
                <VibrantButtonUI
                  size={"sm"}
                  active={true}
                  disable={uploadingFiles.length === 0}
                  font="font-[futureHeadlineBold] font-medium text-xs dark:text-black text-white dark:border-none border border-[#B8B8B8] shadow-md"
                >
                  <p className="text-[13px]">Upload PDF</p>
                </VibrantButtonUI>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="w-full">
          <div className="w-full dark:bg-[#181A1D] bg-[#F3F4F9] rounded-xl flex flex-col items-center justify-center px-[22px] py-[5px]">
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
                <p className="text-sm text-center">{`Processing PDF: ${uploadProgress}%`}</p>
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