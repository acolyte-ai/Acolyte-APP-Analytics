import { useCallback, useRef } from "react";

export const usePDFHighlighter = (pdfApi, iframeRef) => {
  const highlightTimeoutRef = useRef(null);
  const currentHighlightsRef = useRef([]);

  const removeExistingHighlights = (pageElement) => {
    const existingHighlights = pageElement.querySelectorAll(".pdf-highlight-box");
    existingHighlights.forEach((highlight) => highlight.remove());
  };

  const addHighlights = (pdfWindow, PDFViewerApplication, boxes, pageNumber) => {
    try {
      const pdfViewer = PDFViewerApplication.pdfViewer;
      const pageView = pdfViewer.getPageView(pageNumber - 1); // 0-based index

      if (!pageView || !pageView.pdfPage) {
        console.error("Page view or PDF page not found");
        return;
      }

      const viewport = pageView.viewport;
      const pageElement = pageView.div;
      const canvas = pageElement.querySelector("canvas");

      if (!canvas) {
        console.error("Canvas not found");
        return;
      }

      // Get the actual displayed dimensions
      const canvasRect = canvas.getBoundingClientRect();
      const scaleX = canvasRect.width / viewport.width;
      const scaleY = canvasRect.height / viewport.height;

      // Remove existing highlights
      removeExistingHighlights(pageElement);

      // Add new highlights
      boxes.forEach((box, index) => {
        const [left, top, right, bottom] = box.bbox;

        // PDF coordinates: origin at bottom-left, Y increases upward
        // Convert to viewport coordinates: origin at top-left, Y increases downward
        const pdfHeight = pageView.pdfPage.view[3]; // Get PDF page height

        // Convert PDF coordinates to viewport coordinates
        const viewportLeft = left;
        const viewportTop = pdfHeight - bottom; // Flip Y coordinate
        const viewportRight = right;
        const viewportBottom = pdfHeight - top; // Flip Y coordinate

        // Apply viewport transformation
        const transformedCoords = viewport.convertToViewportPoint(
          viewportLeft,
          viewportTop
        );
        const transformedCoords2 = viewport.convertToViewportPoint(
          viewportRight,
          viewportBottom
        );

        // Scale to actual display size
        const x = Math.min(transformedCoords[0], transformedCoords2[0]) * scaleX;
        const y = Math.min(transformedCoords[1], transformedCoords2[1]) * scaleY;
        const width = Math.abs(transformedCoords2[0] - transformedCoords[0]) * scaleX;
        const height = Math.abs(transformedCoords2[1] - transformedCoords[1]) * scaleY;

        // Create highlight overlay
        const highlightDiv = pdfWindow.document.createElement("div");
        highlightDiv.className = "pdf-highlight-box";
        highlightDiv.setAttribute("data-highlight-id", index);
        highlightDiv.setAttribute("title", box.text);

        highlightDiv.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: ${width}px;
          height: ${height}px;
          background-color: rgba(255, 255, 0, 0.4);
          border: 2px solid rgba(255, 215, 0, 0.9);
          pointer-events: none;
          z-index: 100;
          box-sizing: border-box;
          transition: opacity 0.3s ease;
        `;

        pageElement.appendChild(highlightDiv);
        currentHighlightsRef.current.push(highlightDiv);
      });

      console.log(`Added ${boxes.length} highlights to page ${pageNumber}`);
    } catch (error) {
      console.error("Error adding highlights:", error);
    }
  };

  const clearAllHighlights = () => {
    if (!iframeRef.current) return;

    try {
      const pdfWindow = iframeRef.current.contentWindow;
      const PDFViewerApplication = pdfWindow.PDFViewerApplication;

      if (!PDFViewerApplication) return;

      // Clear highlights from all pages
      const pdfViewer = PDFViewerApplication.pdfViewer;
      for (let i = 0; i < pdfViewer.pagesCount; i++) {
        const pageView = pdfViewer.getPageView(i);
        if (pageView && pageView.div) {
          removeExistingHighlights(pageView.div);
        }
      }

      currentHighlightsRef.current = [];
    } catch (error) {
      console.error("Error clearing highlights:", error);
    }
  };

  const navigateToChunk = useCallback((referenceData) => {
    if (!pdfApi || !iframeRef.current || !referenceData) {
      console.error("Missing required parameters for navigation");
      return;
    }

    try {
      // Clear any existing timeout
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      // Clear existing highlights
      clearAllHighlights();

      // Extract page number and paragraphs from the reference data
      const pageNumber = referenceData.page || referenceData.metadata?.page;
      const paragraphs = referenceData.metadata?.paragraphs || [];

      if (!pageNumber) {
        console.error("No page number found in reference data");
        return;
      }

      if (paragraphs.length === 0) {
        console.error("No paragraphs found in reference data");
        return;
      }

      console.log(`Navigating to page ${pageNumber} with ${paragraphs.length} paragraphs`);

      // Navigate to the page
      pdfApi.goToPage(pageNumber);

      // Wait for page to render, then add highlights
      setTimeout(() => {
        const pdfWindow = iframeRef.current.contentWindow;
        const PDFViewerApplication = pdfWindow.PDFViewerApplication;

        if (!PDFViewerApplication) {
          console.error("PDFViewerApplication not found");
          return;
        }

        // Add highlights for all paragraphs
        addHighlights(pdfWindow, PDFViewerApplication, paragraphs, pageNumber);

        // Set timeout to remove highlights after 5 seconds
        highlightTimeoutRef.current = setTimeout(() => {
          clearAllHighlights();
        }, 5000);

      }, 1000); // Wait 1 second for page to render

    } catch (error) {
      console.error("Error in navigateToChunk:", error);
    }
  }, [pdfApi, iframeRef]);

  return navigateToChunk;
};