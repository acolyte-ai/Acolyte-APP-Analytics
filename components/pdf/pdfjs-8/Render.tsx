// "use client";

// import { useRef, useEffect, useState, useCallback } from "react";
// import { documentUtils, getPDFViewerAPI, zoomUtils } from "../utils/pdf-utils";
// import PDFSearch from "./PDFSearch";
// import { useCachedPdf } from "../pdfjs-5/useCachedPdf";
// import { useSettings } from "@/context/store";
// import PageInverter from "../pdfjs-5/PageInverter";

// import PDFHighlighter from "../pdfcomponents/PDFHighlighter";
// // import { ContinueReading } from "../StudyDashboard";
// import PageUsageTracker from "@/components/PDFViewer/analytics/PageUsageTracker";
// import { TrainAiNotification } from "../pdf-opti/train-confirm";
// import FlashcardGenerator from "@/components/flashcards/flashcard/FlashcardGenerator";
// import ContinueReading from "@/components/PDFViewer/analytics/ContinueReading";
// import { useUpdateLearningToolTime } from "@/hooks/useUpdateLearningToolTime";
// // import { ContinueReading } from "@/components/FileSystem/StudyDashboard";



// export default function PDFViewer({ id, userId }) {
//   const iframeRef = useRef(null);

//   // Use the cached PDF hook to get PDF blob data
//   const { isPdfLoaded, pdfBlobUrl, isLoading, loadingProgress, error } =
//     useCachedPdf({ id, userId });

//   // Get search visibility setting
//   const {
//     isSearchVisible,
//     activeTool,
//     setScale,
//     isScreenShotEnable,
//     setIsScreenShotEnable,
//     PdfIframeRef,
//     setPdfIframeRef,
//     setCurrentPage,
//     currentPage,
//     setComposerInsertText,
//     setViewMode,
//     viewMode,
//     setSplitViewMode,
//     setData,
//     isToolBarCollapsed,
//     currentDocumentId,
//     showAITrainModal,
//     setshowAITrainModal,
//     setTotalPages,
//     setFooterVisible,
//     setisHeadderVisible,
//     setisExpanded,
//     currentTopic,
//     setCurrentTopic,
//     setMode,
//     mode,
//   } = useSettings();

//   // const [currentTopic, setCurrentTopic] = useState("");
//   const [generatedFlashcard, setGeneratedFlashcard] =
//     useState<FlashcardData | null>(null);

//   // State variables to track PDF viewer status and settings
//   const [isReady, setIsReady] = useState(false);
//   const [isViewerLoading, setIsViewerLoading] = useState(true);
//   const [pdfUrl, setPdfUrl] = useState(null);
//   const [isIOS, setIsIOS] = useState(false);
//   const [documentInfo, setDocumentInfo] = useState(null);
//   const [pdfApi, setPdfApi] = useState(null);

//   // Search state
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchInfo, setSearchInfo] = useState({ current: 0, total: 0 });
//   const [isSearchActive, setIsSearchActive] = useState(false);
//   const [searchOptions, setSearchOptions] = useState({
//     caseSensitive: false,
//     entireWord: false,
//     highlightAll: true,
//     matchDiacritics: true,
//   });

//   // const iframeRef = useRef(null);
//   const [isIOSs, setIsIOSs] = useState(false);
//   const { updateLearningToolTime } = useUpdateLearningToolTime(userId);


//   useEffect(() => {
//     if (viewMode == "single") {
//       setMode("pdf");
//     }
//   }, [viewMode, mode]);
//   useEffect(() => {
//     const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
//     setIsIOSs(checkIOS);

//     // Configure PDF viewer after load
//     const iframe = iframeRef.current;
//     if (iframe) {
//       iframe.onload = () => {
//         try {
//           const pdfWindow = iframe.contentWindow;
//           if (pdfWindow && pdfWindow.PDFViewerApplication) {
//             // Set initial scale to fit width
//             pdfWindow.PDFViewerApplication.eventBus.on("pagesinit", () => {
//               pdfWindow.PDFViewerApplication.pdfViewer.currentScaleValue =
//                 "page-width";
//             });
//           }
//         } catch (error) {
//           console.warn("Could not configure PDF viewer:", error);
//         }
//       };
//     }
//   }, []);

//   useEffect(() => {
//     if (!(viewMode === "single" && isToolBarCollapsed)) {
//       setData({});
//     } else {
//       setData(null);
//     }
//   }, [viewMode, isToolBarCollapsed, setData]);

//   // Function to trigger flashcard generation with a specific topic
//   const generateFlashcardForTopic = (topic: string) => {
//     setCurrentTopic(topic);
//   };

//   // Handle when a flashcard is generated
//   const handleFlashcardGenerated = (flashcard: FlashcardData) => {
//     setGeneratedFlashcard(flashcard);
//     console.log("Flashcard was generated:", flashcard);
//     // You could update UI or notify user here if needed
//   };

//   // Handle when a flashcard is stored
//   const handleFlashcardStored = () => {
//     setGeneratedFlashcard(null);
//     setCurrentTopic("");
//     console.log("Flashcard was stored successfully");
//     // You could update UI or notify user here if needed
//   };

//   // useEffect(()=>{
//   // if(!activeTool?.id) return

