"use client";
import React, { useEffect, useRef, useState } from "react";
import { navigationUtils } from "@/components/pdf/utils/pdf-utils";
import useUserId from "@/hooks/useUserId";
import AnalyticsService, { ReadingAnalytics } from "./analyticsService";

type OutlineItem = {
  title: string;
  dest: any;
  items?: OutlineItem[];
};

type ReadingSession = {
  currentPage: number | null;
  lastTimestamp: number;
  visitedPages: Set<number>;
  timeSpentPerPage: Record<number, number>;
  visitedSections: Set<string>;
  outline: OutlineItem[];
  totalPages: number;
  completedPages: Set<number>;
  progress: number; // Progress percentage
  // Document metadata
  documentName: string;
  documentId: string;
  userId: string;
  createdAt: number;
  lastAccessedAt: number;
};

type Props = {
  pdfAPI: any;
  currentDocumentId?: string;
};

const ContinueReading: React.FC<Props> = ({
  pdfAPI,
  currentDocumentId = "default",
}) => {

  const [savedPage, setSavedPage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const userId = useUserId();

  // Minimum time in milliseconds a user must spend on a page to consider it "read"
  const MIN_TIME_TO_READ_PAGE = 5000; // 5 seconds - you can adjust this as needed

  const sessionRef = useRef<ReadingSession>({
    currentPage: null,
    lastTimestamp: Date.now(),
    visitedPages: new Set<number>(),
    timeSpentPerPage: {},
    visitedSections: new Set<string>(),
    outline: [],
    totalPages: 0,
    completedPages: new Set<number>(),
    progress: 0,
    // Document metadata with default values
    documentName: "",
    documentId: currentDocumentId || "default",
    userId: userId || "",
    createdAt: Date.now(),
    lastAccessedAt: Date.now(),
  });

  // Timer reference for tracking page read time
  const pageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save reading progress by calling the AnalyticsService
  const saveProgress = async () => {
    try {
      setIsLoading(true);
      const session = sessionRef.current;

      // Update last accessed timestamp
      session.lastAccessedAt = Date.now();

      // Ensure userId is set
      session.userId = userId || session.userId;

      // Convert Sets to arrays for JSON serialization
      const dataToSave: ReadingAnalytics = {
        currentPage: session.currentPage,
        lastTimestamp: session.lastTimestamp,
        visitedPages: Array.from(session.visitedPages),
        timeSpentPerPage: session.timeSpentPerPage,
        visitedSections: Array.from(session.visitedSections),
        outline: session.outline,
        totalPages: session.totalPages,
        completedPages: Array.from(session.completedPages),
        progress: session.progress,
        documentName: session.documentName,
        documentId: session.documentId,
        userId: session.userId,
        createdAt: session.createdAt,
        lastAccessedAt: session.lastAccessedAt,
      };

      // Save to API using the AnalyticsService
      await AnalyticsService.saveAnalytics(dataToSave);

      // Also save to localStorage for backward compatibility and continue reading feature
      const storageKey = `pdfReadingProgress_${currentDocumentId}`;
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Failed to save reading progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved reading progress from API
  const loadSavedProgress = async () => {
    if (!currentDocumentId || !userId) return;

    try {
      setIsLoading(true);

      // Try to get analytics from API
      const analyticsData = await AnalyticsService.getAnalyticsByDocId(currentDocumentId);

      if (analyticsData) {
        // Restore Set objects from arrays
        sessionRef.current = {
          currentPage: analyticsData.currentPage,
          lastTimestamp: Date.now(),
          visitedPages: new Set(analyticsData.visitedPages),
          timeSpentPerPage: typeof analyticsData.timeSpentPerPage === 'string'
            ? JSON.parse(analyticsData.timeSpentPerPage)
            : analyticsData.timeSpentPerPage,
          visitedSections: new Set(analyticsData.visitedSections),
          outline: analyticsData.outline || [],
          totalPages: analyticsData.totalPages,
          completedPages: new Set(analyticsData.completedPages || []),
          progress: typeof analyticsData.progress === 'string'
            ? parseInt(analyticsData.progress, 10)
            : analyticsData.progress,
          // Metadata
          documentName: analyticsData.documentName || `Document-${currentDocumentId}`,
          documentId: analyticsData.documentId || currentDocumentId,
          userId: userId,
          createdAt: analyticsData.createdAt || Date.now(),
          lastAccessedAt: Date.now(),
        };

        // Set state for continue reading button
        if (analyticsData.currentPage) {
          setSavedPage(analyticsData.currentPage);
        }

        // Update progress
        updateProgress();

        // Save immediately to update the lastAccessedAt timestamp
        await saveProgress();
      } else {
        // Fallback to localStorage if API doesn't have data
        fallbackToLocalStorage();
      }
    } catch (error) {
      console.error("Failed to load saved reading progress from API:", error);
      // Fallback to localStorage if API fails
      fallbackToLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback to localStorage if API fails
  const fallbackToLocalStorage = () => {
    try {
      const storageKey = `pdfReadingProgress_${currentDocumentId}`;
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        const parsedData = JSON.parse(savedData);

        // Restore Set objects from arrays
        sessionRef.current = {
          ...parsedData,
          visitedPages: new Set(parsedData.visitedPages),
          visitedSections: new Set(parsedData.visitedSections),
          completedPages: new Set(parsedData.completedPages || []),
          lastTimestamp: Date.now(),
          lastAccessedAt: Date.now(),
          progress: typeof parsedData.progress === 'string'
            ? parseInt(parsedData.progress, 10)
            : (parsedData.progress || 0),
          // Ensure metadata fields exist
          documentName: parsedData.documentName || `Document-${currentDocumentId}`,
          documentId: parsedData.documentId || currentDocumentId,
          userId: userId || parsedData.userId || "",
          createdAt: parsedData.createdAt || Date.now(),
        };

        // Set state for continue reading button
        if (parsedData.currentPage) {
          setSavedPage(parsedData.currentPage);
        }

        // Update progress
        updateProgress();

        // Save to API
        saveProgress();
      }
    } catch (error) {
      console.error("Failed to load saved reading progress from localStorage:", error);
    }
  };

  // Load saved progress on component mount
  useEffect(() => {
    loadSavedProgress();
  }, [currentDocumentId, userId]);

  // Helper function to format time in a readable way
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const updateProgress = () => {
    const pctProgress = getProgress();
    // Update the progress in the session data
    sessionRef.current.progress = pctProgress;
  };

  const getProgress = () => {
    const session = sessionRef.current;
    if (session.totalPages === 0) return 0;

    // Use completedPages for progress calculation instead of visitedPages
    const pagesRead = session.completedPages.size;
    const calculatedProgress = Math.floor(
      (pagesRead / session.totalPages) * 100
    );

    // Ensure progress never exceeds 100%
    return Math.min(calculatedProgress, 100);
  };

  const findSectionByPage = (
    page: number,
    outline: OutlineItem[]
  ): string | null => {
    for (const item of outline) {
      if (item.dest && item.dest[0]?.num === page) {
        return item.title;
      }

      if (item.items?.length) {
        const found = findSectionByPage(page, item.items);
        if (found) return found;
      }
    }
    return null;
  };

  // Function to mark a page as completed after minimum time
  const startPageReadTimer = (pageNumber: number) => {
    // Clear any existing timer
    if (pageTimerRef.current) {
      clearTimeout(pageTimerRef.current);
    }

    // Set new timer for current page
    pageTimerRef.current = setTimeout(() => {
      const session = sessionRef.current;

      // Mark page as completed
      session.completedPages.add(pageNumber);

      // Update progress
      updateProgress();

      // Save progress
      saveProgress();

      // Clear timer reference
      pageTimerRef.current = null;
    }, MIN_TIME_TO_READ_PAGE);
  };

  useEffect(() => {
    if (!pdfAPI) return;

    const handleDocumentLoaded = async (event: any) => {
      const pdfDocument = event?.source?.pdfViewer?.pdfDocument;

      if (!pdfDocument) {
        console.warn("⚠️ PDF document not found.");
        return;
      }

      sessionRef.current.totalPages = pdfDocument.numPages;

      // Extract document metadata
      try {
        // Get document metadata
        const metadata = await pdfDocument.getMetadata();
        const session = sessionRef.current;

        // Update session with document metadata
        session.documentName =
          metadata?.info?.Title || `Document-${currentDocumentId}`;
        session.documentId = currentDocumentId || "default";
        session.userId = userId || "";
        session.lastAccessedAt = Date.now();

        // Save immediately after loading document metadata
        saveProgress();
      } catch (metadataError) {
        console.error("❌ Failed to fetch document metadata:", metadataError);
      }

      try {
        const outline = await pdfDocument.getOutline();
        if (outline && outline.length > 0) {
          sessionRef.current.outline = outline;
        }
      } catch (error) {
        console.error("❌ Failed to fetch outline:", error);
      }

      // Calculate initial progress
      updateProgress();
    };

    const handlePageChanging = (event: any) => {
      const now = Date.now();
      const newPage = event?.pageNumber;
      const session = sessionRef.current;

      // Clear the previous page timer if it exists
      if (pageTimerRef.current) {
        clearTimeout(pageTimerRef.current);
        pageTimerRef.current = null;
      }

      // Save time on previous page
      if (session.currentPage !== null) {
        const timeSpent = now - session.lastTimestamp;
        session.timeSpentPerPage[session.currentPage] =
          (session.timeSpentPerPage[session.currentPage] || 0) + timeSpent;
      }

      // Track visited page (but don't count it toward progress yet)
      session.visitedPages.add(newPage);
      session.lastTimestamp = now;
      session.currentPage = newPage;

      const section = findSectionByPage(newPage, session.outline);
      if (section) {
        session.visitedSections.add(section);

      }

      // Start timer for this page to be marked as read
      startPageReadTimer(newPage);

      // Update progress percentage
      updateProgress();

      // Save progress
      saveProgress();
    };

    // Register event listeners
    pdfAPI.on("documentloaded", handleDocumentLoaded);
    pdfAPI.on("pagechanging", handlePageChanging);

    // Cleanup event listeners on unmount
    return () => {
      pdfAPI.off("documentloaded", handleDocumentLoaded);
      pdfAPI.off("pagechanging", handlePageChanging);

      // Clear any running timers
      if (pageTimerRef.current) {
        clearTimeout(pageTimerRef.current);
      }

      // Save progress on unmount
      saveProgress();
    };
  }, [pdfAPI, userId]);

  const handleContinueReading = () => {
    if (pdfAPI && savedPage) {
      // Jump to the saved page
      navigationUtils.goToPage(savedPage);
    }
  };

  // Function to display analytics data
  const handleViewAnalytics = async () => {
    try {
      setIsLoading(true);

      // Get analytics from API
      const analyticsData = await AnalyticsService.getAnalyticsByDocId(currentDocumentId || "default");

      if (analyticsData) {
        console.log("PDF Reading Analytics Data:", analyticsData);

        // Calculate time spent reading
        let totalTimeSpent = 0;
        if (typeof analyticsData.timeSpentPerPage === 'string') {
          const timeSpentObj = JSON.parse(analyticsData.timeSpentPerPage);
          totalTimeSpent = Object.values(timeSpentObj).reduce((sum: number, time: number) => sum + time, 0);
        } else {
          totalTimeSpent = Object.values(analyticsData.timeSpentPerPage).reduce((sum: number, time: number) => sum + time, 0);
        }

        // Format dates
        const lastAccessed = new Date(analyticsData.lastAccessedAt).toLocaleString();
        const created = new Date(analyticsData.createdAt || 0).toLocaleString();

        // Progress formatting
        const progressValue = typeof analyticsData.progress === 'string'
          ? parseInt(analyticsData.progress, 10)
          : analyticsData.progress;

        // Show a more readable format in an alert for quick access
        const summary = `
Document Metadata:
  Name: ${analyticsData.documentName || "Unnamed"}
  ID: ${analyticsData.documentId}
  User ID: ${analyticsData.userId || "Not set"}
  Created: ${created}
  Last Accessed: ${lastAccessed}
Reading Progress:
  Current Page: ${analyticsData.currentPage}
  Total Pages: ${analyticsData.totalPages}
  Completed Pages: ${analyticsData.completedPages.length} of ${analyticsData.totalPages}
  Progress: ${progressValue}%
  Total Time Spent: ${formatTime(totalTimeSpent)}
  Visited Sections: ${analyticsData.visitedSections.join(", ") || "None"}
        `;

        alert("Reading Analytics Data:\n" + summary);
      } else {
        // Fallback to localStorage
        handleLogLocalData();
      }
    } catch (error) {
      console.error("Failed to retrieve analytics data:", error);
      // Fallback to localStorage
      handleLogLocalData();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback function to log localStorage data
  const handleLogLocalData = () => {
    try {
      const storageKey = `pdfReadingProgress_${currentDocumentId}`;
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log("LocalStorage PDF Reading Data:", parsedData);

        // Calculate time spent reading
        const totalTimeSpent = Object.values(
          parsedData.timeSpentPerPage || {}
        ).reduce((sum: number, time: number) => sum + time, 0);

        // Format dates
        const lastAccessed = new Date(
          parsedData.lastAccessedAt
        ).toLocaleString();
        const created = new Date(parsedData.createdAt).toLocaleString();

        // Show a more readable format in an alert for quick access
        const summary = `
Document Metadata:
  Name: ${parsedData.documentName || "Unnamed"}
  ID: ${parsedData.documentId}
  User ID: ${parsedData.userId || "Not set"}
  Created: ${created}
  Last Accessed: ${lastAccessed}
Reading Progress:
  Current Page: ${parsedData.currentPage}
  Total Pages: ${parsedData.totalPages}
  Completed Pages: ${parsedData.completedPages.length} of ${parsedData.totalPages
          }
  Progress: ${typeof parsedData.progress === 'string'
            ? parseInt(parsedData.progress, 10)
            : (parsedData.progress || 0)}%
  Total Time Spent: ${formatTime(totalTimeSpent)}
  Visited Sections: ${parsedData.visitedSections.join(", ") || "None"}
        `;

        alert("LocalStorage Reading Data:\n" + summary);
      } else {
        console.log(
          "No saved reading progress found for document ID:",
          currentDocumentId
        );
        alert("No saved reading progress found for this document.");
      }
    } catch (error) {
      console.error("Failed to log reading progress:", error);
      alert("Error retrieving reading progress data.");
    }
  };

  return (
    // <div className="pdf-reading-tools mt-28">
    //   {/* Progress Section */}
    //   <div className="progress-section">
    //     <div className="progress-bar-container">
    //       <div
    //         className="progress-bar"
    //         style={{ width: `${progress}%` }}
    //         title={`${progress}% read`}
    //       />
    //     </div>
    //     <div className="progress-stats">
    //       <span>{progress}% completed</span>
    //       {currentSection && (
    //         <span className="current-section">
    //           Current section: {currentSection}
    //         </span>
    //       )}
    //     </div>
    //   </div>

    //   {/* Continue Reading Button */}
    //   {showContinueReading && savedPage && (
    //     <button
    //       className="continue-reading-btn"
    //       onClick={handleContinueReading}
    //       disabled={isLoading}
    //     >
    //       Continue Reading from Page {savedPage}
    //     </button>
    //   )}

    //   {/* View Analytics Button */}
    //   <button
    //     className="analytics-btn mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
    //     onClick={handleViewAnalytics}
    //     disabled={isLoading}
    //     title="View reading analytics data"
    //   >
    //     {isLoading ? "Loading..." : "View Reading Analytics"}
    //   </button>

    //   {/* Debug Button to Log Local Data */}
    //   <button
    //     className="debug-btn mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded text-sm"
    //     onClick={handleLogLocalData}
    //     disabled={isLoading}
    //     title="View locally stored reading progress data"
    //   >
    //     Debug: View Local Data
    //   </button>
    // </div>
    null
  );
};

export default ContinueReading;