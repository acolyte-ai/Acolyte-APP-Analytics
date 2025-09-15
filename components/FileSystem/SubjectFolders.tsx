"use client";
import React, { useState, } from "react";
import FileSystem from "./FileSystem";





export default function SubjectFolders() {
  const [currentPath, setCurrentPath] = useState("");

  return (
    <div className="rounded-lg  h-[700px] w-full  backdrop-blur-sm relative flex-col flex justify-center items-center">


      {/* Base view (non-modal) */}
      <div className="">
        <FileSystem
          currentPath={currentPath}
          setCurrentPath={setCurrentPath}
          fileType="root"
          isSubjectFolderView
        />
      </div>
    </div>
  );
}
