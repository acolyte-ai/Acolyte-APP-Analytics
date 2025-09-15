import { useRef, useEffect, useState, useCallback } from "react";
import { useSettings } from "@/context/store";
import { useUpdateLearningToolTime } from "@/hooks/useUpdateLearningToolTime";
import { getPDFViewerAPI, zoomUtils } from "@/components/pdf/utils/pdf-utils";
import { usePDFSearch } from "./usePDFSearch";

export const usePDFViewer = ({ id, userId, isPdfLoaded, pdfBlobUrl }) => {
  const iframeRef = useRef(null);
  const startTimeRef = useRef(null);

  const {
    activeTool,
    setScale,
    isScreenShotEnable,
    setIsScreenShotEnable,
    setPdfIframeRef,
    setCurrentPage,
    currentPage,
    setComposerInsertText,
    setData,
    setTotalPages,
    setFooterVisible,
    setisHeadderVisible,
    setisExpanded,
    setCurrentTopic,
    setViewCombination,
  } = useSettings();

  const { updateLearningToolTime } = useUpdateLearningToolTime(userId);

  // State variables
  const [isReady, setIsReady] = useState(false);
  const [isViewerLoading, setIsViewerLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [pdfApi, setPdfApi] = useState(null);
  const [annotationMode, setAnnotationMode] = useState(0);

  // Use the search hook
  const {
    searchQuery,
    searchInfo,
    isSearchActive,
    searchOptions,
    handleSearch,
    handleSearchNext,
    handleSearchPrevious,
    toggleSearchOption,
    handleSearchResultsUpdated,
    setSearchInfo,
  } = usePDFSearch(iframeRef);

  // Initialize PDF URL and iOS detection
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = /ipad|iphone|ipod/.test(userAgent);
    setIsIOS(iOS);

    if (pdfBlobUrl && isPdfLoaded) {
      setPdfUrl(pdfBlobUrl);
    }

    setIsViewerLoading(false);
  }, [isPdfLoaded, pdfBlobUrl]);

  // Handle active tool changes
  useEffect(() => {
    if (!activeTool) return;

    const api = getPDFViewerAPI(iframeRef);
    if (!api) return;

    if (activeTool?.id === "rectangleSelection") {
      // setIsScreenShotEnable(true);
    } else if (activeTool?.id === "highlighter") {
      // const result = api.toggleHighlight(false);
      // setAnnotationMode(result);
    } else {
      // const result = api.toggleHighlight();
      // setAnnotationMode(result);
    }
  }, [activeTool, setIsScreenShotEnable]);

  // Set up iframe source
  useEffect(() => {
    if (isViewerLoading || !pdfUrl) return;

    let viewerUrl = "/generic/web/viewer.html";
    if (pdfUrl) {
      viewerUrl += `?file=${encodeURIComponent(pdfUrl)}`;
    }

    if (iframeRef.current) {
      iframeRef.current.src = viewerUrl;
      setPdfIframeRef(iframeRef);
    }
  }, [isViewerLoading, pdfUrl, setPdfIframeRef]);

  // Zoom to width after iframe is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!iframeRef.current) return;
      zoomUtils.zoomToWidth(iframeRef.current);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Event handlers
  const handleIframeMessage = useCallback(
    (event) => {
      const { type, data } = event.data || {};
      if (!type) return;

      switch (type) {
        case "searchUpdate":
          setSearchInfo(data);
          break;
        case "generateFlashCard":
          setCurrentTopic(data.text);
          break;
        case "pdfTextSelection":
          setViewCombination("pdf+chat");
          // setComposerInsertText(`Explain me: ${data.text}`);

          break;
        case "annotationModeChange":
          if (data && typeof data.mode === "number") {
            setAnnotationMode(data.mode);
          }
          break;
      }
    },
    [setCurrentTopic, setComposerInsertText, setSearchInfo]
  );

  const handleDocumentLoaded = useCallback(() => {
    const api = getPDFViewerAPI(iframeRef);
    if (!api) return;

    const info = api.getDocumentInfo();
    setDocumentInfo(info);

    const mode = api.getAnnotationEditorMode();
    setAnnotationMode(mode);
  }, []);

  const handleAnnotationModeChanged = useCallback((evt) => {
    if (evt && typeof evt.mode === "number") {
      setAnnotationMode(evt.mode);
    }
  }, []);

  const handleScaleChange = (event) => {
    if (!event.scale) return;
    setScale(event.scale);
  };

  // Initialize PDF viewer
  useEffect(() => {
    if (isViewerLoading) return;

    const initializeViewer = () => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const handleIframeLoad = () => {
        const api = getPDFViewerAPI(iframeRef);
        if (!api) {
          setTimeout(handleIframeLoad, 500);
          return;
        }

        setPdfApi(api);
        window.addEventListener("message", handleIframeMessage);

        if (isIOS) {
          api.enableIOSZoom();
        }

        api.goToPage(currentPage);
        api.on("documentloaded", (e) => {
          setTotalPages(e.source.pagesCount);
          handleDocumentLoaded();
        });
        api.on("updatefindmatchescount", (e) => {
          handleSearchResultsUpdated(e);
        });
        api.on("updatefindcontrolstate", (e) => {
           handleSearchResultsUpdated(e);
        });
      

        api.on("switchannotationeditormode", handleAnnotationModeChanged);
        api.on("scalechanging", handleScaleChange);
        api.on("pagechanging", (e) => {
          setCurrentPage(e.pageNumber);
        });

        setIsReady(true);
      };

      iframe.addEventListener("load", handleIframeLoad);

      return () => {
        window.removeEventListener("message", handleIframeMessage);
        iframe.removeEventListener("load", handleIframeLoad);

        const api = getPDFViewerAPI(iframeRef);
        if (api) {
          api.off("documentloaded", handleDocumentLoaded);
          api.off("updatefindmatchescount", handleSearchResultsUpdated);
          api.off("switchannotationeditormode", handleAnnotationModeChanged);
          api.off("scalechanging", handleScaleChange);
          api.off("pagechanging", () => {});
          api.off("updatefindcontrolstate", () => {});

        }
      };
    };

    return initializeViewer();
  }, [
    isViewerLoading,
    isIOS,
    pdfUrl,
    currentPage,
    handleIframeMessage,
    handleDocumentLoaded,
    handleSearchResultsUpdated,
    handleAnnotationModeChanged,
    setTotalPages,
    setCurrentPage,
  ]);

  // Screenshot tool setup
  useEffect(() => {
    if (!isReady || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const contentWindow = iframe.contentWindow;

    const handleScreenshotMessage = (event) => {
      const { type, data } = event.data || {};

      if (type === "pdf-screenshot-capture") {
        const screenshotData = {
          url: data.url,
          bounds: data.bounds,
          added: data.added,
        };
        setData(screenshotData);
        setIsScreenShotEnable(false);
      } else if (type === "pdf-screenshot-error") {
        console.error("Screenshot error:", data.error);
        setIsScreenShotEnable(false);
      } else if (type === "pdf-screenshot-mode-ended") {
        setIsScreenShotEnable(false);
      }
    };

    if (isScreenShotEnable) {
      contentWindow.postMessage({ type: "start-pdf-screenshot" }, "*");
    } else {
      contentWindow.postMessage({ type: "stop-pdf-screenshot" }, "*");
    }

    window.addEventListener("message", handleScreenshotMessage);
    return () => window.removeEventListener("message", handleScreenshotMessage);
  }, [isReady, isScreenShotEnable, setData, setIsScreenShotEnable]);

  // Keyboard event handlers
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        setFooterVisible(true);
        setisHeadderVisible(true);
        setisExpanded(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [setFooterVisible, setisHeadderVisible, setisExpanded]);

  // Track usage time
  useEffect(() => {
    startTimeRef.current = Date.now();

    return () => {
      const endTime = Date.now();
      const timeSpentInSeconds = Math.floor(
        (endTime - startTimeRef.current) / 1000
      );
      updateLearningToolTime("pdfTime", timeSpentInSeconds);
    };
  }, [updateLearningToolTime]);

  const generateFlashcardForTopic = (topic) => {
    setCurrentTopic(topic);
  };

  return {
    // Refs
    iframeRef,

    // State
    isReady,
    isViewerLoading,
    pdfUrl,
    isIOS,
    documentInfo,
    pdfApi,
    annotationMode,

    // Search state (from usePDFSearch hook)
    searchQuery,
    searchInfo,
    isSearchActive,
    searchOptions,

    // Functions (including search functions from usePDFSearch hook)
    handleSearch,
    handleSearchNext,
    handleSearchPrevious,
    toggleSearchOption,
    generateFlashcardForTopic,
  };
};
