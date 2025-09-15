import { useState, useCallback } from "react";
import { uploadAnnotations, downloadAnnotations } from "@/lib/noteUtils";
import { deleteAppState } from "@/db/note/canvas";

export const useFetchNotes = (currentDocumentId, userId) => {
  const [status, setStatus] = useState("");
  const [isDownloaded, setIsDownloaded] = useState(false);

  const upload = useCallback(async () => {
    setStatus("Uploading annotations...");
    if (!userId || !currentDocumentId) return;
    try {
      setIsDownloaded(true);
      const message = await uploadAnnotations(currentDocumentId, userId);
      await deleteAppState(currentDocumentId)
      setStatus(message);
      setIsDownloaded(false);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  }, [currentDocumentId, userId]);

  const download = useCallback(async () => {
    setStatus("Downloading annotations...");
    if (!userId || !currentDocumentId) return;
    try {
      const message = await downloadAnnotations(currentDocumentId, userId);
      setStatus(message);
      setIsDownloaded(true);
      console.log("Downloading annotations...")
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      setIsDownloaded(true);
    }
  }, [currentDocumentId, userId]);

  return { status, isDownloaded, upload, download };
};
