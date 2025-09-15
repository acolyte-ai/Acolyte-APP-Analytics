import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useViewCombination } from "./useViewCombination.ts";

export const useCreateNote = () => {
  const router = useRouter();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [documentId, setDocumentId] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const { updateViewCombination } = useViewCombination();

  const createNote = async () => {
    setIsOverlayOpen(false);
    try {
      updateViewCombination('notes');
      router.push(`/workspace/${documentId}`);
    } catch (error) {
      console.error("Error saving PDF:", error);
      alert("Failed to save the PDF. Please try again.");
    }
  };

  const initializeNote = () => {
    const id = uuidv4();
    setIsOverlayOpen(true);
    setFileName("Note");
    setDocumentId(id);
  };

  const closeOverlay = () => {
    setIsOverlayOpen(false);
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOverlayOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOverlayOpen(open);
  };

  return {
    // State
    isOverlayOpen,
    currentPath,
    documentId,
    fileName,
    
    // Actions
    createNote,
    initializeNote,
    closeOverlay,
    handleOutsideClick,
    handleOpenChange,
    
    // Setters (if needed for external control)
    setCurrentPath,
    setFileName,
    setDocumentId,
    setIsOverlayOpen,
  };
};