//   // if(!(activeTool.id=="hilighter" || activeTool.id=="rectanglesclection") && isToolBarCollapsed){
//   //   setActiveTool({id:""})
//   // }
//   // },[activeTool?.id])

//   // Annotation state
//   const [annotationMode, setAnnotationMode] = useState(0);

//   const [showCustomPopup, setShowCustomPopup] = useState(false);
//   const [popupData, setPopupData] = useState({
//     text: "",
//     position: { x: 0, y: 0 },
//   });

//   // This function will be called by the IOSSelectionHelper when text is selected
//   const handleSelection = ({ text, rect }) => {
//     setPopupData({
//       text,
//       position: {
//         x: rect.left,
//         y: rect.top - 45, // Position above the selection
//       },
//     });
//     setShowCustomPopup(true);
//   };



//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (!PdfIframeRef) return;
//       console.log(PdfIframeRef);
//       zoomUtils.zoomToWidth(PdfIframeRef);
//     }, 2000); // 2 minutes in milliseconds

//     return () => clearTimeout(timer); // Cleanup on unmount
//   }, [PdfIframeRef]);

//   useEffect(() => {
//     if (!activeTool) return;

//     if (activeTool?.id === "rectangleSelection") {
//       setIsScreenShotEnable(true);
//     }
//     if (activeTool?.id === "highlighter") {
//       const api = getPDFViewerAPI(iframeRef);
//       if (api) {
//         // Let the PDF viewer API handle the toggle logic
//         const result = api.toggleHighlight(false);
//         // Update React state based on the actual result from the API
//         setAnnotationMode(result);
//       }
//     } else {
//       const api = getPDFViewerAPI(iframeRef);
//       if (api) {
//         // Let the PDF viewer API handle the toggle logic
//         const result = api.toggleHighlight();
//         // Update React state based on the actual result from the API
//         setAnnotationMode(result);
//       }
//     }
//   }, [activeTool]);

//   useEffect(() => {
//     if (isViewerLoading) return;
//     if (!pdfUrl) return;

//     // Create the viewer URL with the PDF file parameter
//     let viewerUrl = "/generic/web/viewer.html";

//     // Add PDF URL if provided
//     if (pdfUrl) {
//       viewerUrl += `?file=${encodeURIComponent(pdfUrl)}`;
//       console.log(pdfUrl);
//     }
//     //
//     // Set iframe source
//     if (iframeRef.current) {
//       iframeRef.current.src = viewerUrl;
//       setPdfIframeRef(iframeRef);
//     }
//   }, [isViewerLoading, pdfBlobUrl, isPdfLoaded, pdfUrl]);

//   // Initialize PDF viewer when component mounts
//   useEffect(() => {
//     // Check if device is iOS
//     const userAgent = window.navigator.userAgent.toLowerCase();
//     const iOS = /ipad|iphone|ipod/.test(userAgent);
//     setIsIOS(iOS);

//     // If pdfBlobUrl is provided, use it, otherwise fall back to URL params or default
//     if (pdfBlobUrl && isPdfLoaded) {
//       setPdfUrl(pdfBlobUrl);
//     } else {
//       // Example: Set a PDF URL (you could get this from router params or props)
//       const url = new URL(window.location.href);
//       const pdfParam = url.searchParams.get("pdf");
//       // setPdfUrl(pdfParam);
//     }

//     // Prevent window zooming
//     const preventZoom = (e) => {
//       // Allow zooming inside the iframe
//       if (e.target.closest("iframe")) {
//         return true;
//       }

//       // Prevent zooming on the main window
//       if (e.ctrlKey || e.metaKey) {
//         e.preventDefault();
//         return false;
//       }
//     };

//     // Add event listeners to prevent zooming
//     document.addEventListener("wheel", preventZoom, { passive: false });
//     document.addEventListener("keydown", (e) => {
//       if (
//         (e.ctrlKey || e.metaKey) &&
//         (e.key === "+" || e.key === "-" || e.key === "0")
//       ) {
//         if (!e.target.closest("iframe")) {
//           e.preventDefault();
//         }
//       }
//     });

//     // Add touch event listeners to prevent pinch zoom on mobile (outside iframe)
//     document.addEventListener(
//       "touchstart",
//       (e) => {
//         if (e.touches.length > 1 && !e.target.closest("iframe")) {
//           e.preventDefault();
//         }
//       },
//       { passive: false }
//     );

//     setIsViewerLoading(false);

//     return () => {
//       document.removeEventListener("wheel", preventZoom);
//       document.removeEventListener("keydown", preventZoom);
//       document.removeEventListener("touchstart", preventZoom);
//     };
//   }, [isPdfLoaded, pdfBlobUrl]);

//   // Initialize PDF viewer when iframe loads
//   useEffect(() => {
//     if (isViewerLoading) return;

//     const initializeViewer = () => {
//       const iframe = iframeRef.current;
//       if (!iframe) return;

//       const handleIframeLoad = () => {
//         const api = getPDFViewerAPI(iframeRef);
//         if (!api) {
//           console.log("PDF Viewer API not ready yet, retrying...");
//           setTimeout(handleIframeLoad, 500);
//           return;
//         }
//         setPdfApi(api);
//         console.log("=======>", api);
//         // Set up message listener from iframe
//         window.addEventListener("message", handleIframeMessage);

