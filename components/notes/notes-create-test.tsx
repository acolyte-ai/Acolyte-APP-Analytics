"use client";
import React from "react";
import FileSystem from "@/components/FileSystem/FileSystem";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateNote } from "@/hooks/useCreateNote";
import Image from "next/image"
import icon from "@/public/foldersIcon/folderInactive.svg"

const CreateNote = () => {
  const {
    isOverlayOpen,
    currentPath,
    documentId,
    fileName,
    createNote,
    initializeNote,
    handleOutsideClick,
    handleOpenChange,
    setCurrentPath,
    setIsOverlayOpen,
  } = useCreateNote();

  return (
    <div className="rounded-lg w-full flex items-center justify-center">
      <Dialog open={isOverlayOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger onClick={initializeNote}>
          <Button variant={"ghost"} className="space-y-4 flex flex-col hover:bg-transparent dark:hover:bg-transparent">
            <div className="flex flex-col items-center justify-center gap-4">
              <Image src={icon} alt="pdficon" width={50} height={50} />
              <span className="text-emerald-500 underline-offset-2 tracking-wider text-center underline font-semibold ">
                upload
              </span>
              <span className=" text-center tracking-wider no-underline dark:text-white text-black">
                Upload Files to start learning
              </span>
            </div>
          </Button>

        </DialogTrigger>
        <DialogClose className="hidden"></DialogClose>
        <DialogContent
          className="bg-transparent dark:bg-transparent border-none shadow-none [&>button]:hidden"
          onPointerDownOutside={() => setIsOverlayOpen(false)}
          onEscapeKeyDown={() => setIsOverlayOpen(false)}
        >
          <div onClick={handleOutsideClick}>
            <FileSystem
              currentPath={currentPath}
              setCurrentPath={setCurrentPath}
              file={{ documentId, fileName }}
              fileType="note"
              saveFile={createNote}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateNote;