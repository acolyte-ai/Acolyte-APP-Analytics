import { useRef, useEffect, useState, useCallback } from "react";
import { documentUtils, getPDFViewerAPI } from "@/components/pdf/utils/pdf-utils";
import { useSettings } from "@/context/store";
import { off } from "process";
import { toast } from "sonner";

// Define highlight colors
export const HIGHLIGHT_COLORS = {
  yellow: "rgba(255, 235, 59, 0.5)",
  green: "rgba(76, 175, 80, 0.5)",
  blue: "rgba(33, 150, 243, 0.5)",
  pink: "rgba(233, 30, 99, 0.5)",
  purple: "rgba(156, 39, 176, 0.5)",
};

// Highlight data structure
export interface HighlightData {
  id: string;
  pageNumber: number;
  position: {
    boundingRect: DOMRect;
    rects: DOMRect[];
    pageRelativeCoordinates: {
      left: number;
      top: number;
      width: number;
      height: number;
    }[];
  };
  text: string;
  color: string;
  timestamp: number;
}

interface PDFHighlighterProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  isReady: boolean;
  documentId: string;
  userId: string;
  fileName?: string;
}

const PDFHighlighter: React.FC<PDFHighlighterProps> = ({
  iframeRef,
  isReady,
  documentId,
  userId,
  fileName,
  subject
}) => {
  const [highlights, setHighlights] = useState<HighlightData[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [currentColor, setCurrentColor] = useState(HIGHLIGHT_COLORS.yellow);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { setCurrentTopic, setComposerInsertText, setViewCombination, setFlashcardWord, setSelectedFile } = useSettings()

  const selectedRangesRef = useRef<Range[]>([]);
  const popupRef = useRef<HTMLDivElement>(null);

  // Load saved highlights from localStorage
  const loadHighlights = useCallback(() => {
    try {
      const storedHighlights = localStorage.getItem(`pdf-highlights-${documentId}-${userId}`);
      if (storedHighlights) {
        setHighlights(JSON.parse(storedHighlights));
      }
    } catch (error) {
      console.error("Error loading highlights:", error);
    }
  }, [documentId, userId]);

  // Save highlights to localStorage
  const saveHighlights = useCallback((highlightsToSave: HighlightData[]) => {
    try {
      localStorage.setItem(
        `pdf-highlights-${documentId}-${userId}`,
        JSON.stringify(highlightsToSave)
      );
    } catch (error) {
      console.error("Error saving highlights:", error);
    }
  }, [documentId, userId]);

  // Initialize on component mount
  useEffect(() => {
    if (!isReady || !iframeRef.current) return;

    loadHighlights();

    const iframe = iframeRef.current;
    const contentWindow = iframe.contentWindow;
    const contentDocument = contentWindow.document;

    // Listen for scale changes from PDF.js
    const handleScaleChange = (evt: any) => {
      if (evt.scale) {
        setScale(evt.scale);
      }
    };

    // Listen for rotation changes
    const handleRotationChange = (evt: any) => {
      if (typeof evt.pagesRotation === 'number') {
        setRotation(evt.pagesRotation);
      }
    };

    // Set up event listeners for PDF document changes
    const api = getPDFViewerAPI(iframeRef);
    if (api) {
      api.on("scalechanging", handleScaleChange);
      api.on("rotationchanging", handleRotationChange);
      api.on("pagechanging", (e) => {
        console.log(e);
        setCurrentPage(e.pageNumber);
      });
    }

    return () => {
      if (api) {
        api.off("scalechanging", handleScaleChange);
        api.off("rotationchanging", handleRotationChange);
        api.off("pagechanging", (e) => {
          setCurrentPage(e.pageNumber);
        });
      }
    };
  }, [isReady, iframeRef, loadHighlights]);

  // Re-render highlights when scale, rotation, or highlights change
  useEffect(() => {
    if (!isReady || !iframeRef.current) return;
    renderHighlights();
  }, [isReady, scale, rotation, highlights, currentPage]);

  // Handle document clicks to close popup when clicking outside
  useEffect(() => {
    if (!isReady || !iframeRef.current) return;

    const handleDocumentClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [isReady]);

  // Set up text selection handlers
  useEffect(() => {
    if (!isReady || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const contentWindow = iframe.contentWindow;
    const contentDocument = contentWindow.document;

    const handleSelectionChange = () => {
      const selection = contentWindow.getSelection();

      if (!selection || selection.isCollapsed) {
        return;
      }

      const text = selection.toString().trim();
      if (!text) {
        return;
      }

      // Store the selection ranges
      selectedRangesRef.current = [];
      for (let i = 0; i < selection.rangeCount; i++) {
        selectedRangesRef.current.push(selection.getRangeAt(i).cloneRange());
      }

      // Calculate position for popup
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Calculate position relative to the iframe
      const iframeRect = iframe.getBoundingClientRect();
      const x = rect.left + iframeRect.left + (rect.width / 2);
      const y = rect.top + iframeRect.top - 45; // Position above the selection

      setPopupPosition({ x, y });
      setSelectedFile({ fileName: fileName || "", fileType: "pdf", id: documentId, subject: subject })
      setSelectedText(text);
      setFlashcardWord(text)
      setShowPopup(true);
    };

    // Handle mouseup events to detect text selection
    const handleMouseUp = (e: MouseEvent) => {
      setTimeout(() => handleSelectionChange(), 10);
    };

    contentDocument.addEventListener("mouseup", handleMouseUp);

    // Also handle touch events for mobile
    const handleTouchEnd = (e: TouchEvent) => {
      setTimeout(() => handleSelectionChange(), 100);
    };

    contentDocument.addEventListener("touchend", handleTouchEnd);

    return () => {
      contentDocument.removeEventListener("mouseup", handleMouseUp);
      contentDocument.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isReady]);


  // Enhance the document click handler to properly close the popup
  useEffect(() => {
    if (!isReady || !iframeRef.current) return;

    const handleOutsideClick = (e: MouseEvent) => {
      // Check if the popup is open
      if (!showPopup) return;

      // If popup ref exists and event target is not within the popup
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowPopup(false);

        // Also clear the selection if it exists
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
          const selection = iframe.contentWindow.getSelection();
          if (selection) {
            selection.removeAllRanges();
          }
        }
      }
    };

    // Need to add this to both document and iframe document
    document.addEventListener("mousedown", handleOutsideClick);

    // Also handle clicks in the PDF document itself
    if (iframeRef.current.contentWindow && iframeRef.current.contentWindow.document) {
      iframeRef.current.contentWindow.document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      if (iframeRef.current && iframeRef.current.contentWindow && iframeRef.current.contentWindow.document) {
        iframeRef.current.contentWindow.document.removeEventListener("mousedown", handleOutsideClick);
      }
    };
  }, [isReady, iframeRef, showPopup]);

  // Create a highlight from the current selection
  const createHighlight = useCallback((color: string) => {
    if (!isReady || !iframeRef.current || !selectedText || selectedRangesRef.current.length === 0) {
      return;
    }

    const iframe = iframeRef.current;
    const contentWindow = iframe.contentWindow;
    const contentDocument = contentWindow.document;

    // Get the current page number
    const api = getPDFViewerAPI(iframeRef);
    if (!api) return;

    // Use the tracked current page number
    const currentPageNumber = currentPage;

    // Generate a unique ID for the highlight
    const id = `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get the text layer element for the current page
    const textLayer = contentDocument.querySelector(`.page[data-page-number="${currentPageNumber}"] .textLayer`);
    if (!textLayer) return;

    // Calculate page container dimensions for relative positioning
    const pageContainer = textLayer.parentElement;
    const pageRect = pageContainer.getBoundingClientRect();

    // Calculate rect coordinates relative to the page
    const pageRelativeCoordinates = selectedRangesRef.current.map(range => {
      const rangeRect = range.getBoundingClientRect();
      return {
        left: (rangeRect.left - pageRect.left) / scale,
        top: (rangeRect.top - pageRect.top) / scale,
        width: rangeRect.width / scale,
        height: rangeRect.height / scale
      };
    });

    // Create highlight data
    const highlightData: HighlightData = {
      id,
      pageNumber: currentPageNumber,
      position: {
        boundingRect: selectedRangesRef.current[0].getBoundingClientRect(),
        rects: selectedRangesRef.current.map(r => r.getBoundingClientRect()),
        pageRelativeCoordinates
      },
      text: selectedText,
      color,
      timestamp: Date.now()
    };

    // Add to highlights
    const newHighlights = [...highlights, highlightData];
    setHighlights(newHighlights);
    saveHighlights(newHighlights);

    // Clear popup and selection
    setShowPopup(false);
    contentWindow.getSelection().removeAllRanges();

    // Render the highlight
    renderHighlight(highlightData);
  }, [isReady, iframeRef, selectedText, highlights, scale, saveHighlights, currentPage]);

  // Delete highlight by ID
  const deleteHighlight = useCallback((id: string) => {
    const newHighlights = highlights.filter(h => h.id !== id);
    setHighlights(newHighlights);
    saveHighlights(newHighlights);

    // Remove highlight element from DOM
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const contentDocument = iframe.contentWindow.document;
      const highlightElement = contentDocument.getElementById(id);
      if (highlightElement) {
        highlightElement.remove();
      }
    }
  }, [highlights, iframeRef, saveHighlights]);

  // Copy selected text to clipboard
  const copyText = useCallback(() => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText)
        .then(() => {
          // Show a temporary success message
          const successIndicator = document.createElement('div');
          successIndicator.textContent = 'Copied!';
          successIndicator.style.position = 'fixed';
          successIndicator.style.left = `${popupPosition.x}px`;
          successIndicator.style.top = `${popupPosition.y - 30}px`;
          successIndicator.style.transform = 'translateX(-50%)';
          successIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          successIndicator.style.color = 'white';
          successIndicator.style.padding = '4px 8px';
          successIndicator.style.borderRadius = '4px';
          successIndicator.style.zIndex = '10000';
          document.body.appendChild(successIndicator);

          setTimeout(() => {
            document.body.removeChild(successIndicator);
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });

      setShowPopup(false);
    }
  }, [selectedText, popupPosition]);

  // Ask Acolyte function
  const askAcolyte = useCallback(() => {
    // Function flow for asking Acolyte about the selected text
    if (selectedText) {
      // Implementation will be added by the requester
      console.log("Ask Acolyte about:", selectedText);
      setViewCombination("pdf+chat");
      if (!selectedText) return
      setComposerInsertText(`Explain me: ${selectedText}`);

      // Close the popup
      setShowPopup(false);
    }
  }, [selectedText]);

  // Generate Flashcard function
  const generateFlashcard = useCallback(() => {
    // Function flow for generating a flashcard from the selected text
    if (selectedText) {
      // Implementation will be added by the requester
      console.log("Generate flashcard for:", selectedText);
      setCurrentTopic(selectedText)

      // Close the popup
      setShowPopup(false);
      toast.info("Please wait your flashcard is getting generated", {
        position: "bottom-right",
      })
    }
  }, [selectedText]);

  // Render a single highlight
  const renderHighlight = useCallback((highlight: HighlightData) => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const contentDocument = iframe.contentWindow.document;

    // Find the text layer for this page
    const textLayer = contentDocument.querySelector(
      `.page[data-page-number="${highlight.pageNumber}"] .textLayer`
    );

    if (!textLayer) return;

    // Check if this highlight already exists in the DOM
    const existingHighlight = contentDocument.getElementById(highlight.id);
    if (existingHighlight) {
      existingHighlight.remove();
    }

    // Create highlights for each rect
    highlight.position.pageRelativeCoordinates.forEach((rect, index) => {
      const highlightElement = contentDocument.createElement("div");
      highlightElement.id = index === 0 ? highlight.id : `${highlight.id}-part-${index}`;
      highlightElement.className = "pdf-text-highlight";
      highlightElement.style.position = "absolute";
      highlightElement.style.backgroundColor = highlight.color;
      highlightElement.style.left = `${(rect.left * scale) - 8}px`;
      highlightElement.style.top = `${(rect.top * scale) - 8}px`;
      highlightElement.style.width = `${rect.width * scale}px`;
      highlightElement.style.height = `${rect.height * scale}px`;
      highlightElement.style.color = "black"; // Set text color to black
      highlightElement.style.pointerEvents = "none";
      highlightElement.style.mixBlendMode = "multiply";
      highlightElement.dataset.highlightId = highlight.id;

      textLayer.appendChild(highlightElement);
    });

    // Add a tooltip/info element that appears on hover
    const infoElement = contentDocument.createElement("div");
    infoElement.id = `${highlight.id}-info`;
    infoElement.className = "pdf-highlight-info";
    infoElement.style.position = "absolute";
    infoElement.style.left = `${highlight.position.pageRelativeCoordinates[0].left * scale}px`;
    infoElement.style.top = `${(highlight.position.pageRelativeCoordinates[0].top * scale) - 20}px`;
    infoElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    infoElement.style.color = "white";
    infoElement.style.padding = "2px 5px";
    infoElement.style.borderRadius = "3px";
    infoElement.style.fontSize = "10px";
    infoElement.style.display = "none";
    infoElement.style.zIndex = "1000";
    infoElement.style.pointerEvents = "auto";
    infoElement.style.cursor = "pointer";
    infoElement.textContent = "Delete";
    infoElement.dataset.highlightId = highlight.id;

    // Show info on hover
    const highlightElements = contentDocument.querySelectorAll(`[data-highlight-id="${highlight.id}"]`);
    highlightElements.forEach(el => {
      el.addEventListener("mouseenter", () => {
        infoElement.style.display = "block";
      });

      el.addEventListener("mouseleave", (e) => {
        if (!infoElement.contains(e.relatedTarget as Node)) {
          infoElement.style.display = "none";
        }
      });
    });

    // Handle delete
    infoElement.addEventListener("click", () => {
      deleteHighlight(highlight.id);
    });

    infoElement.addEventListener("mouseenter", () => {
      infoElement.style.display = "block";
    });

    infoElement.addEventListener("mouseleave", () => {
      infoElement.style.display = "none";
    });

    textLayer.appendChild(infoElement);
  }, [iframeRef, scale, deleteHighlight]);

  // Render all highlights
  const renderHighlights = useCallback(() => {
    if (!isReady || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const contentDocument = iframe.contentWindow.document;

    // Remove all existing highlights first
    const existingHighlights = contentDocument.querySelectorAll(".pdf-text-highlight, .pdf-highlight-info");
    existingHighlights.forEach(el => el.remove());

    // Render each highlight
    highlights.forEach(highlight => {
      renderHighlight(highlight);
    });
  }, [isReady, iframeRef, highlights, renderHighlight]);

  return (
    <>
      {/* Enhanced Highlight Color Popup with additional options */}
      {showPopup && (
        <div
          ref={popupRef}
          className="highlight-popup"
          style={{
            position: "fixed",
            left: popupPosition.x,
            top: popupPosition.y - 40,
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 9999,
          }}
        >
          {/* Color selection row */}
          <div style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
            paddingBottom: "6px"
          }}>
            {Object.entries(HIGHLIGHT_COLORS).map(([name, color]) => (
              <button
                key={name}
                className="highlight-color-button"
                onClick={() => createHighlight(color)}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: color,
                  border: "1px solid #fff",
                  cursor: "pointer",
                }}
                title={`Highlight ${name}`}
              />
            ))}
          </div>

          {/* Additional options */}
          <div style={{
            display: "flex",
            flexDirection: "row",
            gap: "5px"
          }}>
            <button
              onClick={copyText}
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "none",
                padding: "4px 8px",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "12px",
                borderRadius: "4px",
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              Copy
            </button>

            <button
              onClick={askAcolyte}
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "none",
                padding: "4px 8px",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "12px",
                borderRadius: "4px",
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              Ask Acolyte
            </button>

            <button
              onClick={generateFlashcard}
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "none",
                padding: "4px 8px",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "12px",
                borderRadius: "4px",
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              Generate Flashcard
            </button>
          </div>
        </div>
      )}

      {/* Global styles for highlights */}
      <style jsx global>{`
        .pdf-text-highlight {
          opacity: 0.5;
          transition: opacity 0.2s ease;
          pointer-events: auto !important;
          color: black !important; /* Ensure text color is black */
        }
        .pdf-text-highlight:hover {
          opacity: 0.7;
        }
        /* Ensure text overlaps with highlights remain black */
        .textLayer > span {
          color: black !important;
          z-index: 2;
          position: relative;
        }
      `}</style>
    </>
  );
};

export default PDFHighlighter;