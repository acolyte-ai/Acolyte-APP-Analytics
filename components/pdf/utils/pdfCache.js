// pdfCache.js - A lightweight caching mechanism
"use client"

const PDF_CACHE_PREFIX = 'pdf_cache_';
const PDF_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const pdfCache = {
  // Store PDF data in IndexedDB but in smaller chunks to avoid memory issues
  async storePdf(pdfId, arrayBuffer) {
    try {
      // We'll use the browser's IndexedDB but more efficiently
      const db = await openPdfCacheDb();
      
      // Store metadata with timestamp
      await db.put('pdf_metadata', {
        id: pdfId,
        timestamp: Date.now(),
        size: arrayBuffer.byteLength
      });
      
      // Store the actual PDF data
      // This avoids Base64 conversion which was causing memory issues
      await db.put('pdf_data', {
        id: pdfId,
        data: arrayBuffer
      });
      
      return true;
    } catch (error) {
      console.error('Error caching PDF:', error);
      return false;
    }
  },
  
  // Get PDF data from cache
  async getPdf(pdfId) {
    try {
      const db = await openPdfCacheDb();
      
      // Check metadata first (faster than loading the whole PDF)
      const metadata = await db.get('pdf_metadata', pdfId);
      
      // If no metadata or expired, return null
      if (!metadata || (Date.now() - metadata.timestamp > PDF_CACHE_EXPIRY)) {
        return null;
      }
      
      // Get the actual PDF data
      const pdfData = await db.get('pdf_data', pdfId);
      return pdfData ? pdfData.data : null;
    } catch (error) {
      console.error('Error retrieving cached PDF:', error);
      return null;
    }
  },
  
  // Create blob URL from array buffer
  createBlobUrl(arrayBuffer) {
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  }
};

// Helper function to open IndexedDB
export async function openPdfCacheDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PdfCache', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('pdf_metadata')) {
        db.createObjectStore('pdf_metadata', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pdf_data')) {
        db.createObjectStore('pdf_data', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      // Simple wrapper for IndexedDB operations
      resolve({
        async get(storeName, key) {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        },
        async put(storeName, value) {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(value);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        }
      });
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}