//         // Enable iOS-specific optimizations
//         if (isIOS) {
//           api.enableIOSZoom();
//         }

//         // Add event listeners for PDF document changes
//         api.goToPage(currentPage);
//         api.on("documentloaded", (e) => {
//           console.log("event", e);
//           setTotalPages(e.source.pagesCount);
//           handleDocumentLoaded();
//         });
//         api.on("updatefindmatchescount", handleSearchResultsUpdated);
//         api.on("switchannotationeditormode", handleAnnotationModeChanged);
//         api.on("scalechanging", handleScaleChange);
//         api.on("pagechanging", (e) => {
//           console.log(e);
//           setCurrentPage(e.pageNumber);
//         });

//         // Load the PDF if we have a URL
//         if (pdfUrl) {
//           // api.loadDocument(pdfUrl);
//         }

//         setIsReady(true);
//       };

//       iframe.addEventListener("load", handleIframeLoad);

//       return () => {
//         window.removeEventListener("message", handleIframeMessage);
//         iframe.removeEventListener("load", handleIframeLoad);

//         // Clean up event listeners when component unmounts
//         const api = getPDFViewerAPI(iframeRef);

//         if (api) {
//           api.off("documentloaded", handleDocumentLoaded);
//           api.off("updatefindmatchescount", handleSearchResultsUpdated);
//           api.off("switchannotationeditormode", handleAnnotationModeChanged);
//           api.off("scalechanging", handleScaleChange);
//           api.off("pagechanging", (e) => {
//             console.log(e);
//           });
//         }
//       };
//     };

//     initializeViewer();
//   }, [isViewerLoading, isIOS, pdfUrl]);

//   useEffect(() => {
//     if (!isReady || !iframeRef.current) return;

//     const setupScreenshotTool = () => {
//       const iframe = iframeRef.current;
//       const contentWindow = iframe.contentWindow;

//       // Send message to PDF viewer iframe to start selection mode
//       contentWindow.postMessage(
//         {
//           type: "start-pdf-screenshot",
//         },
//         "*"
//       );
//     };

//     const stopScreenshotTool = () => {
//       const iframe = iframeRef.current;
//       const contentWindow = iframe.contentWindow;

//       // Send message to PDF viewer iframe to stop selection mode
//       contentWindow.postMessage(
//         {
//           type: "stop-pdf-screenshot",
//         },
//         "*"
//       );
//     };

//     // Toggle based on isScreenShotEnable
//     if (isScreenShotEnable) {
//       setupScreenshotTool();
//     } else {
//       stopScreenshotTool();
//     }

//     // Add event listener for screenshot data from iframe
//     const handleScreenshotMessage = (event) => {
//       const { type, data } = event.data || {};

//       if (type === "pdf-screenshot-capture") {
//         // Handle the screenshot data
//         const screenshotData = {
//           url: data.url,
//           bounds: data.bounds,
//           added: data.added,
//         };
//         setData(screenshotData);

//         // Communicate with parent or use the data as needed

//         // Disable screenshot mode after capture
//         setIsScreenShotEnable(false);
//       } else if (type === "pdf-screenshot-error") {
//         console.error("Screenshot error:", data.error);
//         setIsScreenShotEnable(false);
//       } else if (type === "pdf-screenshot-mode-ended") {
//         setIsScreenShotEnable(false);
//       }
//     };

//     window.addEventListener("message", handleScreenshotMessage);

//     return () => {
//       window.removeEventListener("message", handleScreenshotMessage);
//     };
//   }, [isReady, isScreenShotEnable, iframeRef]);

//   // Event handlers for PDF viewer events
//   const handleIframeMessage = useCallback((event) => {
//     // Handle any post messages from the iframe (if needed)
//     const { type, data } = event.data || {};

//     if (!type) return;

//     switch (type) {
//       case "searchUpdate":
//         setSearchInfo(data);
//         break;

//       case "generateFlashCard":
//         console.log("genrating flasj card");
//         generateFlashcardForTopic(data.text);

//         break;

//       case "pdfTextSelection":
//         console.log(type, data);
//         setComposerInsertText(`Explain me: ${data.text}`);
//         setViewMode("double");
//         setSplitViewMode("chat");

//         break;
//       case "annotationModeChange":
//         if (data && typeof data.mode === "number") {
//           setAnnotationMode(data.mode);
//         }
//         break;
//       default:
//         break;
//     }
//   }, []);

//   const handleScaleChange = (event) => {
//     if (!event.scale) return;
//     setScale(event.scale);
//   };

//   const handleDocumentLoaded = useCallback(() => {
//     const api = getPDFViewerAPI(iframeRef);
//     if (!api) return;

//     const info = api.getDocumentInfo();
//     setDocumentInfo(info);

//     const mode = api.getAnnotationEditorMode();
//     setAnnotationMode(mode);

//     console.log("PDF document loaded:", info);
//   }, []);

//   const handleSearchResultsUpdated = useCallback((evt) => {
//     const current =
//       typeof evt.matchesCount?.current === "number"
//         ? evt.matchesCount.current
//         : 0;
//     const total =
//       typeof evt.matchesCount?.total === "number" ? evt.matchesCount.total : 0;
//     setSearchInfo({ current, total });
//   }, []);

