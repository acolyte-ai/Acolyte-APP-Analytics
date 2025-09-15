"use client"
import React from 'react';

const PDFToolbar = ({ isReady, annotationMode, handleToggleHighlight }) => {
  return (
    <div className="bg-white p-3 border-b border-gray-300 flex flex-wrap gap-2 justify-between items-center">
      {/* Highlight tool */}
      <div className="flex items-center space-x-1">
        <button
          onClick={handleToggleHighlight}
          disabled={!isReady}
          className={`px-2 py-1 border rounded hover:bg-yellow-50 disabled:opacity-50 ${
            annotationMode === 9
              ? "bg-yellow-100 border-yellow-400"
              : "bg-white border-gray-300"
          }`}
          title="Highlight text"
        >
          <span role="img" aria-label="Highlight">
            🖌️
          </span>{" "}
          Highlight
        </button>
      </div>
    </div>
  );
};

export default PDFToolbar;