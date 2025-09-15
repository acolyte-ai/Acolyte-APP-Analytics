"use client";
import { useState, useEffect } from "react";
import { useSettings } from "@/context/store";
import { getPdfById } from "@/db/pdf/fileSystem";
import { getPdfById as getPdfByIdData } from "@/db/pdf/pdfFiles";
import { useFetchNotes } from "@/hooks/useFetchNotes";
import { markPdfAsSynced } from "@/db/pdf/fileSystem";
import useUserId from "@/hooks/useUserId";
import {
  createOrUpdateItem,
  deleteItem,
  getUserItems,
  type FileSystemItem,
} from "@/lib/fileSystemUtils";

// Efficient comparison function to replace JSON.stringify
const isFileSystemItemEqual = (item1: FileSystemItem, item2: FileSystemItem): boolean => {
  return (
    item1.id === item2.id &&
    item1.name === item2.name &&
    item1.type === item2.type &&
    item1.fileType === item2.fileType &&
    item1.parentId === item2.parentId &&
    item1.timestamp === item2.timestamp &&
    item1.userId === item2.userId
  );
};

// Optimized batch processing with delays to prevent UI blocking
const processBatchedUpdates = async (items: FileSystemItem[]): Promise<void> => {
  const batchSize = 5; // Smaller batches for better performance
  const batchDelay = 10; // Small delay between batches

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Process batch with error handling
    await Promise.allSettled(batch.map(async (item) => {
      try {
        await createOrUpdateItem(item);
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
      }
    }));
    
    // Small delay to prevent overwhelming the system
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, batchDelay));
    }
  }
};

// Batch processing for deletions
const processBatchedDeletes = async (items: FileSystemItem[], userId: string): Promise<void> => {
  const batchSize = 5;
  const batchDelay = 10;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    await Promise.allSettled(batch.map(async (item) => {
      try {
        await deleteItem(userId, item.id);
      } catch (error) {
        console.error(`Failed to delete item ${item.id}:`, error);
      }
    }));
    
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, batchDelay));
    }
  }
};
import { pdfCache } from "@/components/pdf/utils/pdfCache";

// Optimized base64 conversion using streaming for large files
const convertBase64ToArrayBufferOptimized = async (base64Content: string): Promise<Uint8Array> => {
  const CHUNK_SIZE = 64 * 1024; // Process 64KB chunks
  const binaryLength = base64Content.length * 3 / 4;
  const result = new Uint8Array(binaryLength);
  
  let resultIndex = 0;
  
  // Process in chunks to avoid blocking the main thread
  for (let i = 0; i < base64Content.length; i += CHUNK_SIZE) {
    const chunk = base64Content.slice(i, Math.min(i + CHUNK_SIZE, base64Content.length));
    
    // Use requestAnimationFrame to yield control to the browser
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    try {
      const binaryString = atob(chunk);
      for (let j = 0; j < binaryString.length; j++) {
        result[resultIndex++] = binaryString.charCodeAt(j);
      }
    } catch (error) {
      console.error('Error processing base64 chunk:', error);
      throw new Error('Failed to process PDF data chunk');
    }
  }
  
  return result.slice(0, resultIndex);
};