//   const handleAnnotationModeChanged = useCallback((evt) => {
//     if (evt && typeof evt.mode === "number") {
//       setAnnotationMode(evt.mode);
//     }
//   }, []);

//   // Search handlers
//   const handleSearch = useCallback(
//     (query) => {
//       const api = getPDFViewerAPI(iframeRef);
//       if (!api) {
//         console.error("PDF Viewer API not available");
//         return;
//       }

//       if (!query) {
//         api.clearSearch();
//         setIsSearchActive(false);
//         setSearchInfo({ current: 0, total: 0 });
//       } else {
//         try {
//           api.search(query, searchOptions);
//           setIsSearchActive(true);
//         } catch (error) {
//           console.error("Search error:", error);
//           alert("Unable to perform search");
//         }
//       }
//       setSearchQuery(query);
//     },
//     [searchOptions]
//   );

//   // Clear highlights when search visibility is toggled off
//   useEffect(() => {
//     if (!isSearchVisible) {
//       const api = getPDFViewerAPI(iframeRef);
//       if (api) {
//         api.clearSearch();
//         setIsSearchActive(false);
//         setSearchInfo({ current: 0, total: 0 });
//         setSearchQuery("");
//       }
//     }
//   }, [isSearchVisible]);

//   const handleSearchNext = useCallback(() => {
//     const api = getPDFViewerAPI(iframeRef);
//     if (api && isSearchActive) {
//       try {
//         api.findNext();
//       } catch (error) {
//         console.error("Error finding next:", error);
//       }
//     }
//   }, [isSearchActive]);

//   const handleSearchPrevious = useCallback(() => {
//     const api = getPDFViewerAPI(iframeRef);
//     if (api && isSearchActive) {
//       try {
//         api.findPrevious();
//       } catch (error) {
//         console.error("Error finding previous:", error);
//       }
//     }
//   }, [isSearchActive]);

//   const toggleSearchOption = useCallback(
//     (option, value) => {
//       setSearchOptions((prev) => {
//         const newOptions = {
//           ...prev,
//           [option]: value !== undefined ? value : !prev[option],
//         };

//         // Refresh search with new options if we have an active search
//         if (searchQuery) {
//           const api = getPDFViewerAPI(iframeRef);
//           if (api) api.search(searchQuery, newOptions);
//         }

//         return newOptions;
//       });
//     },
//     [searchQuery]
//   );

//   useEffect(() => {
//     if (!iframeRef) return;
//     const scale = documentUtils.getCurrentZoom(iframeRef);
//   }, [isScreenShotEnable, setScale]);

//   useEffect(() => {
//     const handleEscapeKey = (e) => {
//       if (e.key === "Escape") {
//         setFooterVisible(true);
//         setisHeadderVisible(true);
//         setisExpanded(false);
//       }
//     };
//     document.addEventListener("keydown", handleEscapeKey);
//     return () => {
//       document.removeEventListener("keydown", handleEscapeKey);
//     };
//   }, []);

//   // updating the pdf reader usage time -> have to convert into a hook later

//   const startTimeRef = useRef(null);

//   // Record the start time when component mounts
//   useEffect(() => {
//     startTimeRef.current = Date.now();

//     return () => {
//       const endTime = Date.now();
//       const timeSpentInSeconds = Math.floor(
//         (endTime - startTimeRef.current) / 1000
//       );
//       updateLearningToolTime("chatbotTime", timeSpentInSeconds);
//     };
//   }, []);




//   // Show loading state if PDF is still being loaded from cache
//   if (isLoading) {
//     return (
//       <div className="w-full h-screen flex flex-col items-center justify-center">
//         <p>
//           Loading PDF...{" "}
//           {loadingProgress ? `${Math.round(loadingProgress)}%` : ""}
//         </p>
//         {error && <p className="text-red-500 mt-2">Error: {error}</p>}
//       </div>
//     );
//   }

//   if (isViewerLoading) {
//     return (
//       <div className="w-full h-screen flex items-center justify-center">
//         Loading PDF Viewer...
//       </div>
//     );
//   }

//   return (
//     <div className={`flex flex-col h-auto overflow-hidden rounded-2xl `}>
//       <PageInverter />
//       {/* <ContinueReading pdfAPI={pdfApi} currentDocumentId={currentDocumentId} /> */}
//       <PageUsageTracker pdfAPI={pdfApi} currentDocumentId={currentDocumentId} userId={userId} />

//       <PDFHighlighter
//         documentId={currentDocumentId}
//         iframeRef={iframeRef}
//         isReady={isReady}
//         userId={userId}
//       />

//       {showAITrainModal && (
//         <div style={{ zIndex: 50 }}>
//           <TrainAiNotification
//             openTrainModal={true}
//             setopenTrainModal={setshowAITrainModal}
//           />
//         </div>
//       )}

//       {currentTopic && (
//         <FlashcardGenerator
//           topic={currentTopic}
//           onFlashcardGenerated={handleFlashcardGenerated}
//           onFlashcardStored={handleFlashcardStored}
//         />
//       )}

