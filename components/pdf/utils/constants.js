"use client"

// Zoom constants
export const MIN_SCALE = 0.25;
export const MAX_SCALE = 5.0;
export const SCALE_STEP = 1.1;

// Page fit modes
export const FIT_MODES = {
  WIDTH: 'page-width',  // Changed to match PDF.js expected value
  PAGE: 'page-fit',
  NONE: 'custom'
};

// PDF.js CDN URLs
export const PDF_JS_URLS = {
  CSS: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf_viewer.min.css',
  MAIN: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.min.js',
  VIEWER: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf_viewer.min.js',
  WORKER: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.worker.min.js',
  CMAPS: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/cmaps/'
};