export const useSyncLogic = () => {
  const {
    currentDocumentId,
    setisUploadProgress,
    currentView,
    fileSystem,
    setFileSystem,
  } = useSettings();
  const userId = useUserId();

  const {
    upload,
    download,
    isDownloaded,
  } = useFetchNotes(currentDocumentId, userId);

  // "idle", "syncing", "success", "error"
  const [syncStatus, setSyncStatus] = useState("idle");
  const [syncing, setSyncing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle initial download when component mounts
  useEffect(() => {
    if (download && currentDocumentId && userId) {
      download();
    }
  }, [currentDocumentId, userId, download]);

  useEffect(() => {
    const sync = async () => {
      if (fileSystem?.length === 0 || !fileSystem || !userId) return;

      try {
        // Get current items from database to compare with local state
        const dbItemsResponse = await getUserItems(userId);
        
        // Check if response is an error
        if ('error' in dbItemsResponse) {
          console.error('Error fetching items:', dbItemsResponse.error);
          return;
        }

        const dbItems = dbItemsResponse as FileSystemItem[];
        const dbItemsMap = new Map(dbItems.map((item: FileSystemItem) => [item.id, item]));
        const currentItemsMap = new Map(
          fileSystem.map((item: FileSystemItem) => [item.id, item])
        );

        // Find items to update or create using efficient comparison
        const itemsToSync: FileSystemItem[] = [];
        for (const item of fileSystem) {
          const dbItem = dbItemsMap.get(item.id);

          // Use efficient comparison instead of JSON.stringify
          if (!dbItem || !isFileSystemItemEqual(dbItem, item)) {
            itemsToSync.push({
              ...item,
              userId: item.userId || userId,
            });
          }
        }

        // Find items to delete (items in DB that are not in our state)
        const itemsToDelete: FileSystemItem[] = [];
        for (const dbItem of dbItems) {
          if (!currentItemsMap.has(dbItem.id)) {
            itemsToDelete.push(dbItem);
          }
        }

        // Process updates in optimized batches with delay
        await processBatchedUpdates(itemsToSync);

        // Process deletes (currently commented out)
        // await processBatchedDeletes(itemsToDelete, userId);

        console.log(
          `Synced ${itemsToSync.length} items and deleted ${itemsToDelete.length} items`
        );
      } catch (error) {
        console.error("Error syncing file system with database:", error);
      }
    };

    sync();
  }, [fileSystem, setFileSystem, userId]);

  const syncAll = async () => {
    setSyncStatus("syncing");
    try {
      await Promise.all([upload(), syncPdf()]);
      setSyncStatus("success");
    } catch (error) {
      console.error("Error in syncAll:", error);
      setSyncStatus("error");
    }
  };



  // Improved syncPdf function with more robust file handling
  const syncPdf = async () => {
    console.log("Syncing PDF...", currentDocumentId);

    // Validation checks
    if (syncing || !currentDocumentId || !userId) {
      console.log("Sync aborted: already syncing or missing document ID/user ID");
      return;
    }

    // Set UI state
    setSyncing(true);
    setSyncStatus("syncing");
    setisUploadProgress(true);
    setUploadProgress(0);

    try {
      // Get PDF metadata from file system
      const pdf = await getPdfById(fileSystem, currentDocumentId);
      console.log("PDF from file system:", pdf);

      // Check if PDF already exists and is synced
      if (pdf?.isSynced) {
        console.log("PDF already synced:", currentDocumentId);
        setSyncStatus("success");
        setUploadProgress(100);
        setSyncing(false);
        setisUploadProgress(false);
        return;
      }

      // Try to get PDF data from cache first
      let pdfArrayBuffer = null;

      try {
        console.log("Attempting to retrieve PDF from cache");
        pdfArrayBuffer = await pdfCache.getPdf(currentDocumentId);
        if (pdfArrayBuffer) {
          console.log("Successfully retrieved PDF from cache");
        }
      } catch (cacheError) {
        console.error("Error accessing PDF cache:", cacheError);
        // Continue with fallback if cache fails
      }

      // If not in cache, try to get it from the primary source
      if (!pdfArrayBuffer) {
        console.log("PDF not in cache, retrieving from primary source");

        try {
          const pdfData = await getPdfByIdData(currentDocumentId);

          if (!pdfData || !pdfData.base64) {
            throw new Error("PDF data not found in primary source");
          }

          console.log("PDF data retrieved, processing base64...");

          // Improved base64 handling
          const base64String = pdfData.base64;
          const base64Content = base64String.indexOf('base64,') >= 0
            ? base64String.split('base64,')[1]
            : base64String;

          try {
            // Convert base64 to array buffer using streaming approach for large files
            console.log("Starting optimized base64 conversion...");
            pdfArrayBuffer = await convertBase64ToArrayBufferOptimized(base64Content);
            console.log("Base64 conversion successful");

            // Store in cache for future use
            try {
              await pdfCache.storePdf(currentDocumentId, pdfArrayBuffer);
              console.log("PDF stored in cache for future use");
            } catch (storageError) {
              console.warn("Failed to store PDF in cache:", storageError);
              // Continue with upload even if caching fails
            }
          } catch (base64Error) {
            console.error("Error processing base64 data:", base64Error);
            throw new Error("Failed to process PDF data");
          }
        } catch (retrievalError) {
          console.error("Error retrieving PDF from primary source:", retrievalError);
          throw new Error("Could not retrieve PDF data from any source");
        }
      }

      if (!pdfArrayBuffer) {
        throw new Error("Could not load PDF data from any source");
      }

      setUploadProgress(20);
      console.log("PDF data prepared for upload, size:", pdfArrayBuffer.byteLength);

      // Get server upload URL
      console.log("Requesting upload URL from server...");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dev/uploadpdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, documentId: currentDocumentId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const { uploadURL } = await response.json();
      console.log("Received upload URL:", uploadURL);
      setUploadProgress(40);

      // Create blob for upload
      const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });

      // Upload PDF to server with improved error handling
      console.log("Starting upload to server...");

      // Use XMLHttpRequest for upload progress monitoring
      const uploadResult = await new Promise<{ok: boolean}>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 60) + 40; // 40-100%
            setUploadProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ ok: true });
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error during upload"));
        };

        xhr.open("PUT", uploadURL, true);
        xhr.setRequestHeader("Content-Type", "application/pdf");
        xhr.send(pdfBlob);
      });

      if (!uploadResult.ok) {
        throw new Error("Upload failed");
      }

      console.log("Upload completed successfully");
      setUploadProgress(100);

      // Mark as synced in local file system
      await markPdfAsSynced(fileSystem, setFileSystem, currentDocumentId);
      setSyncStatus("success");
      console.log("PDF successfully synced to server:", currentDocumentId);

    } catch (error) {
      console.error("PDF sync failed:", error);
      setSyncStatus("error");
    } finally {
      setSyncing(false);
      setisUploadProgress(false);
    }
  };

  useEffect(() => {
    if (!currentDocumentId || !userId) return;
    const push = async () => {
      console.log("Trying to push to cloud", currentDocumentId);
      await syncPdf();
    };
    push();
  }, [currentDocumentId, currentView, userId]);

  return {
    syncStatus,
    setSyncStatus,
    uploadProgress,
    syncAll,
    isDownloaded,
    download
  };
};