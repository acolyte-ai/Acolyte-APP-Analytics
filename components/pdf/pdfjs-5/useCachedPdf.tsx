"use client"
import { useEffect, useState } from "react";
import { pdfCache } from "../../pdf/utils/pdfCache";

interface PdfProps {
  id: string;
  userId: string | undefined;
}

export const useCachedPdf = ({ id, userId }: PdfProps) => {
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !userId) return;

    const fetchPdf = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First check cache
        const cachedPdf = await pdfCache.getPdf(id);

        if (cachedPdf) {
          console.log(`PDF found in cache: ${id}`);
          // Create blob URL from cached data
          const blobUrl = pdfCache.createBlobUrl(cachedPdf);
          setPdfBlobUrl(blobUrl);
          setIsPdfLoaded(true);
          setIsLoading(false);
          return;
        }

        // Not in cache, fetch from server
        console.log(`Fetching PDF from server: ${id}`);
        setLoadingProgress(10);

        // Get the signed URL
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dev/getpdf?userId=${userId}&documentId=${id}`
        );

        if (!response.ok) {
          throw new Error(`Failed to get download URL for documentId: ${id}`);
        }

        const { downloadURL } = await response.json();
        setLoadingProgress(20);

        // Fetch with progress tracking
        const fetchWithProgress = async (url) => {
          const response = await fetch(url);

          // Get content length if available
          const contentLength = response.headers.get('content-length');
          const total = contentLength ? parseInt(contentLength, 10) : 0;
          let loaded = 0;

          // Create a reader to stream the response
          const reader = response.body.getReader();
          const chunks = [];

          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            chunks.push(value);
            loaded += value.length;

            // Update progress if we know the total size
            if (total > 0) {
              const progress = Math.round((loaded / total) * 80) + 20; // 20-100%
              setLoadingProgress(progress);
            }
          }

          // Combine chunks into a single array buffer
          const allChunks = new Uint8Array(loaded);
          let position = 0;

          for (const chunk of chunks) {
            allChunks.set(chunk, position);
            position += chunk.length;
          }

          return allChunks.buffer;
        };

        // Download the PDF with progress
        const arrayBuffer = await fetchWithProgress(downloadURL);
        setLoadingProgress(95);

        // Store in cache for future use
        await pdfCache.storePdf(id, arrayBuffer);
        setLoadingProgress(100);

        // Create and set blob URL
        const blobUrl = pdfCache.createBlobUrl(arrayBuffer);
        setPdfBlobUrl(blobUrl);
        setIsPdfLoaded(true);
      } catch (error) {
        console.error("Error fetching PDF:", error);
        setError(error.message || "Error loading PDF");
        setIsPdfLoaded(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdf();

    // Clean up blob URL when component unmounts
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [id, userId]);

  return { isPdfLoaded, pdfBlobUrl, isLoading, loadingProgress, error };
};