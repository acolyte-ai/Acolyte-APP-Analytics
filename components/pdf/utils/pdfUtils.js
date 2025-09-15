"use client"

import { ZoomIn } from 'lucide-react';
import { MIN_SCALE, MAX_SCALE, PDF_JS_URLS } from './constants';

// Load PDF.js library and styles
export const loadPDFLibraries = () => {
  return new Promise((resolve, reject) => {
    try {
      // Load PDF.js styles
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = PDF_JS_URLS.CSS;
      document.head.appendChild(linkElement);

      // Load scripts in sequence
      loadScript(PDF_JS_URLS.MAIN)
        .then(() => loadScript(PDF_JS_URLS.VIEWER))
        .then(() => {
          resolve();
        })
        .catch(err => {
          console.error('Failed to load PDF.js scripts:', err);
          reject(err);
        });
    } catch (err) {
      console.error('Failed to load PDF.js:', err);
      reject(err);
    }
  });
};

// Helper to load a script
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

// Create and return cursor indicator for zoom
export const createCursorIndicator = () => {
  // Create the custom cursor element
  const cursor = document.createElement('div');
  cursor.id = 'zoomCursor';
  cursor.className = 'absolute w-5 h-5 rounded-full border-2 border-red-500 pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 hidden';
  document.body.appendChild(cursor);
  
  // Set the actual mouse cursor to a crosshair by default
  document.body.style.cursor = 'crosshair';
  
  return cursor;
};


// Function to clean up the cursor when you're done with zoom functionality
export const cleanupCursorIndicator = (cursorRef) => {
  if (cursorRef && cursorRef.parentNode) {
    cursorRef.parentNode.removeChild(cursorRef);
  }
  document.body.style.cursor = 'default'; // Reset cursor to default
};

// Extract text content from all pages
export const extractTextFromPDF = async (pdfDocument) => {
  const numPages = pdfDocument.numPages;
  let textContent = '';
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const text = await page.getTextContent();
    
    // Concatenate all text items from the page
    const pageText = text.items.map(item => item.str).join(' ');
    textContent += pageText + ' ';
  }
  
  return textContent;
};

// Function to split text into words
export const extractWords = (text) => {
  // Basic word splitting
  return text.match(/\b\w+\b/g) || [];
};

export const zoomTo = (viewerInstance, containerRef, cursorRef, currentFitMode, setCurrentFitMode, newScale, x = null, y = null, showIndicator = true) => {
  if (!viewerInstance || !containerRef) return false;
  
  // Constrain the scale between MIN_SCALE and MAX_SCALE
  newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
  
  // Only update if the scale changed
  if (newScale !== viewerInstance.currentScale) {
    const previousScale = viewerInstance.currentScale;
    const isZoomIn = newScale > previousScale;
    
    console.log("[Zoom] Changing scale:", { 
      from: previousScale.toFixed(2), 
      to: newScale.toFixed(2) 
    });
    
    // When manually zooming, turn off page fit mode
    if (currentFitMode !== 'custom') {
      console.log("[Zoom] Disabling fit mode due to manual zoom");
      setCurrentFitMode('custom');
    }
    
    // Ensure the container has proper overflow settings
    containerRef.style.overflow = 'auto';
    
    // If we have coordinates, we can zoom to a specific point
    if (x !== null && y !== null) {
      // Show visual indicator at zoom point if requested
      if (showIndicator && cursorRef) {
        showCursorIndicator(cursorRef, x, y, isZoomIn);
      }
      
      // Get the container's bounding rect
      const containerRect = containerRef.getBoundingClientRect();
      
      // Store original scroll position
      const originalScrollLeft = containerRef.scrollLeft;
      const originalScrollTop = containerRef.scrollTop;
      
      // Calculate client coordinates relative to the container
      const clientX = x - containerRect.left;
      const clientY = y - containerRect.top;
      
      // Calculate document coordinates (scroll position + client coordinates)
      const documentX = originalScrollLeft + clientX;
      const documentY = originalScrollTop + clientY;
      
      // Calculate the ratio of document coordinates to the content size
      const contentWidth = containerRef.scrollWidth;
      const contentHeight = containerRef.scrollHeight;
      const ratioX = documentX / contentWidth;
      const ratioY = documentY / contentHeight;
      
      // Apply new scale with slight padding for better visibility
      viewerInstance.currentScale = newScale;
      
      // After scaling, content dimensions have changed
      // Wait for the next frame to ensure dimensions have updated
      requestAnimationFrame(() => {
        // Make sure the container's overflow is still set correctly
        containerRef.style.overflow = 'auto';
        
        // Calculate new scroll position to keep the same point under cursor
        const newContentWidth = containerRef.scrollWidth;
        const newContentHeight = containerRef.scrollHeight;
        
        const newScrollLeft = ratioX * newContentWidth - clientX;
        const newScrollTop = ratioY * newContentHeight - clientY;
        
        // Apply new scroll position
        containerRef.scrollLeft = newScrollLeft;
        containerRef.scrollTop = newScrollTop;
        
        // Add a second frame to ensure rendering is complete
        requestAnimationFrame(() => {
          // Ensure the PDF viewer has updated its internal state
          viewerInstance.update();
        });
      });
    } else {
      // Simple zoom without specific point
      viewerInstance.currentScale = newScale;
      
      // Force update to ensure correct rendering
      requestAnimationFrame(() => {
        viewerInstance.update();
      });
    }
    
    return true; // Scale was updated
  }
  
  return false; // Scale was not updated
};

// Function to show cursor indicator
export const showCursorIndicator = (cursorRef, x, y, isZoomIn) => {
  if (!cursorRef) return;
  
  // Position the custom indicator
  cursorRef.style.left = `${x}px`;
  cursorRef.style.top = `${y}px`;
  cursorRef.style.display = 'block';
  
  // Change border color based on zoom direction
  const color = isZoomIn ? 'green' : 'red';
  cursorRef.style.borderColor = color;
  
  // Change the actual mouse cursor based on zoom direction
  document.body.style.cursor = isZoomIn ? 'zoom-in' : 'zoom-out';
  
  // Hide indicator after a short delay and reset cursor
  setTimeout(() => {
    if (cursorRef) {
      cursorRef.style.display = 'none';
      document.body.style.cursor = 'crosshair'; // Reset to default zoom cursor
    }
  }, 300);
};