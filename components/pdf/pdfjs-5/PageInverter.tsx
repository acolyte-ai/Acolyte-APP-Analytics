import { useState, useEffect } from 'react';
import { useSettings } from '@/context/store';

const PageInverter = () => {
  const [isInverted, setIsInverted] = useState(false);
  const [status, setStatus] = useState('');
  const [iframeFound, setIframeFound] = useState(false);

  const { isPdfDarkModeEnable } = useSettings()

  const findPDFViewerIframe = () => {
    // Try to find the iframe by attributes typical for the PDF viewer
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      // Look for PDF viewer iframe based on src or title
      if (iframe.src.includes('/viewer.html') ||
        iframe.title === 'PDF Viewer' ||
        iframe.src.includes('generic/web')) {
        return iframe;
      }
    }

    // If we couldn't find it by specific attributes, return the first iframe
    if (iframes.length > 0) {
      return iframes[0];
    }

    return null;
  };



  const applyInversion = (inverted) => {
    try {
      const iframe = findPDFViewerIframe();
      if (!iframe) {
        setStatus('PDF Viewer iframe not found. Please ensure the viewer is loaded.');
        setIframeFound(false);
        return;
      }

      setIframeFound(true);

      // Access the iframe's document
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

      // Get all elements with class="page" and data-page-number attribute
      const pageElements = iframeDocument.querySelectorAll('.page[data-page-number]');

      if (pageElements.length === 0) {
        setStatus(`No page elements found in PDF viewer. Found ${pageElements.length} elements.`);
        return;
      }

      setStatus(`Applied inversion to ${pageElements.length} pages.`);

      // Apply or remove inversion
      pageElements.forEach(page => {
        page.style.filter = inverted ? 'invert(100%)' : 'none';
      });
    } catch (error) {
      setStatus(`Error: ${error.message}. This might be due to cross-origin restrictions.`);
    }
  };



  useEffect(() => {
    setIsInverted(isPdfDarkModeEnable)
    console.log("setting the page filder", isPdfDarkModeEnable)
    applyInversion(isPdfDarkModeEnable)
  }, [isPdfDarkModeEnable, setIsInverted, applyInversion, iframeFound])

  const toggleInversion = () => {
    const newInvertedState = !isInverted;
    setIsInverted(newInvertedState);
    applyInversion(newInvertedState);
  };

  // Check for iframe on mount
  useEffect(() => {
    const iframe = findPDFViewerIframe();
    if (iframe) {
      setIframeFound(true);
      setStatus('PDF Viewer iframe detected.');
    } else {
      setIframeFound(false);
      setStatus('Waiting for PDF Viewer to load...');

      // Set up a periodic check for the iframe
      const checkInterval = setInterval(() => {
        const iframe = findPDFViewerIframe();
        if (iframe) {
          setIframeFound(true);
          setStatus('PDF Viewer iframe detected.');
          clearInterval(checkInterval);
        }
      }, 1000);

      return () => clearInterval(checkInterval);
    }
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      try {
        const iframe = findPDFViewerIframe();
        if (iframe) {
          const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
          const pageElements = iframeDocument.querySelectorAll('.page[data-page-number]');
          pageElements.forEach(page => {
            page.style.filter = 'none';
          });
        }
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    };
  }, []);

  return (
    null
  );
};

export default PageInverter;