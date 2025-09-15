"use client";
import { useState, useEffect } from "react";
import { useSettings } from "@/context/store";
import { getPdfById } from "@/db/pdf/pdfFiles";
import { getFileById } from "@/db/pdf/fileSystem";
import {
  markPdfAsSynced,
} from "@/db/pdf/fileSystem";
import useUserId from "@/hooks/useUserId";
import { X } from "lucide-react";
import {
  createOrUpdateItem,
  deleteItem,
  getUserItems,
} from "@/lib/fileSystemUtils";

// UI Component
export const TrainAiNotificationUI = ({
  onClose,
  onConfirm,
  isTrained,
  loading,
}) => {
  const { trainNotificationMessage } = useSettings();
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="flex max-w-md w-full">
        <div className="flex-shrink-0 self-start mt-2 mr-0 z-10 bg-white rounded-full p-4">
          <div className="rounded-full bg-purple-700 flex items-center justify-center overflow-hidden">
            <object
              data="/person.svg"
              type="image/svg+xml"
              style={{ pointerEvents: "none", width: "150px", height: "150px" }}
            />
          </div>
        </div>

        <div className="flex-1 -ml-8">
          <div className="bg-[#E8E1F9] px-8 py-4 rounded-3xl relative h-[188px] w-[465px]">
            <button
              onClick={onClose}
              className="absolute top-4 right-6 text-gray-500 hover:text-gray-700 border-[#d1c7e7] border-2 rounded-full p-1"
            >
              <X size={15} />
            </button>

            <div className="ml-5">
              <h3 className="text-lg font-medium text-purple-800 mb-3">
                Train AI with Your PDF
              </h3>

              <div className="border-t border-[#553C9A] my-2"></div>

              <div className="flex justify-between items-center">
                <p className="text-gray-700 text-base font-medium">
                  {trainNotificationMessage}
                </p>

                <div className="bg-white p-2 absolute bottom-0 right-0 rounded-full">
                  <button
                    className="bg-[#553C9A] text-white p-2 rounded-full font-medium hover:bg-purple-800 transition-colors"
                    onClick={onConfirm}
                    disabled={loading}
                  >
                    {isTrained ? "ReTrain" : "Train"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Functional Container Component
export const TrainAiNotification = ({ openTrainModal, setopenTrainModal }) => {
  const {
    currentDocumentId,
    setisTrainingProgress,
    setisUploadProgress,
    isTrainingProgress,
    fileSystem,
    setFileSystem,
  } = useSettings();

  const [loading, setLoading] = useState(false);
  const [isTrained, setIsTrained] = useState(false);
  const [isStartedTraining, setIsStartedTraining] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const userId = useUserId();

  useEffect(() => {
    const sync = async () => {
      if (fileSystem?.length === 0 || !fileSystem || !userId) return;

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
        console.log("Items to sync", itemsToSync);

        console.log(
          `Synced ${itemsToSync.length} items and deleted ${itemsToDelete.length} items`
        );
      } catch (error) {
        console.error("Error syncing file system with database:", error);
      }
    };

    sync();
  }, [fileSystem, setFileSystem, userId]);

  useEffect(() => {
    const checkDocumentStatus = async () => {
      try {
        const findFile = (items) => {
          for (const item of items) {
            if (item.id === currentDocumentId) {
              setIsTrained(item.isTrained === true);
              setIsStartedTraining(item.isStartedTraining === true);

              // If training has started but not completed, don't show modal
              if (item.isStartedTraining === true && item.isTrained !== true) {
                setopenTrainModal(false);
              }

              return {
                isTrained: item.isTrained === true,
                isStartedTraining: item.isStartedTraining === true,
              };
            }
            if (item.children) {
              const found = findFile(item.children);
              if (found !== null) return found;
            }
          }
          return null;
        };

        const result = findFile(fileSystem);
        if (!result) {
          setopenTrainModal(false);
        }
      } catch (error) {
        console.error("Failed to check document training status:", error);
      }
    };

    checkDocumentStatus();
  }, [currentDocumentId, setopenTrainModal, fileSystem, isTrainingProgress]);

  useEffect(() => {
    // Close modal when training completes or starts
    if (isTrained || isStartedTraining) {
      setopenTrainModal(false);
    }
  }, [isTrained, isStartedTraining, setopenTrainModal]);

  const handleClose = () => {
    setopenTrainModal(false);
    console.log("clicked on the close");
  };

  const processDocument = async (bucketName, userId, key) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_INGESTION_URL}/process-document`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bucket_name: bucketName,
            user_id: userId,
            key: `${key}.pdf`,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Error: ${res.status} - ${res.statusText}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Error processing document:", error);
      return null;
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleConfirm = async () => {
    console.log(syncing, currentDocumentId);
    if (syncing || !currentDocumentId) {
      console.log("Provide a valid Document ID.");
      return;
    }

    setSyncing(true);
    setLoading(true);
    setisUploadProgress(true);
    // Trigger document processing
    setisTrainingProgress(true);

    try {
      const pdf = await getPdfById(currentDocumentId);
      const pdfFile = await getFileById(fileSystem, currentDocumentId);
      if (!pdf || !pdfFile) {
        setSyncing(false);
        setLoading(false);
        return;
      }

      const { base64, documentId } = pdf;
      const { isSynced } = pdfFile;

      if (isSynced) {
        console.log("PDF already synced. Proceeding to processing...");
      } else {
        // Get upload URL
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dev/uploadpdf`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, documentId }),
          }
        );

        if (!response.ok) {
          setSyncing(false);
          setLoading(false);
          return;
        }

        const { uploadURL } = await response.json();

        // Convert base64 to binary
        const binary = atob(base64.split(",")[1]);
        const arrayBuffer = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          arrayBuffer[i] = binary.charCodeAt(i);
        }

        // Upload PDF
        const uploadResponse = await fetch(uploadURL, {
          method: "PUT",
          headers: { "Content-Type": "application/pdf" },
          body: arrayBuffer,
        });

        if (!uploadResponse.ok) {
          console.error("PDF upload failed.");
          setSyncing(false);
          setLoading(false);
          return;
        }

        // Mark PDF as synced
        await markPdfAsSynced(fileSystem, setFileSystem, currentDocumentId);
        console.log("PDF uploaded and marked as synced.");

        // 4-second delay before processing
        console.log("Waiting 4 seconds before processing...");
        await delay(4000);
      }

      console.log("Processing document...");

      // Mark as started training before actual processing

      setIsStartedTraining(true);

      const processResponse = await processDocument(
        "pdf-storage-bucket-myacolyte",
        userId,
        documentId
      );

      if (processResponse) {
        setIsTrained(true);
        // Update the filesystem with trained status
        // await markPdfAsStartedTraining(
        //   fileSystem,
        //   setFileSystem,
        //   currentDocumentId
        // );
      }
    } catch (error) {
      console.error("Error in syncPdf:", error);
    } finally {
      setSyncing(false);
      setLoading(false);
      setopenTrainModal(false);
    }
  };

  // If the modal should be closed, return null
  if (!openTrainModal) return null;

  // Don't show modal if already started training or completed
  if (isStartedTraining || isTrained) return null;

  // Render the UI component with the necessary props
  return (
    <TrainAiNotificationUI
      onClose={handleClose}
      onConfirm={handleConfirm}
      isTrained={isTrained}
      loading={loading}
    />
  );
};
