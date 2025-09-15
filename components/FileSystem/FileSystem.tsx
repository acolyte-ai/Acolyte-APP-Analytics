"use client"
import React, { useState, useEffect, useCallback } from "react";
import { useSettings } from "@/context/store";
import useUserId from "@/hooks/useUserId";

import {
  createOrUpdateItem,
  getUserItems,
  deleteItem,
} from "@/lib/fileSystemUtils";
import { FaSpinner } from "react-icons/fa";
import DialogHeader from "./dialogHeader";
import DialogBody from "./DialogBody";
import DialogFooter from "./DialogFooter";
import TopBar from "./topBar";
import GridArea from "./gridArea";

interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: "pdf" | "note";
  parentId: string | null;
  timestamp?: any;
  userId?: string;
  isSynced: boolean;
  isTrained: boolean;
}

interface FileSystemProps {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  file?: {
    documentId: string;
    fileName: string;
  };
  fileType?: "pdf" | "note" | "root";
  saveFile?: () => void;
  isSubjectFolderView?: boolean;
  inModal?: boolean;
  isChatTrigger?: boolean;
}

export default function FileSystem({
  currentPath,
  setCurrentPath,
  file,
  fileType = "root",
  saveFile,
  // isSubjectFolderView = false,
  inModal = false,
  isChatTrigger,
}: FileSystemProps) {
  const userId = useUserId();
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const { setcurrentDocument, fileSystem, setFileSystem, isFileSystemLoaded } =
    useSettings();
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateFileInfo, setDuplicateFileInfo] = useState(null);
  const [shouldFileSystemUplate, setshouldFileSystemUplate] = useState(false);


  useEffect(() => {
    const sync = async () => {
      if (
        fileSystem?.length === 0 ||
        !fileSystem ||
        !shouldFileSystemUplate ||
        !userId
      )
        return;

      try {
        // Get current items from database to compare with local state
        const dbItems = await getUserItems(userId);
        const dbItemsMap = new Map(dbItems.map((item) => [item.id, item]));
        const currentItemsMap = new Map(
          fileSystem.map((item) => [item.id, item])
        );

        // Find items to update or create (items in our state that differ from DB or are new)
        const itemsToSync = [];
        for (const item of fileSystem) {
          const dbItem = dbItemsMap.get(item.id);

          // If item doesn't exist in DB or has changed, add to sync list
          if (!dbItem || JSON.stringify(dbItem) !== JSON.stringify(item)) {
            itemsToSync.push({
              ...item,
              userId: item.userId || userId,
            });
          }
        }

        // Find items to delete (items in DB that are not in our state)
        const itemsToDelete = [];
        for (const dbItem of dbItems) {
          if (!currentItemsMap.has(dbItem.id)) {
            itemsToDelete.push(dbItem);
          }
        }

        // Process updates in batches to avoid overwhelming the database
        const batchSize = 10;

        // Update or create items in batches
        for (let i = 0; i < itemsToSync.length; i += batchSize) {
          const batch = itemsToSync.slice(i, i + batchSize);
          await Promise.all(batch.map((item) => createOrUpdateItem(item)));
        }

        // Delete items in batches
        for (let i = 0; i < itemsToDelete.length; i += batchSize) {
          const batch = itemsToDelete.slice(i, i + batchSize);
          // await Promise.all(batch.map((item) => deleteItem(userId, item.id)));
        }

        console.log(
          `Synced ${itemsToSync.length} items and deleted ${itemsToDelete.length} items`
        );
      } catch (error) {
        console.error("Error syncing file system with database:", error);
      }

      setshouldFileSystemUplate(false);
    };

    sync();
  }, [fileSystem, shouldFileSystemUplate, setFileSystem, userId]);

  const handleOutsideClick = useCallback((e) => {
    // Only close the menu if clicking outside of any menu component
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

  const updateFileSystem = useCallback(
    async (updatedFileSystem: FileSystemItem[]) => {
      try {
        setFileSystem(updatedFileSystem);
        setshouldFileSystemUplate(true);
      } catch (error) {
        console.error("Error updating file system:", error);
      }
    },
    [setFileSystem]
  );

  useEffect(() => {
    // Add event listener for clicking outside
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [handleOutsideClick]);

  return (
    <div className="w-full h-full   text-black rounded-lg flex flex-col  relative">
      {/* Duplicate File Dialog */}
      <div className="relative ">
        {/* Dialog Overlay */}
        {showDuplicateDialog && (
          <div className="fixed inset-0 z-50  backdrop-blur-sm
           bg-black/95 flex items-center justify-center">
            {/* Dialog Content */}
            <div className=" rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
              <DialogHeader />

              <DialogBody duplicateFileInfo={duplicateFileInfo} />

              <DialogFooter
                setshouldFileSystemUplate={(value) =>
                  setshouldFileSystemUplate(value)
                }
                setShowDuplicateDialog={(value) =>
                  setShowDuplicateDialog(value)
                }
                setDuplicateFileInfo={(value) => setDuplicateFileInfo(value)}
                setcurrentDocument={(value) => setcurrentDocument(value)}
                setFileSystem={(value) => setFileSystem(value)}
                saveFile={saveFile}
                currentFolder={currentFolder}
                duplicateFileInfo={duplicateFileInfo}
                updateFileSystem={updateFileSystem}
              />
            </div>
          </div>
        )}
      </div>
      {!isFileSystemLoaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div className="w-[500px] h-full  rounded-md animate-pulse">
            <FaSpinner />
          </div>
        </div>
      )}


      {isFileSystemLoaded &&
        <>
          <TopBar
            file={file}
            setDuplicateFileInfo={(value) => setDuplicateFileInfo(value)}
            setShowDuplicateDialog={(value) => setShowDuplicateDialog(value)}
            updateFileSystem={updateFileSystem}
            saveFile={saveFile}
            setCurrentPath={(value) => setCurrentPath(value)}
            setCurrentFolder={(value) => setCurrentFolder(value)}
            currentFolder={currentFolder}
            currentPath={currentPath}
            fileType={fileType}
            setshouldFileSystemUplate={(value) => setshouldFileSystemUplate(value)}
            setcurrentDocument={(value) => setcurrentDocument(value)}
          />




          <GridArea
            menuOpen={menuOpen}
            setMenuOpen={(value) => setMenuOpen(value)}
            setCurrentFolder={setCurrentFolder}
            updateFileSystem={updateFileSystem}
            setshouldFileSystemUplate={(value) => setshouldFileSystemUplate(value)}
            setCurrentPath={setCurrentPath}
            fileType={fileType}
            fileSystem={fileSystem}
            currentFolder={currentFolder}
            isChatTrigger={isChatTrigger}
            inModal={inModal}
          />

        </>
      }
    </div>
  );
}

