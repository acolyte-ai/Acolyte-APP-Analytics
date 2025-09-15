import React, { useState, useEffect, useCallback, memo } from "react";
import { ChevronDown, Pencil } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ViewToggle } from "@/components/ui/view-toggle";
import subjects from "@/public/assets/images/subjects.svg";
import { usePathname } from "next/navigation"
import PdfFile from "@/public/assets/images/pdf-file.svg";
import PlainNote from "@/public/assets/images/noteplain.svg";
import FileUpload from "./file-upload-test";
import CreateNote from "../notes/notes-create-test";
import useUserId from "@/hooks/useUserId";
import { useSettings } from "@/context/store";
import CourseProgress from "./folderList";
import { noOFDays } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useViewCombination } from "@/hooks/useViewCombination.ts";

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
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: "pdf" | "note";
  parentId: string | null;
  isSynced: boolean;
  isTrained: boolean;
}

interface FileGridSystemProps {
  fileType: "pdf" | "note";
  type?: string;
  viewMode?: "grid" | "list";
}

interface FileItemProps {
  file: FileSystemItem;
  fileType: "pdf" | "note";
  editingItem: string | null;
  menuOpen: string | null;
  onFileClick: (file: FileSystemItem) => void;
  onMenuToggle: (fileId: string) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (fileId: string) => void;
  setEditingItem: (item: string | null) => void;
}

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

// Memoized file component to prevent unnecessary re-renders
const FileItem = memo(
  ({
    file,
    fileType,
    editingItem,
    menuOpen,
    onFileClick,
    onMenuToggle,
    onRename,
    onDelete,
    setEditingItem,
  }: FileItemProps) => {
    const formatDate = () => {
      const date = new Date();
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "short" });
      const hour = date.getHours() % 12 || 12;
      const ampm = date.getHours() >= 12 ? "PM" : "AM";
      return `Edited: ${day} ${month}, ${hour} ${ampm}`;
    };

    const getFileIcon = (file: FileSystemItem) => {
      if (fileType === "pdf") {
        return file.fileType === "pdf" ? PdfFile : PlainNote;
      } else {
        return PlainNote;
      }
    };

    console.log("File==>", file);
    const renderMenuDropdown = () => {
      if (menuOpen !== file.id) return null;

      return (
        <div
          data-menu-item="true"
          className="absolute right-0 top-8 bg-white dark:bg-[#262626] rounded-md py-1 shadow-lg"
          onClick={(e) => e.stopPropagation()}
          style={{ minWidth: "120px" }}
        >
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[#DDD0FF] dark:hover:bg-purple-200 flex hover:text-black items-center rounded-lg font-causten-semibold"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditingItem(file.id);
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Rename
          </button>
        </div>
      );
    };

    return (
      <div
        className="cursor-pointer  relative  w-full grid grid-cols-12 gap-y-6"
        onClick={() => {
          onFileClick(file);
        }}
      >
        <div className="col-span-12  w-full ">
          <CourseProgress
            title={file.name}
            subtitle={"string"}
            // daysAgo={noOFDays(file.timestamp)}
            editItem={editingItem}
            changeEditItem={(val: null | string) => {
              setEditingItem(val);
            }}
            renameItem={onRename}
            openFile={() => onFileClick(file)}
            formatedDate={formatDate}
            parentId={file.parentId}
            id={file.id}
            type={file.type}
            fileType={fileType}
            progress={{
              completed: 50,
              total: 100,
            }}
          />
          <Separator className=" bg-[#BEBEBE] dark:bg-muted" />
        </div>
        {/* drop down option to delete And rename */}
        {/* <div
        className="col-span-1 justify-end flex items-start w-full "

      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-black/60"
          onClick={(e) => {
            e.stopPropagation();
            onMenuToggle(file.id);
          }}
        >
          <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Button>
        {renderMenuDropdown()}
      </div> */}

        {/* <div
        className="w-full shadow-sm rounded-lg overflow-hidden"
        onClick={() => onFileClick(file)}
      >
        <div className="relative">
          <div className="p-2 flex justify-center">
            <div className="flex items-center justify-center">
              <Image
                src={getFileIcon(file)}
                alt={file.name}
                className="w-[102px] h-[128px] sm:w-[120px] sm:h-[150px]"
                priority={true}
              />
            </div>
          </div>
        </div>
      </div> */}
      </div>
    );
  }
);

