/**
 * PDF Viewer Utilities
 * 
 * This file contains utilities for interacting with the PDF viewer.
 * Functions are organized by feature category for easier implementation later.
 */

// Core utilities
export const getPDFViewerAPI = (iframeRef) => {
    if (!iframeRef.current) return null;
    try {
      return iframeRef.current.contentWindow.PDFViewerAPI;
    } catch (error) {
      console.error("Error accessing PDF Viewer API:", error);
      return null;
    }
  };
  
  // PDF source utilities
  export const getPdfSource = (pdfUrl) => {
    if (!pdfUrl) return `/generic/web/viewer.html`;
  
    const baseUrl = `/generic/web/viewer.html`;
    const fileParam = encodeURIComponent(pdfUrl);
    return `${baseUrl}?file=${fileParam}`;
  };
  
  // ===== NAVIGATION UTILITIES =====
  export const navigationUtils = {
    // Page navigation
    previousPage: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) api.previousPage();
    },
    
    nextPage: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) api.nextPage();
    },
    
    goToPage: (iframeRef, pageNumber) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) api.goToPage(pageNumber);
    },
    
    firstPage: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) api.firstPage();
    },
    
    lastPage: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) api.lastPage();
    }
  };
  
// ===== ZOOM UTILITIES =====
export const zoomUtils = {
  zoomIn: (iframeRef) => {
    const api = getPDFViewerAPI(iframeRef);
    if (api) api.zoomIn();
  },
  
  zoomOut: (iframeRef) => {
    const api = getPDFViewerAPI(iframeRef);
    if (api) api.zoomOut();
  },
  
  zoomReset: (iframeRef) => {
    const api = getPDFViewerAPI(iframeRef);
    if (api) api.zoomReset();
  },
  
  zoomToFit: (iframeRef) => {
    const api = getPDFViewerAPI(iframeRef);
    if (api) api.setZoom("page-fit");
  },
  
  zoomToWidth: (iframeRef) => {
    const api = getPDFViewerAPI(iframeRef);
    if (api) api.setZoom("page-width");
  },
  
  setHalfWidth: (iframeRef) => {
    const api = getPDFViewerAPI(iframeRef);
    if(api) api.setHalfWidth();
  }
};
  // ===== SEARCH UTILITIES =====
  export const searchUtils = {
    search: (iframeRef, query, options) => {
      const api = getPDFViewerAPI(iframeRef);
      if (!api) {
        console.error("PDF Viewer API not available");
        return false;
      }
  
      if (!query) {
        api.clearSearch();
        return false;
      } else {
        try {
          api.search(query, options);
          return true;
        } catch (error) {
          console.error("Search error:", error);
          return false;
        }
      }
    },
    
    clearSearch: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) api.clearSearch();
    },
    
    findNext: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) {
        try {
          api.findNext();
          return true;
        } catch (error) {
          console.error("Error finding next:", error);
          return false;
        }
      }
      return false;
    },
    
    findPrevious: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) {
        try {
          api.findPrevious();
          return true;
        } catch (error) {
          console.error("Error finding previous:", error);
          return false;
        }
      }
      return false;
    }
  };
  
  // ===== ANNOTATION UTILITIES =====
  export const annotationUtils = {
    toggleHighlight: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) {
        return api.toggleHighlight();
      }
      return null;
    },
    
    toggleFreeText: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) {
        return api.toggleFreeText();
      }
      return null;
    },
    
    toggleInk: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) {
        return api.toggleInk();
      }
      return null;
    },
    
    clearAnnotations: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) {
        return api.clearAnnotations();
      }
      return false;
    },
    
    saveAnnotations: async (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) {
        try {
          return await api.saveAnnotations();
        } catch (error) {
          console.error("Error saving annotations:", error);
          return false;
        }
      }
      return false;
    }
  };
  
  // ===== SIDEBAR UTILITIES =====
  export const sidebarUtils = {
    toggleSidebar: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) {
        api.toggleSidebar();
        return true;
      }
      return false;
    },
    
    setSidebarView: (iframeRef, view) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) {
        api.setSidebarView(view);
        return true;
      }
      return false;
    }
  };
  
  // ===== ROTATION UTILITIES =====
  export const rotationUtils = {
    rotate: (iframeRef, degrees) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) {
        api.rotate(degrees);
        return true;
      }
      return false;
    }
  };
  
  // ===== PRINT AND DOWNLOAD UTILITIES =====
  export const printDownloadUtils = {
    print: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) {
        api.print();
        return true;
      }
      return false;
    },
    
    download: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) {
        api.download();
        return true;
      }
      return false;
    }
  };
  
  // ===== DOCUMENT INFO UTILITIES =====
  export const documentUtils = {
    getDocumentInfo: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) {
        return api.getDocumentInfo();
      }
      return null;
    },
    
    getCurrentZoom: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) {
        return api.getCurrentZoom();
      }
      return null;
    },
    
    getAnnotationEditorMode: (iframeRef) => {
      const api = getPDFViewerAPI(iframeRef);
      if (api) {
        return api.getAnnotationEditorMode();
      }
      return null;
    }
  };
  
  // Map annotation mode numbers to readable names
  export const getAnnotationModeName = (mode) => {
    const modeMap = {
      9: "Highlight",
      3: "Free Text",
      15: "Draw",
      13: "Stamp",
      12: "Signature",
      0: "None",
    };
    return modeMap[mode] || "Unknown";
  };