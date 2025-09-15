import { Download, FileText, MoreVertical, Pencil, Trash, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { deletePdfFromCloud } from "@/lib/pdfUtils";
import { deleteUserNote } from "@/lib/noteUtils";
import { deleteAnnotations } from "@/lib/pdfAnnotaionsUtils";
import useUserId from "@/hooks/useUserId";
import { addPdf, getAllPdfs, getPdfById } from "@/db/pdf/pdfFiles";
import { useRouter, usePathname } from "next/navigation";
import PlainNote from "@/public/assets/images/noteplain.svg";
import { useSettings } from "@/context/store";
import folderIcon from "@/public/foldersIcon/humanFolder.svg"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { v4 as uuidv4 } from 'uuid';
import UploadFilePopUp from "@/components/FileSystem/newUploadbox";
import { pdfCache } from "@/components/pdf/utils/pdfCache";
import { toast } from "react-toastify";



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
  const existingPage = usePathname().split("/").includes("workspace");
  const existingSubPage = usePathname().split("/").includes("chat");
  const flashCardPage = usePathname() === "flashcard"
  const [file, setfile] = useState();
  const flashcardPath = usePathname().split("/")[1]
  const [showFilesList, setFilesList] = useState<boolean>(false)

  // NEW: Flashcard upload dialog states
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const [selectedFolderForUpload, setSelectedFolderForUpload] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [expandedFoldersInDialog, setExpandedFoldersInDialog] = useState(new Set());

  // NEW: Helper function to check if current folder is a subfolder (can upload files)



  // NEW: Helper function to check if current folder is a root folder (Others, A, B, C, etc.)
  const isInRootFolder = useCallback(() => {
    if (!currentFolder || !fileSystem) return false;

    // Find the current folder in the file system
    const folder = fileSystem.find(item => item.id === currentFolder);

    // If folder exists and parentId is null, it's a root folder
    return folder && folder.parentId === null;
  }, [currentFolder, fileSystem]);

  // NEW: Helper function to check if we can create folders (in root folders like Others, A, B, C)

  // NEW: Get root folders for folder selection dialog
  const getRootFolders = useCallback(() => {
    if (!fileSystem) return [];
    return fileSystem.filter(item => item.type === "folder" && item.parentId === null);
  }, [fileSystem]);

  // NEW: Get subfolders of a specific parent
  const getSubFoldersOf = useCallback((parentId) => {
    if (!fileSystem) return [];
    return fileSystem.filter(item => item.type === "folder" && item.parentId === parentId);
  }, [fileSystem]);

  // NEW: Handle folder selection for upload
  const handleFolderSelectionForUpload = (folderId) => {
    setSelectedFolderForUpload(folderId);
    setShowFolderSelector(false);
    setShowConfirmDialog(true);
  };

  // NEW: Confirm file upload to selected folder
  const confirmFileUpload = async () => {
    if (!selectedUploadFile || !selectedFolderForUpload) return;

    const fileToAdd = {
      id: uuidv4(),
      name: selectedUploadFile.name,
      type: "file",
      fileType: "pdf",
      isSynced: false,
      isTrained: false,
      isStartedTraining: false,
      parentId: selectedFolderForUpload,
      timeStamp: new Date(),
      userId: userId
    };

    const updatedFileSystem = [...fileSystem, fileToAdd];
    updateFileSystem(updatedFileSystem);
    setshouldFileSystemUplate(true);

    // Reset states
    setSelectedUploadFile(null);
    setSelectedFolderForUpload(null);
    setShowConfirmDialog(false);

    // alert("File uploaded successfully!");
  };

  // NEW: Cancel upload process
  const cancelUpload = () => {
    setSelectedUploadFile(null);
    setSelectedFolderForUpload(null);
    setShowFolderSelector(false);
    setShowConfirmDialog(false);
  };

  // NEW: Get folder name by ID
  const getFolderNameById = useCallback((folderId) => {
    const folder = fileSystem?.find(item => item.id === folderId);
    return folder ? folder.name : "Unknown Folder";
  }, [fileSystem]);

  // NEW: Toggle folder expansion in dialog
  const toggleFolderExpansionInDialog = (folderId) => {
    const newExpanded = new Set(expandedFoldersInDialog);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFoldersInDialog(newExpanded);
  };

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
              console.log("doc::::", item)

              if (flashcardPath === "assesment") {
                setSelectedFile({ fileName: item.name, id: item.id })
                setOpenPmDialogBox(false)
              }
              else {
                const path = !isChatTrigger
                  ? `/workspace/${item.id}`
                  : `/workspace/${item.id}`;

                if (isChatTrigger) {
                  if (existingPage && existingSubPage) {
                    setViewCombination("chat");
                    router.push(path);
                  } else {
                    setViewCombination("chat");
                    router.push(path);
                  }
                } else {
                  if (flashCardPage) {
                    setFlashCardGenerate(true)
                  } else {
                    setViewCombination('pdf')
                    router.push(path);
                  }
                }
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


  const handleFileInput = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedFiles = Array.from(e.target.files);

    // Check if files are valid PDFs
    const pdfFiles = selectedFiles.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== selectedFiles.length) {
      alert("Only PDF files are allowed.");
      return;
    }

    if (pdfFiles.length > 0) {
      // For now, handle single file. You can extend this for multiple files
      const file = pdfFiles[0];
      const fileWithMetadata = {
        id: uuidv4(),
        name: file.name,
        size: formatFileSize(file.size),
        file: file, // Store the actual File object
        uploadTime: "Just now",
        status: "pending"
      };

      setSelectedFile(fileWithMetadata);
      setOpenUploadFiles(true);
    }

    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };






  const readFileAsArrayBufferWithProgress = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
        }
      };

      reader.onload = (event) => {

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

  const formatFileSize = (size) => {
    return size < 1024
      ? size + " bytes"
      : size < 1048576
        ? (size / 1024).toFixed(2) + " KB"
        : (size / 1048576).toFixed(2) + " MB";
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

  const createSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, 'and');
  };


  // const handleSaveFile = async (file, selectedFolder) => {
  //   try {
  //     console.log(`Saving file "${file.name}" to folder "${selectedFolder}"`);


  //     // Generate unique ID for the file
  //     const fileId = file.id || uuidv4();

  //     // Find or create the folder in the file system
  //     let folderId = `folder-${createSlug(selectedFolder)}`;
  //     let folder = fileSystem?.find(item => item.id === folderId);

  //     if (!folder) {
  //       // Create folder if it doesn't exist
  //       folder = {
  //         id: folderId,
  //         name: selectedFolder,
  //         type: 'folder',
  //         parentId: null,
  //         timestamp: new Date().toISOString(),
  //         createdAt: new Date().toISOString()
  //       };

  //       console.log("Creating new folder:", folder);

  //       // Add folder to file system
  //       setFileSystem(prev => [...(prev || []), folder]);
  //     }

  //     // Process the actual file (convert to ArrayBuffer)
  //     console.log("Processing file...");
  //     const { arrayBuffer } = await readFileAsArrayBufferWithProgress(file.file);

  //     // Store in PDF cache
  //     console.log("Storing in cache...");
  //     await pdfCache.storePdf(fileId, arrayBuffer);

  //     // Create file entry for the file system
  //     const fileEntry = {
  //       id: fileId,
  //       name: file.name,
  //       type: 'file',
  //       fileType: 'pdf',
  //       parentId: folderId, // Store in the selected folder
  //       size: file.size,
  //       timestamp: new Date().toISOString(),
  //       uploadTime: new Date().toLocaleString(),
  //       status: 'complete',
  //       inCache: true,
  //       cacheTimestamp: Date.now()
  //     };

  //     console.log("Adding file to file system:", fileEntry);

  //     // Add file to file system
  //     setFileSystem(prev => [...(prev || []), fileEntry]);

  //     // Store in IndexedDB
  //     console.log("Storing in database...");
  //     await addPdf({
  //       documentId: fileId,
  //       name: file.name,
  //       size: file.size,
  //       uploadTime: new Date().toLocaleString(),
  //       status: "complete",
  //       inCache: true,
  //       cacheTimestamp: Date.now(),
  //       folderId: folderId,
  //       folderName: selectedFolder
  //     });

  //     console.log("File saved successfully!");

  //     // Reset selected file and progress
  //     setSelectedFile(null);


  //     // Navigate to the PDF viewer
  //     // setViewCombination("pdf");
  //     // router.push(`/workspace/${fileId}`);

  //   } catch (error) {
  //     console.error("Error saving file:", error);

  //     throw error; // Re-throw so the dialog can handle the error
  //   }
  // };


  const handleSaveFile = async (file, selectedFolder) => {
    try {
      console.log(`Saving file "${file.name}" to folder "${selectedFolder}"`);
      // setUploadProgress(0);

      // Generate unique ID for the file
      const fileId = file.id || uuidv4();

      // Find or create the folder in the file system
      let folderId = `folder-${createSlug(selectedFolder)}`;
      let folder = fileSystem?.find(item => item.id === folderId);

      console.log("foldername:::", folder, folderId)

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

        // Add folder to file system
        setFileSystem(prev => [...(prev || []), folder]);
      }

      // Helper function to generate unique filename
      const generateUniqueFileName = (originalName, existingFiles) => {
        const fileExtension = originalName.substring(originalName.lastIndexOf('.'));
        const nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf('.'));

        let counter = 0;
        let newFileName = originalName;

        // Check if file with this name already exists in the folder
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
        name: uniqueFileName, // Use the unique filename
        type: 'file',
        fileType: 'pdf',
        parentId: folderId, // Store in the selected folder
        size: file.size,
        timestamp: new Date().toISOString(),
        uploadTime: new Date().toLocaleString(),
        status: 'complete',
        inCache: true,
        cacheTimestamp: Date.now()
      };

      console.log("Adding file to file system:", fileEntry);

      // Add file to file system
      setFileSystem(prev => [...(prev || []), fileEntry]);

      // Store in IndexedDB
      console.log("Storing in database...");
      await addPdf({
        documentId: fileId,
        name: uniqueFileName, // Use the unique filename
        size: file.size,
        uploadTime: new Date().toLocaleString(),
        status: "complete",
        inCache: true,
        cacheTimestamp: Date.now(),
        folderId: folderId,
        folderName: selectedFolder
      });

      console.log("File saved successfully!");
      toast.success("File saved successfully!")

      // Reset selected file and progress
      setSelectedFile(null);
      // setUploadProgress(0);

      // Navigate to the PDF viewer
      // setViewCombination("pdf");
      // router.push(`/workspace/${fileId}`);

    } catch (error) {
      console.error("Error saving file:", error);
      // setUploadProgress(0);
      throw error; // Re-throw so the dialog can handle the error
    }
  };

  return (
    <div
      className={`transition-all duration-300 w-[496px] shadow-[inset_0_0_8px_#EFEFEF40]
        dark:bg-[#181A1D] bg-[#F3F4F9] px-[20px] py-[26px] rounded-[9px] max-h-[600px] `}
    >


      {true && (
        <>
          {flashcardPath !== "assesment" && !openUploadFiles && !showFilesList && !showFolderSelector && !showConfirmDialog && (
            <div>
              <div className="flex gap-4 font-pt-sans items-center justify-center py-[26px] px-[42px]">
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 h-20 transition-colors font-medium rounded-[7.684px] bg-gradient-to-b from-emerald-500 to-emerald-600 backdrop-blur-sm">
                  <input
                    type="file"
                    id="fileInputFlashcard"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileInput}
                  />

                  <label
                    htmlFor="fileInputFlashcard"
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Download className="h-7 w-7 flex-shrink-0 text-black" />
                    <div className="text-left text-black text-[18px]">
                      <div className="font-semibold">Upload New Pdf</div>
                      <div className="text-sm opacity-90"></div>
                    </div>
                  </label>
                </button>

                <button
                  className="bg-emerald-500 hover:bg-emerald-600 rounded-[7.684px] bg-gradient-to-b from-emerald-500 to-emerald-600 backdrop-blur-sm text-white p-4 h-20 flex items-center gap-3 transition-colors font-medium"
                  onClick={() => { setFilesList(true) }}
                >
                  <FileText className="h-7 w-7 flex-shrink-0 text-black" />
                  <div className="text-left text-black text-[18px]">
                    <div className="font-semibold">Use Existing Pdf</div>
                    <div className="text-sm opacity-90"></div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {(showFolderSelector) && (
            <div className="w-full h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold dark:text-white">Select Folder</h3>
                <button
                  onClick={cancelUpload}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Choose a subfolder to upload "<strong>{selectedUploadFile?.name}</strong>"
              </p>

              <div className="flex-1 overflow-y-auto no-scrollbar w-full flex flex-col gap-[27px] items-start justify-start">
                {getRootFolders().map(rootFolder => {
                  const subFolders = getSubFoldersOf(rootFolder.id);
                  const isExpanded = expandedFoldersInDialog.has(rootFolder.id);

                  return (
                    <div key={rootFolder.id} className="w-full">
                      {/* Root Folder */}
                      <div
                        className="relative flex flex-col items-start justify-start cursor-pointer w-full rounded-lg transition-all duration-200"
                        onClick={() => toggleFolderExpansionInDialog(rootFolder.id)}
                      >
                        <div className="w-full  pb-3">
                          <div className="grid grid-cols-12 h-[44px] grid-rows-2 max-lg:gap-x-2 gap-x-6 relative">
                            <div className="h-full w-full items-center rounded-lg row-span-2 col-span-2 p-2 dark:bg-[#1D2527] bg-[#AADACD]">
                              <Image
                                src={folderIcon}
                                alt="folder"
                                className="w-[53px] h-full hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="text-center w-full col-span-8 items-center justify-start flex">
                              <div className="w-full">
                                <div className="flex items-center justify-between w-full">
                                  <h2 className="dark:text-white text-black text-[17px] w-full text-start font-medium truncate font-pt-sans">
                                    {rootFolder.name}
                                  </h2>
                                  <span className="text-[#9D9D9D] flex items-end text-xs w-full justify-end">
                                    {subFolders.length} folders
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="col-span-1 w-full justify-end flex items-center">
                              <span className="text-gray-400">
                                {isExpanded ? '−' : '+'}
                              </span>
                            </div>

                            <span className="col-span-3 flex justify-start items-center">
                              <p className='dark:text-[#747474] text-white dark:bg-[#1D2527] bg-[#36AF8D] px-[7px] py-[1px] text-[10px] truncate rounded-md font-pt-sans font-medium'>
                                Root Folder
                              </p>
                            </span>
                          </div>
                        </div>
                        <Separator className="border-[#1F2227] bg-[#1F2227] dark:bg-[#1F2227] h-0.5" />
                      </div>

                      {/* Subfolders */}
                      {isExpanded && (
                        <div className="ml-4 mt-4 space-y-[27px]">
                          {subFolders.map(subFolder => (
                            <div
                              key={subFolder.id}
                              className="relative flex flex-col items-start justify-start cursor-pointer w-full rounded-lg transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFolderSelectionForUpload(subFolder.id);
                              }}
                            >
                              <div className="w-full  pb-3">
                                <div className="grid grid-cols-12 h-[44px] grid-rows-2 max-lg:gap-x-2 gap-x-6 relative">
                                  <div className="h-full w-full items-center rounded-lg row-span-2 col-span-2 p-2 dark:bg-[#1D2527] bg-[#AADACD]">
                                    <Image
                                      src={folderIcon}
                                      alt="folder"
                                      className="w-[53px] h-full hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                  <div className="text-center w-full col-span-8 items-center justify-start flex">
                                    <div className="w-full">
                                      <div className="flex items-center justify-between w-full">
                                        <h2 className="dark:text-white text-black text-[17px] w-full text-start font-medium truncate font-pt-sans">
                                          {subFolder.name}
                                        </h2>
                                        <span className="text-emerald-600 dark:text-emerald-400 flex items-end text-xs w-full justify-end">
                                          Click to select
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-span-1 w-full justify-end flex items-center">
                                    <span className="text-emerald-600 dark:text-emerald-400">
                                      →
                                    </span>
                                  </div>

                                  <span className="col-span-3 flex justify-start items-center">
                                    <p className='dark:text-[#747474] text-white dark:bg-emerald-800 bg-emerald-500 px-[7px] py-[1px] text-[10px] truncate rounded-md font-pt-sans font-medium'>
                                      Subfolder
                                    </p>
                                  </span>
                                </div>
                              </div>
                              <Separator className="border-[#1F2227] bg-[#1F2227] dark:bg-[#1F2227] h-0.5" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={cancelUpload}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}


          {/* Confirmation Screen */}
          {showConfirmDialog && (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <div className="text-center space-y-6 max-w-md">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">Confirm Upload</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload "<strong className="text-gray-800 dark:text-gray-200">{selectedUploadFile?.name}</strong>" to folder "<strong className="text-emerald-600 dark:text-emerald-400">{getFolderNameById(selectedFolderForUpload)}</strong>"?
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={cancelUpload}
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
                  >
                    No, Cancel
                  </button>
                  <button
                    onClick={confirmFileUpload}
                    className="px-6 py-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg transition-colors font-medium"
                  >
                    Yes, Upload
                  </button>
                </div>
              </div>
            </div>
          )}

          <UploadFilePopUp
            selectedFile={selectedFile}
            onSaveFile={handleSaveFile}
          />


          {showFilesList && !showFolderSelector && !showConfirmDialog && (
            <div className={`transition-all duration-300 no-scrollbar w-full flex flex-col gap-[27px] items-start justify-start overflow-y-auto h-[600px]`}>
              {getCurrentItems()?.map((item: any) => (
                <div
                  key={item.id}
                  className="relative flex flex-col items-start justify-start gap-[27px] cursor-pointer w-full rounded-lg transition-all duration-200 "
                  onClick={() => handleItemClick(item)}
                >
                  <div className="w-full">
                    <div className="grid grid-cols-12 h-[44px] grid-rows-2 max-lg:gap-x-2 gap-x-6 relative">
                      <div className={`h-full w-full items-center rounded-lg row-span-2 col-span-2
                       ${item.type === "folder" ? "p-2 dark:bg-[#1D2527] bg-[#AADACD]" : item.type === "file" ? item.fileType === "note" ? "p-2" : "p-2" : ""}`}>
                        <Image
                          src={item.type === "folder" ? folderIcon : item.type === "file" ? item.fileType === "note" ? PlainNote : "/newIcons/pdf.svg" : ""}
                          alt="folder"
                          width={30}
                          height={30}
                          className="w-[53px] h-full hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-center w-full col-span-8 items-center justify-start flex">
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
                                    <span className="text-[#9D9D9D] flex items-end text-xs w-full justify-end">{item.daysAgo} days ago</span>
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

                      <div className="col-span-1 w-full justify-end">
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

                      <span className="col-span-3 flex justify-start items-center">
                        <p className='dark:text-[#747474] text-white dark:bg-[#1D2527] bg-[#36AF8D] px-[7px] py-[1px] text-[10px] truncate rounded-md font-pt-sans font-medium'>{item?.subtitle || "Anatomy"}</p>
                      </span>
                    </div>
                  </div>

                  <Separator className="border-[#1F2227] bg-[#1F2227] dark:bg-[#1F2227] h-0.5" />
                </div>
              ))}


              {
                getCurrentItems().length === 0 && <Nodata />
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
                          src={item.type === "folder" ? folderIcon : item.type === "file" ? item.fileType === "note" ? PlainNote : "/newIcons/pdf.svg" : ""}
                          alt="folder"
                          width={30}
                          height={30}
                          className="w-[53px] h-full hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-center w-full col-span-8 items-center justify-start flex">
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
                                    <span className="text-[#9D9D9D] flex items-end text-xs w-full justify-end">{item.daysAgo} days ago</span>
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

                      <div className="col-span-1 w-full justify-end">
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

                      <span className="col-span-3 flex justify-start items-center">
                        <p className='dark:text-[#747474] text-white dark:bg-[#1D2527] bg-[#36AF8D] px-[7px] py-[1px] text-[10px] truncate rounded-md font-pt-sans font-medium'>{item?.subtitle || "Anatomy"}</p>
                      </span>
                    </div>
                  </div>

                  <Separator className="border-[#1F2227] bg-[#1F2227] dark:bg-[#1F2227] h-0.5" />


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



//  {(flashcardPath !== "flashcard" && flashcardPath !== "assesment") && (
//         <>
//           {/* MODIFIED: Show create folder button in root folders (Others, A, B, C, etc.) */}
//           {canCreateFolders() && (
//             <div
//               className="group flex items-center gap-6 cursor-pointer justify-center relative w-full max-w-md mx-auto
//                p-4 rounded-lg border-2 border-dashed
//                border-zinc-200 dark:border-zinc-700
//                hover:border-emerald-400 dark:hover:border-emerald-500
//                bg-gradient-to-br from-zinc-50/50 to-emerald-50/30
//                dark:from-zinc-900/50 dark:to-emerald-950/30
//                hover:from-emerald-50/70 hover:to-indigo-50/50
//                dark:hover:from-emerald-950/70 dark:hover:to-indigo-950/50
//                transition-all duration-500 ease-out
//                hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/10
//                transform hover:scale-[1.02] active:scale-[0.98]"
//               onClick={handleCreateFolder}
//             >
//               <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/5 via-indigo-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

//               <div className="relative">
//                 <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-emerald-400 via-indigo-400 to-amber-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
//                 <Image
//                   src={addFolder}
//                   alt="new-folder"
//                   className="relative w-[80px] h-[80px]
//                    group-hover:scale-110 group-active:scale-95
//                    transition-transform duration-300 ease-out
//                    filter group-hover:drop-shadow-lg
//                    group-hover:brightness-110"
//                 />
//               </div>

//               <div className="text-center space-y-1">
//                 <p className="font-semibold text-base
//                     text-zinc-700 dark:text-zinc-200
//                     group-hover:text-emerald-700 dark:group-hover:text-emerald-300
//                     transition-colors duration-300">
//                   Create New Folder
//                 </p>
//                 <p className="text-xs text-zinc-500 dark:text-zinc-400
//                     group-hover:text-indigo-600 dark:group-hover:text-indigo-400
//                     transition-colors duration-300 opacity-0 group-hover:opacity-100
//                     transform translate-y-2 group-hover:translate-y-0">
//                   Organize your files and documents
//                 </p>
//               </div>

//               <div className="absolute top-4 right-4 w-3 h-3 rounded-full
//                     bg-gradient-to-r from-amber-400 to-emerald-400
//                     opacity-0 group-hover:opacity-100
//                     transition-opacity duration-500 delay-100
//                     animate-pulse"></div>

//               <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full
//                     bg-gradient-to-r from-indigo-400 to-emerald-400
//                     opacity-0 group-hover:opacity-100
//                     transition-opacity duration-500 delay-200"></div>
//             </div>
//           )}

//           {/* MODIFIED: Show file upload only in subfolders */}
//           {canUploadFiles() && path !== "pdf" && (
//             <div className="w-full dark:bg-zinc-900/80 bg-zinc-50/60
//                 dark:border-zinc-700/50 border border-zinc-200
//                 shadow-lg shadow-zinc-900/5 dark:shadow-zinc-950/20
//                 rounded-lg backdrop-blur-sm
//                 flex flex-col items-center justify-center">
//               <div className="w-full p-3">
//                 <input
//                   type="file"
//                   id="fileInput"
//                   multiple
//                   accept="application/pdf"
//                   className="hidden"
//                   onChange={handleFileInput}
//                 />

//                 <label
//                   htmlFor="fileInput"
//                   onDragEnter={handleDragEnter}
//                   onDragOver={handleDragOver}
//                   onDragLeave={handleDragLeave}
//                   onDrop={handleDrop}
//                   className={`group border-2 border-dashed w-full rounded-lg p-6
//                   flex flex-col items-center justify-center cursor-pointer
//                   transition-all duration-300 ease-out
//                   hover:scale-[1.01] active:scale-[0.99]
//                   ${isDragging
//                       ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-indigo-50/50 dark:from-emerald-950/50 dark:to-indigo-950/30 shadow-lg shadow-emerald-500/20"
//                       : "border-zinc-300 dark:border-zinc-600 bg-gradient-to-br from-zinc-50/50 to-amber-50/30 dark:from-zinc-900/50 dark:to-amber-950/20 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gradient-to-br hover:from-indigo-50/60 hover:to-emerald-50/40 dark:hover:from-indigo-950/60 dark:hover:to-emerald-950/40"
//                     }`}
//                 >
//                   <div className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${isDragging
//                     ? "bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-amber-500/10 opacity-100"
//                     : "bg-gradient-to-r from-indigo-500/5 via-emerald-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100"
//                     }`}></div>

//                   <div className="relative">
//                     <div className={`absolute -inset-3 rounded-full blur-lg transition-opacity duration-300 ${isDragging
//                       ? "bg-emerald-400/30 opacity-100"
//                       : "bg-indigo-400/20 opacity-0 group-hover:opacity-100"
//                       }`}></div>
//                     <Upload
//                       className={`relative w-8 h-8 mb-4 transition-all duration-300 ${isDragging
//                         ? "text-emerald-600 dark:text-emerald-400 scale-110"
//                         : "text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:scale-105"
//                         }`}
//                     />
//                   </div>

//                   <div className="text-center space-y-2 relative z-10">
//                     <p className={`font-semibold text-sm transition-colors duration-300 ${isDragging
//                       ? "text-emerald-700 dark:text-emerald-300"
//                       : "text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300"
//                       }`}>
//                       {isDragging ? "Drop your files here" : "Upload PDF Files"}
//                     </p>
//                     <p className={`text-xs transition-colors duration-300 ${isDragging
//                       ? "text-emerald-600 dark:text-emerald-400"
//                       : "text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
//                       }`}>
//                       {isDragging ? "Release to upload" : "Drag & drop or click to browse"}
//                     </p>
//                   </div>
//                 </label>
//               </div>
//             </div>
//           )}

//           {/* NEW: Show appropriate message based on current location */}
//           {!currentFolder && (
//             <div className="w-full flex items-center justify-center px-8 py-4">
//               <div className="text-center space-y-4 max-w-md">
//                 <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-indigo-100 to-emerald-100 dark:from-indigo-900 dark:to-emerald-900 flex items-center justify-center">
//                   <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-2">
//                     Select a Folder
//                   </h3>
//                   <p className="text-sm text-zinc-500 dark:text-zinc-400">
//                     Choose a folder from the list to start organizing your files.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* {isInRootFolder() && (
//             <div className="w-full flex items-center justify-center p-4">
//               <div className="text-center space-y-3 max-w-sm">
//                 <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 flex items-center justify-center">
//                   <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h4 className="text-md font-medium text-zinc-700 dark:text-zinc-200 mb-1">
//                     Create Subfolders Here
//                   </h4>
//                   <p className="text-xs text-zinc-500 dark:text-zinc-400">
//                     You can create new folders in this location. To upload files, navigate to a subfolder.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )} */}

//           {/* {canUploadFiles() && (
//             <div className="w-full flex items-center justify-center p-4">
//               <div className="text-center space-y-3 max-w-sm">
//                 <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
//                   <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h4 className="text-md font-medium text-zinc-700 dark:text-zinc-200 mb-1">
//                     Upload Files Here
//                   </h4>
//                   <p className="text-xs text-zinc-500 dark:text-zinc-400">
//                     You can upload PDF files in this subfolder location.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )} */}

//           <div
//             className={`transition-all duration-300 pt-[26px]
//              no-scrollbar w-full flex flex-col gap-[27px] items-start justify-start
//              h-[340px] overflow-y-auto`}
//           >
//             {getCurrentItems()?.map((item: any) => (
//               <div
//                 key={item.id}
//                 className="relative flex flex-col items-start justify-start gap-[27px] cursor-pointer w-full
//               rounded-lg transition-all duration-200"
//                 onClick={() => handleItemClick(item)}
//               >
//                 <div className="w-full">
//                   <div className="grid grid-cols-12 h-[44px] grid-rows-2 max-lg:gap-x-2 gap-x-6 relative">
//                     <div className="h-full w-full items-center rounded-lg row-span-2 col-span-2 p-2 dark:bg-[#1D2527] bg-[#AADACD]">
//                       <Image
//                         src={item.type === "folder" ? folderIcon : item.type === "file" ? item.fileType === "note" ? PlainNote : "/newIcons/pdf.svg" : ""}
//                         alt="folder"
//                         width={30}
//                         height={30}
//                         className="w-[53px] h-full hover:scale-105 transition-transform duration-300"
//                       />
//                     </div>
//                     <div className="text-center w-full col-span-8 items-center justify-start flex">
//                       {editingItem === item.id ? (
//                         <div className="w-full transition-all duration-300 ease-in-out">
//                           <input
//                             type="text"
//                             defaultValue={item.name.replace(/\.(pdf|notes)$/, "")}
//                             onBlur={(e) => handleRename(item.id, e.target.value)}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter") {
//                                 handleRename(item.id, e.currentTarget.value);
//                               } else if (e.key === "Escape") {
//                                 setEditingItem(null);
//                               }
//                             }}
//                             autoFocus
//                             className="text-[16px] text-center bg-transparent border-none outline-none
//                 shadow-none focus:ring-2 focus:ring-orange focus:outline-none
//                 focus-visible:ring-2 focus-visible:ring-orange
//                 focus-visible:outline-none h-[1rem] leading-none w-full
//                 text-gray-700 dark:text-white rounded-lg"
//                             onClick={(e) => {
//                               e.preventDefault();
//                               e.stopPropagation();
//                             }}
//                           />
//                         </div>
//                       ) : (
//                         <div className="w-full">
//                           <TooltipProvider>
//                             <Tooltip>
//                               <TooltipTrigger asChild>
//                                 <div className="flex items-center justify-between w-full">
//                                   <h2 className="dark:text-white text-black text-[17px] w-full text-start font-medium truncate font-pt-sans">{item.name}</h2>
//                                   <span className="text-[#9D9D9D] flex items-end text-xs w-full justify-end">{item.daysAgo} days ago</span>
//                                 </div>
//                               </TooltipTrigger>
//                               <TooltipContent>
//                                 <p>{item.name}</p>
//                               </TooltipContent>
//                             </Tooltip>
//                           </TooltipProvider>
//                         </div>
//                       )}
//                     </div>

//                     <div className="col-span-1 w-full justify-end">
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="p-1 transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setMenuOpen(menuOpen === item.id ? null : item.id);
//                         }}
//                       >
//                         <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-300" />
//                       </Button>
//                       {renderMenuDropdown(item.id)}
//                     </div>

//                     <span className="col-span-3 flex justify-start items-center">
//                       <p className='dark:text-[#747474] text-white dark:bg-[#1D2527] bg-[#36AF8D] px-[7px] py-[1px]
//                      text-[10px] truncate rounded-md font-pt-sans font-medium'>{item?.subtitle || "Anatomy"}</p>
//                     </span>
//                   </div>
//                 </div>

//                 <Separator className="border-[#1F2227] bg-[#1F2227] dark:bg-[#1F2227] h-0.5" />
//               </div>
//             ))}
//           </div>
//         </>
//       )}