//       {/* Search component - only show if search is visible */}
//       {isSearchVisible && (
//         <PDFSearch
//           searchQuery={searchQuery}
//           handleSearch={handleSearch}
//           isSearchActive={isSearchActive}
//           searchInfo={searchInfo}
//           handleSearchPrevious={handleSearchPrevious}
//           handleSearchNext={handleSearchNext}
//           searchOptions={searchOptions}
//           toggleSearchOption={toggleSearchOption}
//         />
//       )}

//       {/* Status bar */}
//       {/* <PDFStatusBar
//         documentInfo={documentInfo}
//         annotationMode={annotationMode}
//       /> */}

//       {/* <div className={`flex-grow relative  `} >
//           <iframe
//             ref={iframeRef}
//             id="pdf-viewer-iframe"
//             title="PDF Viewer"
//             src={"/generic/web/viewer.html"}
//             className="w-full h-full  "
//             style={{
//               border: "none",
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               WebkitOverflowScrolling: isIOSs ? "touch" : "auto",

//             }}
//             allow="fullscreen"
//             allowFullScreen={true}
//             gesture="media"

//           />
//         </div> */}

//       <div
//         className={`flex-grow w-full relative min-h-screen mt-24
//           }  `}
//       >
//         <iframe
//           ref={iframeRef}
//           id="pdf-viewer-iframe"
//           title="PDF Viewer"
//           src="/generic/web/viewer.html#zoom=page-width"
//           className="w-full h-full  pb-40"
//           style={{
//             border: "none",
//             position: "absolute",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             width: "100%",
//             height: "100%",
//             WebkitOverflowScrolling: isIOSs ? "touch" : "auto",
//             // Ensure proper scaling
//             // transform: "scale(1)",
//             transformOrigin: "0 0",
//           }}
//           allow="fullscreen"
//           allowFullScreen={true}
//           gesture="media"
//         />
//       </div>

//       {/* <PDFSelectionMenu /> */}

//       {/* The selection helper component */}
//       <IOSSelectionHelper
//         iframeRef={iframeRef}
//         isReady={isReady}
//         onSelection={handleSelection}
//       />

//       {/* Add global styles for highlights and zoom prevention */}
//       <style jsx global>{`
//         html {
//           touch-action: manipulation;
//         }
//         body {
//           touch-action: pan-x pan-y;
//           overscroll-behavior: none;
//         }
//         .pdf-search-highlight {
//           position: absolute;
//           pointer-events: none;
//           transition: background-color 0.2s ease;
//           z-index: 1;
//         }
//         .current-highlight {
//           box-shadow: 0 0 4px rgba(255, 152, 0, 0.5);
//         }
//         .textLayer {
//           position: relative;
//         }
//       `}</style>
//     </div>
//   );
// }

// const IOSSelectionHelper = ({ iframeRef, isReady, onSelection }) => {
//   const [logs, setLogs] = useState([]);
//   const selectionRef = useRef(null);
//   const isProcessingRef = useRef(false);
//   const selectionRangeRef = useRef(null);
//   const popupDismissalTimerRef = useRef(null);

//   // Custom logging function
//   const logWithStorage = (message, data) => {
//     const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
//     const logEntry = `[${timestamp}] ${message}${data ? ": " + JSON.stringify(data) : ""
//       }`;
//     console.log(message, data || "");
//     setLogs((prevLogs) => [...prevLogs, logEntry]);
//   };

//   const handleCopyLogs = () => {
//     const logText = logs.join("\n");
//     navigator.clipboard
//       .writeText(logText)
//       .then(() => alert("Logs copied to clipboard!"))
//       .catch((err) => {
//         console.error("Failed to copy logs:", err);
//         alert("Failed to copy logs. See console for details.");
//       });
//   };

//   const clearLogs = () => {
//     setLogs([]);
//     logWithStorage("Logs cleared");
//   };

//   // Dismiss iOS popup but keep the selection highlighted
//   const dismissIOSPopup = () => {
//     if (!selectionRef.current || isProcessingRef.current) return;

//     logWithStorage(
//       "Attempting to dismiss iOS popup while preserving selection"
//     );
//     isProcessingRef.current = true;

//     try {
//       const iframe = iframeRef.current;
//       const win = iframe.contentWindow;
//       const doc = win.document;
//       const sel = win.getSelection();

//       if (sel && sel.rangeCount > 0) {
//         // Save the current range before removing it
//         const currentRange = sel.getRangeAt(0).cloneRange();
//         selectionRangeRef.current = currentRange;

//         // Clear selection to dismiss iOS popup
//         sel.removeAllRanges();
//         logWithStorage("Selection temporarily cleared to dismiss popup");

//         // Wait a short time for iOS to process the dismissal
//         setTimeout(() => {
//           try {
//             // Restore the selection
//             sel.addRange(selectionRangeRef.current);
//             logWithStorage("Selection restored after popup dismissal");

//             // Highlight the selection with a custom style
//             const highlightSelection = () => {
//               try {
//                 // Create an element to overlay the selection
//                 const range = sel.getRangeAt(0);
//                 const rect = range.getBoundingClientRect();

