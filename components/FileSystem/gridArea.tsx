import { Download, FileText, MoreVertical, Pencil, Trash, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { deletePdfFromCloud } from "@/lib/pdfUtils";
import { deleteUserNote } from "@/lib/noteUtils";
import { deleteAnnotations } from "@/lib/pdfAnnotaionsUtils";
import useUserId from "@/hooks/useUserId";
import { getAllPdfs, getPdfById } from "@/db/pdf/pdfFiles";
import { useRouter, usePathname } from "next/navigation";
import PlainNote from "@/public/assets/images/noteplain.svg";
import { useSettings } from "@/context/store";
import folderIcon from "@/public/foldersIcon/humanFolder.svg"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
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



interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: "pdf" | "note";
  parentId: string | null;
  timestamp?: any;
  isSynced: boolean;
  isTrained: boolean;
}

export default function GridArea({
  fileSystem,
  currentFolder,
  isChatTrigger,
  menuOpen,
  setMenuOpen,
  setCurrentFolder,
  updateFileSystem,
  setshouldFileSystemUplate,
  setCurrentPath,
  fileType,
  updateItemSyncTrainStatus,
}) {
  const userId = useUserId();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const router = useRouter();
  const { setViewCombination, setFlashCardGenerate, selectedFile, setSelectedFile, setOpenPmDialogBox, openUploadFiles, setFileSystem, setOpenUploadFiles } = useSettings();
  const flashCardPage = usePathname() === "flashcard"
  const flashcardPath = usePathname().split("/")[1]

  const generateUniqueName = useCallback(
    (baseName, type, extension = "") => {
      const nameExists = fileSystem.some(
        (item: any) =>
          item.parentId === currentFolder &&
          item.type === type &&
          item.name === (type === "file" ? `${baseName}${extension}` : baseName)
      );

      if (!nameExists) {
        return type === "file" ? `${baseName}${extension}` : baseName;
      }

      const regex = new RegExp(
        `${baseName} \\((\\d+)\\)${type === "file" ? extension : ""}`
      );
      let highestNum = 0;

      fileSystem.forEach((item: any) => {
        if (item.parentId === currentFolder && item.type === type) {
          const match = item.name.match(regex);
          if (match && parseInt(match[1]) > highestNum) {
            highestNum = parseInt(match[1]);
          }
        }
      });

      return type === "file"
        ? `${baseName} (${highestNum + 1})${extension}`
        : `${baseName} (${highestNum + 1})`;
    },
    [fileSystem, currentFolder]
  );

  const handleRename = useCallback(
    async (id: string, newName: string) => {
      if (newName.trim() === "") {
        setEditingItem(null);
        return;
      }

      const itemToRename = fileSystem?.find((item) => item.id === id);
      if (!itemToRename) {
        setEditingItem(null);
        return;
      }

      let baseName = newName.trim();
      let extension = "";

      if (itemToRename.type === "file") {
        extension = itemToRename.fileType === "pdf" ? ".pdf" : ".notes";
        if (baseName.endsWith(extension)) {
          baseName = baseName.substring(0, baseName.length - extension.length);
        }
      }

      const finalName = generateUniqueName(
        baseName,
        itemToRename.type,
        extension
      );

      const updatedFileSystem = fileSystem.map((item) => {
        if (item.id === id) {
          return { ...item, name: finalName };
        }
        return item;
      });

      updateFileSystem(updatedFileSystem);
      setshouldFileSystemUplate(true);
      setEditingItem(null);
      setMenuOpen(null);
    },
    [fileSystem, updateFileSystem, generateUniqueName]
  );

  console.log("doc::::", isChatTrigger, flashcardPath, flashCardPage)
  const handleItemClick = useCallback(

    async (item: FileSystemItem) => {
      if (item.type === "folder") {
        setCurrentFolder(item.id);
        setCurrentPath([item.name]);
      } else if (item.type === "file") {
        try {
          if (item.fileType === "pdf") {
            const doc = await getPdfById(item.id);
            if (doc) {


              switch (true) {
                case flashcardPath === "assesment":
                  setSelectedFile({ fileName: item.name, id: item.id, subject: item.parentId, fileType: item.fileType });
                  setOpenPmDialogBox(false);
                  break;

                case isChatTrigger:
                  setViewCombination("chat");
                  router.push(`/workspace/${item.id}`);
                  break;

                case flashcardPath === "flashcard":
                  setFlashCardGenerate(true);
                  setSelectedFile({ fileName: item.name, id: item.id, subject: item.parentId, fileType: item.fileType });
                  setOpenPmDialogBox(false);
                  break;

                default:
                  setViewCombination('pdf');
                  router.push(`/workspace/${item.id}`);
                  break;
              }
            }
          } else if (item.fileType === "note") {
            if (true) {
              setViewCombination("notes");
              router.push(`/workspace/${item.id}`);
            }
          }
        } catch (error) {
          console.error("Error fetching file:", error);
          alert("Failed to open the file.");
        }
      }
    },
    [setCurrentPath, router, isChatTrigger]
  );

  const getCurrentItems = useCallback(() => {
    if (!currentFolder) {
      return fileSystem?.filter((item) => item?.parentId === null);
    }
    return fileSystem.filter(
      (item: any) =>
        item.parentId === currentFolder &&
        (item.type === "file"
          ? fileType === "root" || item.fileType === fileType
          : true)
    );
  }, [fileSystem, currentFolder, fileType]);


  const getItemsInFolder = (folderId, fileSystemItems) => {
    const result = [fileSystemItems.find((item: any) => item.id === folderId)];
    const directChildren = fileSystemItems.filter(
      (item: any) => item.parentId === folderId
    );
    result.push(...directChildren);

    const childFolders = directChildren.filter(
      (item: any) => item.type === "folder"
    );
    for (const folder of childFolders) {
      const childItems = getItemsInFolder(folder.id, fileSystemItems);
      result.push(...childItems.filter((item) => item.id !== folder.id));
    }

    return result;
  };

  const handleDelete = useCallback(
    async (id: string) => {
      const itemToDelete = fileSystem.find((item) => item.id === id);

      if (!itemToDelete) return;

      if (itemToDelete.type === "folder") {
        const itemsToDelete = getItemsInFolder(id, fileSystem);

        for (const item of itemsToDelete) {
          console.log(item);
          if (item.type === "file") {
            if (item.fileType === "pdf") {
              await deletePdfFromCloud(userId, item.id);
              await deleteAnnotations(userId, item.id);
              await deleteUserNote(item.id, userId);
            } else if (item.fileType === "note") {
              await deleteUserNote(item.id, userId);
            }
          }
        }

        const idsToDelete = itemsToDelete.map((item) => item.id);
        const updatedFileSystem = fileSystem.filter(
          (item) => !idsToDelete.includes(item.id)
        );
        updateFileSystem(updatedFileSystem);
      } else {
        console.log(itemToDelete);
        if (itemToDelete.fileType === "pdf") {
          await deletePdfFromCloud(userId, id);
          await deleteAnnotations(userId, id);
          await deleteUserNote(id, userId);
        } else if (itemToDelete.fileType === "note") {
          await deleteUserNote(id, userId);
        }

        const updatedFileSystem = fileSystem.filter((item) => item.id !== id);
        updateFileSystem(updatedFileSystem);
      }

      setshouldFileSystemUplate(true);
      setMenuOpen(null);
    },
    [fileSystem, updateFileSystem, userId]
  );

  const handleToggleSyncStatus = useCallback(
    (id: string) => {
      if (!updateItemSyncTrainStatus) return;

      const item = fileSystem.find((item) => item.id === id);
      if (item) {
        updateItemSyncTrainStatus(id, !item.isSynced, item.isTrained);
        setMenuOpen(null);
      }
    },
    [fileSystem, updateItemSyncTrainStatus]
  );

  const handleToggleTrainedStatus = useCallback(
    (id: string) => {
      if (!updateItemSyncTrainStatus) return;

      const item = fileSystem.find((item) => item.id === id);
      if (item) {
        updateItemSyncTrainStatus(id, item.isSynced, !item.isTrained);
        setMenuOpen(null);
      }
    },
    [fileSystem, updateItemSyncTrainStatus]
  );

  const renderMenuDropdown = (itemId: string) => {
    if (menuOpen !== itemId) return null;

    const item = fileSystem.find((item) => item.id === itemId);

    return (
      <div
        data-menu-item="true"
        className="absolute right-0 top-0 bg-[#262626] dark:bg-[#262626] rounded-md py-1 z-50"
        onClick={(e) => e.stopPropagation()}
        style={{ minWidth: "120px" }}
      >
        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700
                hover:bg-[#DDD0FF] dark:hover:bg-purple-200 hover:text-black flex items-center rounded-lg"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditingItem(itemId);
            setMenuOpen(null);
          }}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Rename
        </button>
        {item?.type === "file" && updateItemSyncTrainStatus && (
          <>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700
                            hover:bg-[#DDD0FF] dark:hover:bg-purple-200 hover:text-black flex items-center rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleSyncStatus(itemId);
              }}
            >
              {item.isSynced ? "Mark as Not Synced" : "Mark as Synced"}
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700
                            hover:bg-[#DDD0FF] dark:hover:bg-purple-200 hover:text-black flex items-center rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleTrainedStatus(itemId);
              }}
            >
              {item.isTrained ? "Mark as Not Trained" : "Mark as Trained"}
            </button>
          </>
        )}
        <button
          className="w-full text-left px-4 py-2 text-sm text-red-600
              dark:text-red-400 hover:bg-[#DDD0FF] dark:hover:bg-purple-200 flex hover:text-black items-center rounded-lg "
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete(itemId);
          }}
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </button>
      </div>
    );
  };


  useEffect(() => {
    fetchFilesFromIndexedDB();
  }, []);

  const fetchFilesFromIndexedDB = async () => {
    const pdfs = await getAllPdfs();

  };



  const Nodata = () => {
    return (
      <div className="  font-[futureHeadline]  rounded-[7px]
           py-[26px] px-[20px]  dark:bg-[#181A1D]  bg-[#F3F4F9] h-3/4 w-full flex items-center justify-center">
        <div className="space-y-6 w-full text-center flex items-center justify-center flex-col ">
          <Image
            src={folderIcon}
            height={50}
            width={50}
            className="h-[45px] w-[54px] opacity-35"
            alt={"folder"}
          />
          <p className="font-normal text-lg text-white">
            You have to train your files to generate tests <br></br>
            Please train your files.
          </p>
        </div>

      </div>
    )
  }

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

  console.log("getCurrentItems===>", getCurrentItems())

  return (
    <div
      className={`transition-all duration-300 w-[496px] shadow-none border dark:border-none dark:shadow-[inset_0_0_8px_#2f2f2f]
        dark:bg-[#181A1D] bg-[#F3F4F9] px-[20px] py-[26px] rounded-[9px] h-[600px] `}
    >


      {true && (
        <>
          {flashcardPath !== "assesment" && (
            <div className={`transition-all duration-300 no-scrollbar w-full flex flex-col gap-[27px] items-start justify-start overflow-y-auto h-full`}>
              {getCurrentItems()?.map((item: any) => (
                <div
                  key={item.id}
                  className="relative flex flex-col items-start justify-start gap-[27px] cursor-pointer w-full rounded-lg transition-all duration-200"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="w-full">
                    <div className="grid grid-cols-12 h-[44px] grid-rows-2 max-lg:gap-x-2 gap-x-6 relative">
                      <div className={`h-full w-full items-center rounded-lg row-span-2 col-span-2
                       ${item.type === "folder" ? "p-2 dark:bg-[#1D2527] bg-[#AADACD]" : item.type === "file" ? item.fileType === "note" ? "p-2" : "p-2" : ""}`}>
                        <Image
                          src={item.type === "folder" ? folderIconFunction(item.id) : item.type === "file" ? item.fileType === "note" ? PlainNote : "/newIcons/pdf.svg" : ""}
                          alt="folder"
                          width={30}
                          height={30}
                          className="w-[53px] h-full hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-center w-full col-span-8 row-span-2 items-center justify-start flex">
                        {/* {editingItem === item.id ? (
                          <div className="w-full transition-all duration-300 ease-in-out">
                            <input
                              type="text"
                              defaultValue={item.name.replace(/\.(pdf|notes)$/, "")}
                              onBlur={(e) => handleRename(item.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleRename(item.id, e.currentTarget.value);
                                } else if (e.key === "Escape") {
                                  setEditingItem(null);
                                }
                              }}
                              autoFocus
                              className="text-[16px] text-center bg-transparent border-none outline-none
                shadow-none focus:ring-2 focus:ring-orange focus:outline-none
                focus-visible:ring-2 focus-visible:ring-orange
                focus-visible:outline-none h-[1rem] leading-none w-full
                text-gray-700 dark:text-white rounded-lg"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            />
                          </div>
                        ) : ( */}
                        <div className="w-full">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-between w-full">
                                  <h2 className="dark:text-white text-black text-[17px] w-full text-start font-medium truncate font-pt-sans">{item.name}</h2>
                                  {/* <span className="text-[#9D9D9D] flex items-end text-xs w-full justify-end">{item.daysAgo} days ago</span> */}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{item.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {/* )} */}
                      </div>

                      {item.type !== "folder" &&
                        <div className="col-span-1 row-span-2 w-full justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="p-1 transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(menuOpen === item.id ? null : item.id);
                            }}
                          >
                            <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </Button>
                          {renderMenuDropdown(item.id)}
                        </div>
                      }

                      {/* <span className="col-span-3 flex justify-start items-center">
                        <p className='dark:text-[#747474] text-white dark:bg-[#1D2527] bg-[#36AF8D] px-[7px] py-[1px] text-[10px] truncate rounded-md font-pt-sans font-medium'>{item?.subtitle || "Anatomy"}</p>
                      </span> */}
                    </div>
                  </div>

                  <Separator className=" bg-[#C7C7C7] dark:bg-[#1F2227] h-0.5" />


                </div>
              ))}

              {
                getCurrentItems()?.length === 0 && <Nodata />
              }
            </div>)}


          {flashcardPath === "assesment" && (
            <div className={`transition-all duration-300 no-scrollbar w-full flex flex-col gap-[27px] items-start justify-start overflow-y-auto h-full`}>
              {getCurrentItems()?.filter((item) => item.type === "folder" || item.isTrained).map((item: any) => (
                <div
                  key={item.id}
                  className="relative flex flex-col items-start justify-start gap-[27px] cursor-pointer w-full rounded-lg transition-all duration-200"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="w-full">
                    <div className="grid grid-cols-12 h-[44px] grid-rows-2 max-lg:gap-x-2 gap-x-6 relative">
                      <div className={`h-full w-full items-center rounded-lg row-span-2 col-span-2
                       ${item.type === "folder" ? "p-2 dark:bg-[#1D2527] bg-[#AADACD]" : item.type === "file" ? item.fileType === "note" ? "p-2" : "p-2" : ""}`}>
                        <Image
                          src={item.type === "folder" ? folderIconFunction(item.id) : item.type === "file" ? item.fileType === "note" ? PlainNote : "/newIcons/pdf.svg" : ""}
                          alt="folder"
                          width={30}
                          height={30}
                          className="w-[53px] h-full hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-center w-full col-span-8 row-span-2 items-center justify-start flex">
                        {editingItem === item.id ? (
                          <div className="w-full transition-all duration-300 ease-in-out">
                            <input
                              type="text"
                              defaultValue={item.name.replace(/\.(pdf|notes)$/, "")}
                              onBlur={(e) => handleRename(item.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleRename(item.id, e.currentTarget.value);
                                } else if (e.key === "Escape") {
                                  setEditingItem(null);
                                }
                              }}
                              autoFocus
                              className="text-[16px] text-center bg-transparent border-none outline-none
                shadow-none focus:ring-2 focus:ring-orange focus:outline-none
                focus-visible:ring-2 focus-visible:ring-orange
                focus-visible:outline-none h-[1rem] leading-none w-full
                text-gray-700 dark:text-white rounded-lg"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-between w-full">
                                    <h2 className="dark:text-white text-black text-[17px] w-full text-start font-medium truncate font-pt-sans">{item.name}</h2>
                                    {/* <span className="text-[#9D9D9D] flex items-end text-xs w-full justify-end">{item.daysAgo} days ago</span> */}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{item.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </div>

                      {item.type !== "folder" &&
                        <div className="col-span-1 row-span-2 w-full justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="p-1 transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(menuOpen === item.id ? null : item.id);
                            }}
                          >
                            <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </Button>
                          {renderMenuDropdown(item.id)}
                        </div>
                      }

                      {/* <span className="col-span-3 flex justify-start items-center">
                        <p className='dark:text-[#747474] text-white dark:bg-[#1D2527] bg-[#36AF8D] px-[7px] py-[1px] text-[10px] truncate rounded-md font-pt-sans font-medium'>{item?.subtitle || "Anatomy"}</p>
                      </span> */}
                    </div>
                  </div>

                  <Separator className=" bg-[#C7C7C7] dark:bg-[#1F2227] h-0.5" />


                </div>
              ))}

              {
                getCurrentItems()?.filter((item) => item.type === "folder" || item.isTrained).length === 0 && <Nodata />
              }
            </div>)}
        </>
      )}

      {/* Remove the separate dialogs since they're now integrated above */}
    </div>
  );
}

