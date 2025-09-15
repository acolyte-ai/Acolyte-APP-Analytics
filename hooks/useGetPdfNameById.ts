import { useSettings } from "@/context/store";
import { useCallback } from "react";


type FileSystemItem = {
  id: string;
  name: string;
  type: string;
  fileType?: string;
  parentId?: string;
  userId?: string;
  timestamp?: string;
};

export const useGetPdfNameById = () => {
  const { fileSystem } = useSettings();

  const getPdfNameById = useCallback(
    (pdfId: string): string | undefined => {
      const pdfItem = fileSystem.find(
        (item: FileSystemItem) => item.id === pdfId && item.fileType === "pdf"
      );
      return pdfItem?.name;
    },
    [fileSystem] // ✅ Dependency on the file system state
  );

  return getPdfNameById;
};