//                 // Call the callback with selection info if provided
//                 if (onSelection && typeof onSelection === "function") {
//                   onSelection({
//                     text: selectionRef.current.text,
//                     rect: {
//                       left: rect.left + iframe.offsetLeft,
//                       top: rect.top + iframe.offsetTop,
//                       width: rect.width,
//                       height: rect.height,
//                     },
//                   });
//                   logWithStorage("Selection callback triggered with data");
//                 }
//               } catch (err) {
//                 logWithStorage("Error highlighting selection:", err.message);
//               }
//             };

//             // Execute highlighting
//             highlightSelection();
//           } catch (err) {
//             logWithStorage("Error restoring selection:", err.message);
//           }

//           isProcessingRef.current = false;
//         }, 150);
//       }
//     } catch (err) {
//       logWithStorage("Error in dismissIOSPopup:", err.message);
//       isProcessingRef.current = false;
//     }
//   };

//   useEffect(() => {
//     if (!isReady || !iframeRef.current) return;

//     const iframe = iframeRef.current;
//     const win = iframe.contentWindow;
//     const doc = win.document;

//     logWithStorage("IOSSelectionHelper mounted, iframe ready:", !!iframe);

//     // Handle touch events for iOS
//     const handleTouchStart = (event) => {
//       // Clear any pending dismissal timer
//       if (popupDismissalTimerRef.current) {
//         clearTimeout(popupDismissalTimerRef.current);
//         popupDismissalTimerRef.current = null;
//       }
//       logWithStorage("Touch start detected");
//     };

//     const handleTouchEnd = (event) => {
//       // Delay to allow iOS to process the selection
//       setTimeout(() => {
//         const sel = win.getSelection();
//         const text = sel ? sel.toString().trim() : "";

//         if (text && text.length > 0) {
//           logWithStorage("Selection detected on touch end:", text);

//           // Store selection info
//           selectionRef.current = {
//             text,
//             selection: sel,
//           };

//           // Let iOS show its popup, then automatically dismiss it after a delay
//           logWithStorage("iOS popup should appear now, will auto-dismiss");

//           // Auto-dismiss after a delay to let the iOS popup appear
//           popupDismissalTimerRef.current = setTimeout(() => {
//             dismissIOSPopup();
//           }, 500); // 500ms delay to ensure popup has time to appear
//         } else {
//           selectionRef.current = null;
//           selectionRangeRef.current = null;
//         }
//       }, 100);
//     };

//     // Add listeners for iOS touches
//     doc.addEventListener("touchstart", handleTouchStart, { passive: true });
//     doc.addEventListener("touchend", handleTouchEnd);

//     // Also handle mouse events for testing on desktop
//     const handleMouseUp = (event) => {
//       // Similar logic for desktop testing
//       setTimeout(() => {
//         const sel = win.getSelection();
//         const text = sel ? sel.toString().trim() : "";

//         if (text && text.length > 0 && !selectionRef.current) {
//           logWithStorage("Selection detected on mouse up:", text);

//           // Store selection info
//           selectionRef.current = {
//             text,
//             selection: sel,
//           };

//           // Auto-dismiss after a delay (for testing on desktop)
//           popupDismissalTimerRef.current = setTimeout(() => {
//             dismissIOSPopup();
//           }, 500);
//         }
//       }, 100);
//     };

//     doc.addEventListener("mouseup", handleMouseUp);

//     // Manual dismiss button for testing
//     const button = document.createElement("button");
//     button.textContent = "Manual Dismiss";
//     button.style.position = "fixed";
//     button.style.bottom = "100px";
//     button.style.left = "10px";
//     button.style.zIndex = "10000";
//     button.style.padding = "8px";
//     button.style.backgroundColor = "#007AFF";
//     button.style.color = "white";
//     button.style.border = "none";
//     button.style.borderRadius = "5px";
//     button.addEventListener("click", dismissIOSPopup);
//     // document.body.appendChild(button);

//     logWithStorage("Event listeners attached for iOS");

//     return () => {
//       doc.removeEventListener("touchstart", handleTouchStart);
//       doc.removeEventListener("touchend", handleTouchEnd);
//       doc.removeEventListener("mouseup", handleMouseUp);
//       // document.body.removeChild(button);

//       if (popupDismissalTimerRef.current) {
//         clearTimeout(popupDismissalTimerRef.current);
//       }

//       logWithStorage("IOSSelectionHelper unmounting");
//     };
//   }, [isReady, iframeRef, onSelection]);

//   return null;
// };


"use client";

import { useState, useEffect, useRef } from "react";
import PDFSearch from "./PDFSearch";
import { useCachedPdf } from "../pdfjs-5/useCachedPdf";
import { useSettings } from "@/context/store";
import PageInverter from "../pdfjs-5/PageInverter";
import PDFHighlighter from "../pdfcomponents/PDFHighlighter";
import PageUsageTracker from "@/components/PDFViewer/analytics/PageUsageTracker";
import { TrainAiNotification } from "../pdf-opti/train-confirm";
import FlashcardGenerator from "@/components/flashcards/flashcard/FlashcardGenerator";
import { usePDFViewer } from "@/hooks/usePDFViewer";
import { usePDFHighlighter } from "@/hooks/usePDFHighlighter";
import { FlashcardData } from "@/components/flashcards/services/flashcardService";