FileItem.displayName = "FileItem";

export default function FileGridSystem({ fileType, type, viewMode: externalViewMode }: FileGridSystemProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set<string>()); // Track expanded folders
  const [folders, setFolders] = useState<FileSystemItem[]>([]);
  const [files, setFiles] = useState<FileSystemItem[]>([]);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [backAction, setBackAction] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">(externalViewMode || "list");
  const router = useRouter();
  const paths = usePathname()

  // State for file system updates - reduced to one state variable
  const [shouldFileSystemUpdate, setShouldFileSystemUpdate] = useState(false);
  const userId = useUserId();
  const { fileSystem, setFileSystem, setViewCombination, setRootFolder } = useSettings();
  const { updateViewCombination } =
    useViewCombination();

  // Get subfolders for a parent
  const getSubFolders = useCallback((parentId: string) => {
    return fileSystem?.filter(item => item.type === "folder" && item.parentId === parentId) || [];
  }, [fileSystem]);

  // Get file count for a folder (including subfolders) with fileType filtering
  const getFileCountForFolder = useCallback((folderId: string): number => {
    if (!fileSystem) return 0;

    let count = 0;

    // Count direct files in this folder with proper fileType filtering
    const directFiles = fileSystem.filter(item => {
      if (item.type !== "file" || item.parentId !== folderId) return false;

      // Apply the same filtering logic as used in the main component
      if (fileType === "pdf") {
        return item.fileType === "pdf";
      } else {
        // For "note" type, include both pdf and note files
        return item.fileType === "pdf" || item.fileType === "note";
      }
    });
    count += directFiles.length;

    // Count files in subfolders recursively
    const subfolders = fileSystem.filter(
      item => item.type === "folder" && item.parentId === folderId
    );

    subfolders.forEach(subfolder => {
      count += getFileCountForFolder(subfolder.id);
    });

    return count;
  }, [fileSystem, fileType]);

  // Check if folder has any data (files or subfolders with files)
  const folderHasData = useCallback((folderId: string): boolean => {
    return getFileCountForFolder(folderId) > 0;
  }, [getFileCountForFolder]);

  // Toggle folder expansion
  const toggleExpansion = useCallback((folderId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  }, [expandedFolders]);

  // Handle folder click with expansion logic
  const handleFolderClick = useCallback((folderId: string, hasSubfolders: boolean, event: React.MouseEvent) => {
    event.stopPropagation();

    if (hasSubfolders) {
      // For parent folders with subfolders, just expand/collapse
      toggleExpansion(folderId, event);
    } else {
      // For leaf folders, select them
      setSelectedFolder(folderId);
      setDropdownOpen(false);
    }
  }, [toggleExpansion]);

  // Handle subfolder selection
  const handleSubFolderClick = useCallback((folderId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedFolder(folderId);
    setDropdownOpen(false);
  }, []);

  // NEW: Get selected folder name for display
  const getSelectedFolderName = useCallback(() => {
    if (!selectedFolder || !fileSystem) return "All Folders";
    const folder = fileSystem.find(item => item.id === selectedFolder);
    return folder ? folder.name : "All Folders";
  }, [selectedFolder, fileSystem]);

  // Memoized handlers to prevent recreating functions on each render
  const handleClickOutside = useCallback(
    (event) => {
      if (
        dropdownOpen &&
        event.target instanceof Node &&
        !document.getElementById("dropdown-menu")?.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    },
    [dropdownOpen]
  );

  const handleOutsideClick = useCallback((e) => {
    const menuElements = document.querySelectorAll("[data-menu-item]");
    let clickedInsideMenu = false;

    menuElements.forEach((element) => {
      if (element.contains(e.target)) {
        clickedInsideMenu = true;
      }
    });

    if (!clickedInsideMenu) {
      setMenuOpen(null);
    }
  }, []);

  const handleMenuToggle = useCallback((fileId) => {
    setMenuOpen((prev) => (prev === fileId ? null : fileId));
  }, []);

  // MODIFIED: Remove the old handleFolderSelect since we have new logic
  // const handleFolderSelect = useCallback((folderId) => {
  //   setSelectedFolder(folderId);
  //   setDropdownOpen(false);
  // }, []);

  // Clean up event listeners properly
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [handleOutsideClick]);

  // Debounced file system sync
  useEffect(() => {
    let syncTimeoutId;

    if (shouldFileSystemUpdate && userId && fileSystem?.length > 0) {
      syncTimeoutId = setTimeout(async () => {
        try {
          console.log("Syncing file system...");
          setShouldFileSystemUpdate(false);
        } catch (error) {
          console.error("Error syncing file system with database:", error);
          setShouldFileSystemUpdate(false);
        }
      }, 2000);
    }

    return () => {
      if (syncTimeoutId) clearTimeout(syncTimeoutId);
    };
  }, [fileSystem, shouldFileSystemUpdate, userId]);

  // Load folders only when fileSystem changes
  useEffect(() => {
    if (!fileSystem) return;

    const allRootFolders = fileSystem.filter(
      (item) => item.type === "folder" && item.parentId === null
    );

    // Filter folders that have data, but show all if no data is loaded yet
    const hasAnyData = fileSystem.some(item => item.type === "file");
    const rootFolders = hasAnyData
      ? allRootFolders.filter(folder => folderHasData(folder.id))
      : allRootFolders;

    console.log("Root Folders:", rootFolders)
    setFolders(rootFolders);

    // Set the first folder as selected by default if no folder is selected
    if (rootFolders.length > 0 && selectedFolder === null) {
      setSelectedFolder(rootFolders[0].id);
    }
  }, [fileSystem, selectedFolder, folderHasData]);

  // Load files only when necessary dependencies change
  useEffect(() => {
    if (!fileSystem) return;

    let filteredFiles = [];

    const filterFiles = () => {
      if (selectedFolder === null) {
        if (fileType === "pdf") {
          return fileSystem.filter(
            (item) =>
              item.type === "file" &&
              item.fileType === "pdf" &&
              item.parentId === null
          );
        } else {
          return fileSystem.filter(
            (item) =>
              item.type === "file" &&
              (item.fileType === "pdf" || item.fileType === "note") &&
              item.parentId === null
          );
        }
      } else {
        if (fileType === "pdf") {
          return fileSystem.filter(
            (item) =>
              item.type === "file" &&
              item.fileType === "pdf" &&
              item.parentId === selectedFolder
          );
        } else {
          return fileSystem.filter(
            (item) =>
              item.type === "file" &&
              (item.fileType === "pdf" || item.fileType === "note") &&
              item.parentId === selectedFolder
          );
        }
      }
    };

    const MAX_FILES = 100;
    filteredFiles = filterFiles().slice(0, MAX_FILES);
    setFiles(filteredFiles);
  }, [fileSystem, selectedFolder, fileType]);

  // ... (rest of your existing handlers remain the same)
  const handleFileClick = useCallback(
    async (file) => {
      try {
        if (type === "chat") {
          console.log("choosen file!")
        } else if (type === "PM") {
          console.log("choosend file in practice module", file.id)
        } else {
          if (file.fileType === "pdf") {
            if (fileType === "pdf") {
              // setViewCombination("pdf");
              updateViewCombination("pdf")
              router.push(`/workspace/${file.id}`);
            } else if (fileType === "note") {
              // setViewCombination("notes");
              updateViewCombination("notes")
              router.push(`/workspace/${file.id}`);
            }
          } else {
            // setViewCombination("pdf");
            updateViewCombination("pdf")
            router.push(`/workspace/${file.id}`);
          }
        }


      } catch (error) {
        console.error("Error fetching file:", error);
        alert("Failed to open the file.");
      }
    },
    [fileType, router]
  );

  const handleRename = useCallback(
    async (id, newName) => {
      if (newName.trim() === "") {
        setEditingItem(null);
        return;
      }

      const itemToRename = fileSystem?.find((item) => item.id === id);
      if (!itemToRename) {
        setEditingItem(null);
        return;
      }

      let finalName = newName.trim();

      if (itemToRename.type === "file") {
        let extension;
        if (fileType === "note") {
          extension = ".note";
        } else {
          extension = itemToRename.fileType === "pdf" ? ".pdf" : ".notes";
        }

        if (!finalName.endsWith(extension)) {
          finalName = `${finalName}${extension}`;
        }
      }

      const isDuplicate = fileSystem?.some(
        (item) =>
          item.id !== id &&
          item.parentId === itemToRename.parentId &&
          item.type === itemToRename.type &&
          item.name === finalName
      );

      if (isDuplicate) {
        if (itemToRename.type === "file") {
          const extension = itemToRename.fileType === "pdf" ? ".pdf" : ".notes";
          const baseName = finalName.replace(extension, "");
          const regex = new RegExp(`${baseName} \\((\\d+)\\)${extension}`);
          let highestNum = 0;

          fileSystem.forEach((item) => {
            if (
              item.parentId === itemToRename.parentId &&
              item.type === "file"
            ) {
              const match = item.name.match(regex);
              if (match && parseInt(match[1]) > highestNum) {
                highestNum = parseInt(match[1]);
              }
            }
          });

          finalName = `${baseName} (${highestNum + 1})${extension}`;
        } else {
          const regex = new RegExp(`${finalName} \\((\\d+)\\)`);
          let highestNum = 0;

          fileSystem.forEach((item) => {
            if (
              item.parentId === itemToRename.parentId &&
              item.type === "folder"
            ) {
              const match = item.name.match(regex);
              if (match && parseInt(match[1]) > highestNum) {
                highestNum = parseInt(match[1]);
              }
            }
          });

          finalName = `${finalName} (${highestNum + 1})`;
        }
      }

      setFileSystem((prevFileSystem) =>
        prevFileSystem.map((item) =>
          item.id === id ? { ...item, name: finalName } : item
        )
      );

      setShouldFileSystemUpdate(true);
      setEditingItem(null);
    },
    [fileSystem, fileType, setFileSystem]
  );

  const handleDeleteFile = useCallback(
    async (fileId) => {
      if (confirm("Are you sure you want to delete this file?")) {
        setFileSystem((prevFileSystem) =>
          prevFileSystem.filter((item) => item.id !== fileId)
        );
        setShouldFileSystemUpdate(true);
        setMenuOpen(null);
      }
    },
    [setFileSystem]
  );

  const filteredSubjects = subjectList.filter((item) =>
    item.title.toLowerCase()
  );

  return (
    <div className="w-full h-full" id="pdf-subject">
      {/* Header with Subject and Buttons */}
      <div className="flex w-full justify-end items-end mb-5">
        <div className="flex items-center gap-4">
          <h2 className="max-xl:text-[22px] text-[24px] font-causten-semibold tracking-wide text-start dark:text-white text-[#228367]">
            {type !== "PM" && "Library"}
          </h2>
        </div>
        <div className="flex gap-4 items-end justify-end w-full">
          {/* {type !== "PM" && <UploadFilePopUp />} */}

          {type !== "PM" && !backAction && (
            <ViewToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          )}

          <div className="relative inline-block">
            {/* <Button
              variant="outline"
              className="flex items-center gap-4 px-4 py-2 border rounded-lg tracking-wide bg-[#F2F2F2] dark:bg-[#181A1D] font-causten-semibold"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="flex items-center gap-2 text-sm">
                <Image
                  src={subjects}
                  className="h-5 w-5"
                  height={50}
                  width={50}
                  alt="Subject folder icon"
                />
                {getSelectedFolderName()}
                <ChevronDown className="h-5 w-5" />
              </div>
            </Button> */}

            <Button
              variant="outline"
              className={`flex items-center gap-4 px-4 py-2 border rounded-lg tracking-wide bg-[#F2F2F2] dark:bg-[#181A1D] font-causten-semibold ${backAction ? "" : "hidden"}`}
              // onClick={() => setDropdownOpen(!dropdownOpen)}
              onClick={() => setBackAction(false)}
            >
              back
            </Button>

            {/* MODIFIED: Enhanced Folder Dropdown with Expansion */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-1 w-56 border max-h-64 overflow-auto no-scrollbar  rounded-md shadow-lg bg-[#ecf1f0] dark:bg-[#181A1D]"
                id="dropdown-menu"
                style={{ zIndex: 100 }}
              >
                <ul className="py-1">
                  {folders.length === 0 ? (
                    <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 font-causten-semibold">
                      No folders available
                    </li>
                  ) : (
                    folders.map((folder) => {
                      const subFolders = getSubFolders(folder.id);
                      const hasSubfolders = subFolders.length > 0;
                      const isExpanded = expandedFolders.has(folder.id);
                      const isSelected = selectedFolder === folder.id;

                      return (
                        <React.Fragment key={folder.id}>
                          {/* Root folder */}
                          <li
                            className={`px-4 py-2 hover:bg-gray-100 capitalize dark:hover:bg-[#206652] cursor-pointer font-causten-semibold text-sm flex items-center justify-between ${isSelected && !hasSubfolders ? "bg-gray-100 dark:bg-[#206652]" : ""
                              }`}
                            onClick={(e) => {
                              handleFolderClick(folder.id, hasSubfolders, e)
                              setRootFolder(folder.name)
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span>{folder.name}</span>
                              {hasSubfolders && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({subFolders.length})
                                </span>
                              )}
                            </div>
                            {hasSubfolders && (
                              <ChevronDown
                                className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                                  }`}
                              />
                            )}
                          </li>

                          {/* Subfolders (expanded) */}
                          {hasSubfolders && isExpanded && (
                            <li className="bg-gray-50 dark:bg-[#363636]">
                              {subFolders.map((subFolder: FileSystemItem) => {
                                const isSubSelected = selectedFolder === subFolder.id;
                                return (
                                  <div
                                    key={subFolder.id}
                                    className={`pl-8 pr-4 py-2 hover:bg-gray-100 dark:hover:bg-[#303030] cursor-pointer font-causten-semibold text-sm flex items-center justify-between ${isSubSelected ? "bg-gray-100 dark:bg-[#303030]" : ""
                                      }`}
                                    onClick={(e) => handleSubFolderClick(subFolder.id, e)}
                                  >
                                    <span className="capitalize">{subFolder.name}</span>
                                    {isSubSelected && (
                                      <span className="text-xs text-blue-600 dark:text-blue-400">✓</span>
                                    )}
                                  </div>
                                );
                              })}
                            </li>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      {backAction ?
        <div
          className={`rounded-md ${paths.split("/")[2] === "notes" ? "h-[320px] max-lg:h-[375px]" : "h-[320px] "} px-7 py-3 xl:py-5 xl:px-[52px] w-full
         dark:bg-[#181A1D] bg-[#F3F4F9] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md`}
        >



          {files.length === 0 && (
            <div className="w-full flex items-center justify-center h-full">
              {fileType === "pdf" ? <FileUpload /> : <CreateNote />}
            </div>
          )}

          <div className="w-full h-full overflow-y-auto no-scrollbar">

            {files.length > 0 && (
              <div className="w-full">
                {files.map((file) => (
                  <FileItem
                    key={file.id}
                    file={file}
                    fileType={fileType}
                    editingItem={editingItem}
                    menuOpen={menuOpen}
                    onFileClick={handleFileClick}
                    onMenuToggle={handleMenuToggle}
                    onRename={handleRename}
                    onDelete={handleDeleteFile}
                    setEditingItem={setEditingItem}

                  />
                ))}
              </div>
            )}
          </div>


        </div> :

        <div
          className={`rounded-md ${paths.split("/")[2] === "notes" ? "h-[320px] max-lg:h-[375px]" : "h-[320px] "} px-7 py-3 xl:py-5 xl:px-[52px] w-full
         dark:bg-[#181A1D] bg-[#F3F4F9] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md ${viewMode === "grid" ? "overflow-hidden overflow-y-scroll no-scrollbar" : ""}`}
        >
          {viewMode === "list" ? (
            <div className="w-full h-full overflow-y-auto no-scrollbar">
              {filteredSubjects.map((subject, index) => (
                <div key={index} className="cursor-pointer relative w-full grid grid-cols-12 gap-y-4">
                  <div className="col-span-12 w-full">
                    <div
                      className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
                      onClick={(e) => {
                        handleFolderClick("folder" + "-" + subject.title.toLowerCase(), false, e)
                        setRootFolder(subject.title)
                        setBackAction(true)
                      }}
                    >
                      <div className="flex-shrink-0">
                        <div className="dark:bg-[#1D2527] bg-[#AADACD] rounded-lg w-full h-full flex items-center justify-center py-2 px-[20px] max-lg:p-2">
                          <Image
                            src={subject.img}
                            alt={subject.title}
                            className="w-10 h-10 max-sm:h-full object-contain "
                            priority={true}
                            height={20}
                            width={20}
                          />
                        </div>
                        {/* <div className="dark:bg-[#1D2527] bg-[#AADACD]  m-1 rounded-lg w-full  h-full flex items-center justify-center  py-[5px] px-[6px] max-lg:p-2">
                          <Image
                            src={folderIconFunction(createSlug("folder-" + document.subject))}
                            alt={document?.pdfId || ""}
                            className="w-10 h-10 max-sm:h-full object-contain "
                            priority={true}
                            height={30}
                            width={30}
                          />
                        </div> */}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-causten-semibold text-base text-gray-900 dark:text-white truncate">
                          {subject.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-causten-semibold">
                          {(() => {
                            // Try to find the folder by matching the subject title with folder names
                            const matchingFolder = fileSystem?.find((item: FileSystemItem) =>
                              item.type === "folder" &&
                              item.name?.toLowerCase() === subject.title.toLowerCase()
                            );

                            let folderId = matchingFolder?.id;

                            // Fallback to the constructed ID if no matching folder found
                            if (!folderId) {
                              folderId = "folder" + "-" + subject.title.toLowerCase();
                            }

                            const fileCount = getFileCountForFolder(folderId);
                            console.log(`Subject: ${subject.title}, FolderId: ${folderId}, FileCount: ${fileCount}`);

                            return fileCount > 0 ? `${fileCount} file${fileCount !== 1 ? 's' : ''}` : 'Subject folder';
                          })()}
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-[#BEBEBE] dark:bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gap-[31px] w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredSubjects.map((subject, index) => (
                <div key={index} className="space-y-2 text-center justify-center items-center flex flex-col col-span-1">
                  <button
                    className="w-full flex items-center justify-center transition-all hover:bg-gray-50 dark:hover:bg-[#262626]"
                    onClick={(e) => {
                      handleFolderClick("folder" + "-" + subject.title.toLowerCase(), false, e)
                      setRootFolder(subject.title)
                      setBackAction(true)
                    }}
                  >
                    <div className="dark:bg-[#1D2527] bg-[#AADACD] rounded-lg w-full h-full flex items-center justify-center py-2 px-[20px] max-lg:p-2">
                      <Image
                        src={subject.img}
                        alt={subject.title}
                        className="w-10 h-10 object-contain"
                        priority={true}
                        height={20}
                        width={20}
                      />
                    </div>
                  </button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="font-causten-semibold text-[14px] max-w-[60px] text-center truncate text-black dark:text-white">
                        {subject.title}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-causten-semibold text-[16px]">{subject.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          )}


        </div>




      }



    </div>
  );
}
