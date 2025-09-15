"use client"
import React, { useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface PDFSearchProps {
  searchQuery: string;
  handleSearch: (query: string) => void;
  isSearchActive: boolean;
  searchInfo: {
    current: number;
    total: number;
  };
  handleSearchPrevious: () => void;
  handleSearchNext: () => void;
  searchOptions: {
    caseSensitive: boolean;
    entireWord: boolean;
    highlightAll: boolean;
  };
  toggleSearchOption: (option: string) => void;
  setisSearchVisible: (visible: boolean) => void;
}

const PDFSearch: React.FC<PDFSearchProps> = ({
  searchQuery,
  handleSearch,
  isSearchActive,
  searchInfo,
  handleSearchPrevious,
  handleSearchNext,
  searchOptions,
  toggleSearchOption,
  setisSearchVisible
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus the input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    // Use setTimeout to allow the new focus to be established
    setTimeout(() => {
      const activeElement = document.activeElement;
      const searchContainer = containerRef.current;

      // If focus is moving to an element within the search container, don't hide
      if (activeElement && searchContainer && searchContainer.contains(activeElement)) {
        return;
      }

      // Hide search bar when focus leaves the search area
      setisSearchVisible(false);
    }, 0);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Prevent clicks inside the container from bubbling up
    e.stopPropagation();
    
    // Keep focus on input when clicking anywhere in the container
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle clicks outside the search container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setisSearchVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setisSearchVisible]);

  return (
    <div className="fixed top-32 left-0 right-0 flex justify-center z-50 mt-4">
      <div
        ref={containerRef}
        className="w-[850px] relative group"
        onClick={handleContainerClick}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
        >
          <div className="relative w-full h-[43px] group-hover:h-[68px] bg-[#F3F4F9] dark:bg-[#1A1B1F] rounded-[18px] shadow-drop-1 border border-[#B8B8B8] dark:border-[#202020] overflow-hidden transition-all duration-300 ease-in-out">
            {/* Search Icon */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 ml-4">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-500 dark:text-zinc-400">
                <path d="M12.3738 12.3876L17 17M14.3333 7.66667C14.3333 11.3485 11.3485 14.3333 7.66667 14.3333C3.98476 14.3333 1 11.3485 1 7.66667C1 3.98476 3.98476 1 7.66667 1C11.3485 1 14.3333 3.98476 14.3333 7.66667Z" stroke="currentColor" strokeWidth="1.77778" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Search Input */}
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onBlur={handleBlur}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search in PDF..."
              className="w-full py-2 pl-16 pr-32 font-rubik text-[20px] text-zinc-900 dark:text-white focus:outline-none focus:ring-0 focus:border-none h-[43px] transition-colors duration-300 bg-transparent placeholder-zinc-500 dark:placeholder-zinc-400"
              autoFocus
            />

            {/* Navigation Controls */}
            {isSearchActive && searchInfo.total > 0 && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <span className="text-sm text-zinc-600 dark:text-zinc-300">
                  {searchInfo.current} of {searchInfo.total}
                </span>
                <button
                  type="button"
                  onClick={handleSearchPrevious}
                  disabled={!isSearchActive || searchInfo.total === 0}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors duration-200 disabled:opacity-50"
                  aria-label="Previous match"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <ChevronUp className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                </button>
                <button
                  type="button"
                  onClick={handleSearchNext}
                  disabled={!isSearchActive || searchInfo.total === 0}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors duration-200 disabled:opacity-50"
                  aria-label="Next match"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <ChevronDown className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                </button>
              </div>
            )}

            {/* Show "No results" when search is active but no results found */}
            {isSearchActive && searchInfo.total === 0 && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center">
                <span className="text-sm text-zinc-600 dark:text-zinc-300">
                  No results
                </span>
              </div>
            )}

            {/* Additional search options on hover */}
            <div className="absolute top-[43px] pl-16 w-full text-zinc-700 dark:text-zinc-300 text-[15px] px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-4">
              <label className="flex items-center space-x-1 text-sm cursor-pointer" onMouseDown={(e) => e.preventDefault()}>
                <input
                  type="checkbox"
                  checked={searchOptions.caseSensitive}
                  onChange={() => toggleSearchOption("caseSensitive")}
                  onBlur={handleBlur}
                  onMouseDown={(e) => e.preventDefault()}
                  className="form-checkbox h-3 w-3 text-brand-100 dark:text-brand-DEFAULT border-zinc-300 dark:border-zinc-600 rounded focus:ring-brand-100 dark:focus:ring-brand-DEFAULT bg-transparent"
                />
                <span className="select-none" onMouseDown={(e) => e.preventDefault()}>Match case</span>
              </label>
              <label className="flex items-center space-x-1 text-sm cursor-pointer" onMouseDown={(e) => e.preventDefault()}>
                <input
                  type="checkbox"
                  checked={searchOptions.entireWord}
                  onChange={() => toggleSearchOption("entireWord")}
                  onBlur={handleBlur}
                  onMouseDown={(e) => e.preventDefault()}
                  className="form-checkbox h-3 w-3 text-brand-100 dark:text-brand-DEFAULT border-zinc-300 dark:border-zinc-600 rounded focus:ring-brand-100 dark:focus:ring-brand-DEFAULT bg-transparent"
                />
                <span className="select-none" onMouseDown={(e) => e.preventDefault()}>Whole words</span>
              </label>
              <label className="flex items-center space-x-1 text-sm cursor-pointer" onMouseDown={(e) => e.preventDefault()}>
                <input
                  type="checkbox"
                  checked={searchOptions.highlightAll}
                  onChange={() => toggleSearchOption("highlightAll")}
                  onBlur={handleBlur}
                  onMouseDown={(e) => e.preventDefault()}
                  className="form-checkbox h-3 w-3 text-brand-100 dark:text-brand-DEFAULT border-zinc-300 dark:border-zinc-600 rounded focus:ring-brand-100 dark:focus:ring-brand-DEFAULT bg-transparent"
                />
                <span className="select-none" onMouseDown={(e) => e.preventDefault()}>Highlight all</span>
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PDFSearch;