export default function PDFViewer({ id, userId }) {
  const { isPdfLoaded, pdfBlobUrl, isLoading, loadingProgress, error } = useCachedPdf({ id, userId });


  const {
    isSearchVisible,
    currentDocumentId,
    currentDocument,
    setcurrentDocument,
    showAITrainModal,
    setshowAITrainModal,
    currentTopic,
    setCurrentTopic,
    currentChunk,
    setisSearchVisible
  } = useSettings();



  const {
    iframeRef,
    isReady,
    isViewerLoading,
    pdfApi,
    searchQuery,
    searchInfo,
    isSearchActive,
    searchOptions,
    handleSearch,
    handleSearchNext,
    handleSearchPrevious,
    toggleSearchOption,
  } = usePDFViewer({ id, userId, isPdfLoaded, pdfBlobUrl });

  const [generatedFlashcard, setGeneratedFlashcard] = useState(null);
  const navigateToChunk = usePDFHighlighter(pdfApi, iframeRef);


  useEffect(() => {
    if (!currentChunk) return;
    navigateToChunk(currentChunk);
  }, [currentChunk])





  // Flashcard handlers
  const handleFlashcardGenerated = (flashcard) => {
    setGeneratedFlashcard(flashcard);
    // console.log("Flashcard was generated:", flashcard);
  };

  // console.log("currentDocumebt", currentDocument)

  // Show loading state if PDF is still being loaded from cache
  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <p>
          Loading PDF...{" "}
          {loadingProgress ? `${Math.round(loadingProgress)}%` : ""}
        </p>
        {error && <p className="text-red-500 mt-2">Error: {error}</p>}
      </div>
    );
  }

  if (isViewerLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading PDF Viewer...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-auto overflow-hidden rounded-2xl">
      <PageInverter />

      <PageUsageTracker
        pdfAPI={pdfApi}
        currentDocumentId={currentDocumentId}
        userId={userId}
      />

      <PDFHighlighter
        documentId={currentDocumentId}
        iframeRef={iframeRef}
        isReady={isReady}
        userId={userId}
        fileName={currentDocument?.title}
        subject={currentDocument?.parentId}
      />

      {showAITrainModal && (
        <div style={{ zIndex: 50 }}>
          <TrainAiNotification
            openTrainModal={true}
            setopenTrainModal={setshowAITrainModal}
          />
        </div>
      )}

      {currentTopic && (
        <FlashcardGenerator
          topic={currentTopic}
          onFlashcardGenerated={handleFlashcardGenerated}


        />
      )}

      {/* Search component - only show if search is visible */}
      {isSearchVisible && (
        <PDFSearch
          searchQuery={searchQuery}
          handleSearch={handleSearch}
          isSearchActive={isSearchActive}
          searchInfo={searchInfo}
          handleSearchPrevious={handleSearchPrevious}
          handleSearchNext={handleSearchNext}
          searchOptions={searchOptions}
          toggleSearchOption={toggleSearchOption}
          setisSearchVisible={setisSearchVisible}
        />
      )}

      {/* PDF Viewer iframe */}
      <div className="flex-grow w-full relative min-h-screen mt-24">
        <iframe
          ref={iframeRef}
          id="pdf-viewer-iframe"
          title="PDF Viewer"
          src="/generic/web/viewer.html#zoom=page-width"
          className="w-full h-full pb-40"
          style={{
            border: "none",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            WebkitOverflowScrolling: "touch",
            transformOrigin: "0 0",
          }}
          allow="fullscreen"
          allowFullScreen={true}
          gesture="media"
        />
      </div>

      {/* Keep the IOSSelectionHelper as is */}
      <IOSSelectionHelper
        iframeRef={iframeRef}
        isReady={isReady}
        onSelection={() => { }} // You can implement this if needed
      />

      {/* Global styles */}
      <style jsx global>{`
        html {
          touch-action: manipulation;
        }
        body {
          touch-action: pan-x pan-y;
          overscroll-behavior: none;
        }
        .pdf-search-highlight {
          position: absolute;
          pointer-events: none;
          transition: background-color 0.2s ease;
          z-index: 1;
        }
        .current-highlight {
          box-shadow: 0 0 4px rgba(255, 152, 0, 0.5);
        }
        .textLayer {
          position: relative;
        }
      `}</style>
    </div>
  );
}

