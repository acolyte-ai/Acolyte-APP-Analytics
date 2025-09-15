import { useState, useCallback } from "react";
import { getPDFViewerAPI } from "@/components/pdf/utils/pdf-utils";

export const usePDFSearch = (iframeRef) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInfo, setSearchInfo] = useState({ current: 0, total: 0 });
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchOptions, setSearchOptions] = useState({
    caseSensitive: false,
    entireWord: false,
    highlightAll: true,
    matchDiacritics: true,
  });

  // Search functions
  const handleSearch = useCallback((query) => {
    const api = getPDFViewerAPI(iframeRef);
    if (!api) {
      console.error("PDF Viewer API not available");
      return;
    }

    if (!query) {
      api.clearSearch();
      setIsSearchActive(false);
      setSearchInfo({ current: 0, total: 0 });
    } else {
      try {
        api.search(query, searchOptions);
        setIsSearchActive(true);
      } catch (error) {
        console.error("Search error:", error);
        alert("Unable to perform search");
      }
    }
    setSearchQuery(query);
  }, [searchOptions, iframeRef]);

  const handleSearchNext = useCallback(() => {
    const api = getPDFViewerAPI(iframeRef);
    if (api && isSearchActive) {
      try {
        api.findNext();
      } catch (error) {
        console.error("Error finding next:", error);
      }
    }
  }, [isSearchActive, iframeRef]);

  const handleSearchPrevious = useCallback(() => {
    const api = getPDFViewerAPI(iframeRef);
    if (api && isSearchActive) {
      try {
        api.findPrevious();
      } catch (error) {
        console.error("Error finding previous:", error);
      }
    }
  }, [isSearchActive, iframeRef]);

  const toggleSearchOption = useCallback((option, value) => {
    setSearchOptions((prev) => {
      const newOptions = {
        ...prev,
        [option]: value !== undefined ? value : !prev[option],
      };

      if (searchQuery) {
        const api = getPDFViewerAPI(iframeRef);
        if (api) api.search(searchQuery, newOptions);
      }

      return newOptions;
    });
  }, [searchQuery, iframeRef]);

  const handleSearchResultsUpdated = useCallback((evt) => {
    const current = typeof evt.matchesCount?.current === "number" ? evt.matchesCount.current : 0;
    const total = typeof evt.matchesCount?.total === "number" ? evt.matchesCount.total : 0;
    setSearchInfo({ current, total });
  }, []);

  return {
    // Search state
    searchQuery,
    searchInfo,
    isSearchActive,
    searchOptions,
    
    // Search functions
    handleSearch,
    handleSearchNext,
    handleSearchPrevious,
    toggleSearchOption,
    handleSearchResultsUpdated,
    setSearchInfo,
    
  };
};