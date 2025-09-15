import { useState, useEffect, useRef } from "react";

const PageUsageTracker = ({
  pdfAPI,
  currentDocumentId = "default",
  userId = "user_123",
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for tracking
  const pageStartTimeRef = useRef(null);
  const currentPageRef = useRef(1);
  const debounceTimeoutRef = useRef(null);
  const pendingPageChangeRef = useRef(null);

  // Update current page ref when state changes
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Auto-start tracking when component loads
  useEffect(() => {
    const currentTime = Date.now();
    pageStartTimeRef.current = currentTime;
    console.log("🎯 Auto-started tracking page usage");
  }, []);

  // Helper function to submit individual page data using multisession endpoint
  const submitPageData = async (pageNumber, timeSpent) => {
    try {
      console.log(`📤 Submitting data for page ${pageNumber}: ${timeSpent}s`);

      // Don't submit if no valid time
      if (timeSpent <= 0) {
        console.log("📭 No valid time to submit (time was 0 or negative)");
        return { success: true, message: "No time to submit" };
      }

      // Format as multisession payload with single page
      const payload = {
        pdfId: currentDocumentId,
        userId: userId,
        pageSessionData: {
          [pageNumber]: timeSpent.toString() // Single page in multisession format
        }
      };

      console.log("📤 Multisession submission payload:", payload);

      const response = await fetch(
        process.env.NEXT_PUBLIC_PDF_BASE_URL + "/dev/v1/pdf/multiple-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error Response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ Page ${pageNumber} data submitted successfully:`, result);

      // Reset timer data after successful submission
      resetTimerData();

      return result;
    } catch (error) {
      console.error(`❌ Failed to submit page ${pageNumber} data:`, error);
      throw error;
    }
  };

  // Reset timer data function
  const resetTimerData = () => {
    pageStartTimeRef.current = Date.now(); // Restart tracking immediately
    console.log("🔄 Timer data reset and tracking restarted");
  };

  // Setup PDF viewer event listeners with debouncing
  useEffect(() => {
    if (!pdfAPI) return;

    const handlePageChanging = (e) => {
      const newPageNumber = e.pageNumber;

      console.log(`⏳ Page change detected: ${newPageNumber} (debouncing...)`);

      // Clear any existing debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        console.log("🔄 Cleared previous debounce timeout");
      }

      // Store the pending page change
      pendingPageChangeRef.current = {
        pageNumber: newPageNumber,
        timestamp: Date.now()
      };

      // Set new debounce timeout - this will be reset if another page change occurs
      debounceTimeoutRef.current = setTimeout(() => {
        processPageChange(pendingPageChangeRef.current);
        pendingPageChangeRef.current = null;
        debounceTimeoutRef.current = null;
      }, 2000); // 2 seconds debounce
    };

    const processPageChange = async (pageChangeData) => {
      if (!pageChangeData) return;

      const { pageNumber: newPageNumber, timestamp: changeTime } = pageChangeData;

      // Calculate and submit time for previous page
      if (pageStartTimeRef.current && currentPageRef.current) {
        const timeSpent = Math.round(
          (changeTime - pageStartTimeRef.current) / 1000
        );

        console.log(`📖 Processing page ${currentPageRef.current}: ${timeSpent}s`);

        if (timeSpent > 0) {
          setIsSubmitting(true);
          try {
            await submitPageData(currentPageRef.current, timeSpent);
          } catch (error) {
            console.error(`❌ Failed to submit data for page ${currentPageRef.current}:`, error);
          } finally {
            setIsSubmitting(false);
          }
        }
      }

      // Update current page and start time for new page
      setCurrentPage(newPageNumber);
      pageStartTimeRef.current = changeTime;
      console.log(`📄 Confirmed switch to page ${newPageNumber}`);
    };

    pdfAPI.on("pagechanging", handlePageChanging);

    return () => {
      pdfAPI.off("pagechanging", handlePageChanging);

      // Clear debounce timeout on cleanup
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }

      // Process any pending page change immediately on cleanup
      if (pendingPageChangeRef.current) {
        processPageChange(pendingPageChangeRef.current);
      }
    };
  }, [pdfAPI, currentDocumentId, userId]);

  // Auto-submit when component unmounts or page unloads
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Process any pending page change immediately before unload
      if (pendingPageChangeRef.current) {
        const { pageNumber: newPageNumber, timestamp: changeTime } = pendingPageChangeRef.current;

        // Calculate time for previous page
        if (pageStartTimeRef.current && currentPageRef.current) {
          const timeSpent = Math.round((changeTime - pageStartTimeRef.current) / 1000);

          if (timeSpent > 0) {
            // Submit current page data via sendBeacon using multisession format
            const payload = {
              pdfId: currentDocumentId,
              userId: userId,
              pageSessionData: {
                [currentPageRef.current]: timeSpent.toString()
              }
            };

            console.log("📤 Auto-submitting current page data on unload:", payload);

            const blob = new Blob([JSON.stringify(payload)], {
              type: 'application/json'
            });

            const success = navigator.sendBeacon(
              process.env.NEXT_PUBLIC_PDF_BASE_URL + "/dev/v1/pdf/multiple-session",
              blob
            );

            if (success) {
              console.log(`✅ Auto-submitted page ${currentPageRef.current} data on unload`);
            } else {
              console.error(`❌ Failed to submit page ${currentPageRef.current} data via sendBeacon`);
            }
          }
        }

        // Update refs for the new page
        currentPageRef.current = newPageNumber;
        pageStartTimeRef.current = changeTime;
      }

      // Also submit the current page if no pending change
      if (!pendingPageChangeRef.current && pageStartTimeRef.current && currentPageRef.current) {
        const currentTime = Date.now();
        const timeSpent = Math.round((currentTime - pageStartTimeRef.current) / 1000);

        if (timeSpent > 0) {
          const payload = {
            pdfId: currentDocumentId,
            userId: userId,
            pageSessionData: {
              [currentPageRef.current]: timeSpent.toString()
            }
          };

          console.log("📤 Auto-submitting final page data on unload:", payload);

          const blob = new Blob([JSON.stringify(payload)], {
            type: 'application/json'
          });

          const success = navigator.sendBeacon(
            process.env.NEXT_PUBLIC_PDF_BASE_URL + "/dev/v1/pdf/multiple-session",
            blob
          );

          if (success) {
            console.log(`✅ Auto-submitted final page ${currentPageRef.current} data on unload`);
          } else {
            console.error(`❌ Failed to submit final page ${currentPageRef.current} data via sendBeacon`);
          }
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Clear any pending debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Also submit on component unmount
      handleBeforeUnload();
    };
  }, [currentDocumentId, userId]);

  // Return minimal component (no UI as requested)
  return null;
};

export default PageUsageTracker;