// Keep IOSSelectionHelper component unchanged
const IOSSelectionHelper = ({ iframeRef, isReady, onSelection }) => {
  const [logs, setLogs] = useState([]);
  const selectionRef = useRef(null);
  const isProcessingRef = useRef(false);
  const selectionRangeRef = useRef(null);
  const popupDismissalTimerRef = useRef(null);

  // Custom logging function
  const logWithStorage = (message, data) => {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    const logEntry = `[${timestamp}] ${message}${data ? ": " + JSON.stringify(data) : ""
      }`;
    // console.log(message, data || "");
    setLogs((prevLogs) => [...prevLogs, logEntry]);
  };

  const handleCopyLogs = () => {
    const logText = logs.join("\n");
    navigator.clipboard
      .writeText(logText)
      .then(() => alert("Logs copied to clipboard!"))
      .catch((err) => {
        console.error("Failed to copy logs:", err);
        alert("Failed to copy logs. See console for details.");
      });
  };

  const clearLogs = () => {
    setLogs([]);
    logWithStorage("Logs cleared");
  };

  // Dismiss iOS popup but keep the selection highlighted
  const dismissIOSPopup = () => {
    if (!selectionRef.current || isProcessingRef.current) return;

    logWithStorage(
      "Attempting to dismiss iOS popup while preserving selection"
    );
    isProcessingRef.current = true;

    try {
      const iframe = iframeRef.current;
      const win = iframe.contentWindow;
      const doc = win.document;
      const sel = win.getSelection();

      if (sel && sel.rangeCount > 0) {
        // Save the current range before removing it
        const currentRange = sel.getRangeAt(0).cloneRange();
        selectionRangeRef.current = currentRange;

        // Clear selection to dismiss iOS popup
        sel.removeAllRanges();
        logWithStorage("Selection temporarily cleared to dismiss popup");

        // Wait a short time for iOS to process the dismissal
        setTimeout(() => {
          try {
            // Restore the selection
            sel.addRange(selectionRangeRef.current);
            logWithStorage("Selection restored after popup dismissal");

            // Highlight the selection with a custom style
            const highlightSelection = () => {
              try {
                // Create an element to overlay the selection
                const range = sel.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Call the callback with selection info if provided
                if (onSelection && typeof onSelection === "function") {
                  onSelection({
                    text: selectionRef.current.text,
                    rect: {
                      left: rect.left + iframe.offsetLeft,
                      top: rect.top + iframe.offsetTop,
                      width: rect.width,
                      height: rect.height,
                    },
                  });
                  logWithStorage("Selection callback triggered with data");
                }
              } catch (err) {
                logWithStorage("Error highlighting selection:", err.message);
              }
            };

            // Execute highlighting
            highlightSelection();
          } catch (err) {
            logWithStorage("Error restoring selection:", err.message);
          }

          isProcessingRef.current = false;
        }, 150);
      }
    } catch (err) {
      logWithStorage("Error in dismissIOSPopup:", err.message);
      isProcessingRef.current = false;
    }
  };

  useEffect(() => {
    if (!isReady || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const win = iframe.contentWindow;
    const doc = win.document;

    logWithStorage("IOSSelectionHelper mounted, iframe ready:", !!iframe);

    // Handle touch events for iOS
    const handleTouchStart = (event) => {
      // Clear any pending dismissal timer
      if (popupDismissalTimerRef.current) {
        clearTimeout(popupDismissalTimerRef.current);
        popupDismissalTimerRef.current = null;
      }
      logWithStorage("Touch start detected");
    };

    const handleTouchEnd = (event) => {
      // Delay to allow iOS to process the selection
      setTimeout(() => {
        const sel = win.getSelection();
        const text = sel ? sel.toString().trim() : "";

        if (text && text.length > 0) {
          logWithStorage("Selection detected on touch end:", text);

          // Store selection info
          selectionRef.current = {
            text,
            selection: sel,
          };

          // Let iOS show its popup, then automatically dismiss it after a delay
          logWithStorage("iOS popup should appear now, will auto-dismiss");

          // Auto-dismiss after a delay to let the iOS popup appear
          popupDismissalTimerRef.current = setTimeout(() => {
            dismissIOSPopup();
          }, 500); // 500ms delay to ensure popup has time to appear
        } else {
          selectionRef.current = null;
          selectionRangeRef.current = null;
        }
      }, 100);
    };

    // Add listeners for iOS touches
    doc.addEventListener("touchstart", handleTouchStart, { passive: true });
    doc.addEventListener("touchend", handleTouchEnd);

    // Also handle mouse events for testing on desktop
    const handleMouseUp = (event) => {
      // Similar logic for desktop testing
      setTimeout(() => {
        const sel = win.getSelection();
        const text = sel ? sel.toString().trim() : "";

        if (text && text.length > 0 && !selectionRef.current) {
          logWithStorage("Selection detected on mouse up:", text);

          // Store selection info
          selectionRef.current = {
            text,
            selection: sel,
          };

          // Auto-dismiss after a delay (for testing on desktop)
          popupDismissalTimerRef.current = setTimeout(() => {
            dismissIOSPopup();
          }, 500);
        }
      }, 100);
    };

    doc.addEventListener("mouseup", handleMouseUp);

    // Manual dismiss button for testing
    const button = document.createElement("button");
    button.textContent = "Manual Dismiss";
    button.style.position = "fixed";
    button.style.bottom = "100px";
    button.style.left = "10px";
    button.style.zIndex = "10000";
    button.style.padding = "8px";
    button.style.backgroundColor = "#007AFF";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.addEventListener("click", dismissIOSPopup);
    // document.body.appendChild(button);

    logWithStorage("Event listeners attached for iOS");

    return () => {
      doc.removeEventListener("touchstart", handleTouchStart);
      doc.removeEventListener("touchend", handleTouchEnd);
      doc.removeEventListener("mouseup", handleMouseUp);
      // document.body.removeChild(button);

      if (popupDismissalTimerRef.current) {
        clearTimeout(popupDismissalTimerRef.current);
      }

      logWithStorage("IOSSelectionHelper unmounting");
    };
  }, [isReady, iframeRef, onSelection]);

  return null;
};