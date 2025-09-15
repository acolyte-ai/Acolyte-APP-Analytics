import { useSettings } from "@/context/store";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import documentInsights from "@/public/newIcons/documentInsight.svg";
import aiTools from "@/public/newIcons/pdfAiTools.svg";
import expand from "@/public/newIcons/fullscreen.svg";
import Image from "next/image";
import { navigationUtils, zoomUtils } from "@/components/pdf/utils/pdf-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Toolbar from "@/components/UIUX/Toolbar";

const Footer = () => {
  const {
    totalPages,
    setisExpanded,
    PdfIframeRef,
    setisSmartNoteTakingVisible,
    isExpanded,
    aiTrainIcon,
    documentInsight,
    setAiTrainIcon,
    setDocument,
    footerVisible,
    isSmartNoteTakingVisible,
    setIsScreenShotEnable,
    setViewCombination,
    viewCombination,
    setFooterVisible,
    setisHeadderVisible,
    isScreenShotEnable,
    currentDocument,
    currentPage, // This comes from API events
    setCurrentPage // Only use this for programmatic navigation
  } = useSettings();

  const [isDragging, setIsDragging] = useState(false);
  const [showThumb, setShowThumb] = useState(true);
  const progressBarRef = useRef(null);
  const isNavigatingRef = useRef(false); // Track if we initiated the navigation

  const progressPercentage = totalPages > 1 ? ((currentPage - 1) / (totalPages - 1)) * 100 : 0;
  const existingPage = usePathname().split("/")[2];

  // Navigation handlers
  const handlePrevPage = () => {
    if (currentPage > 1 && !isNavigatingRef.current) {
      isNavigatingRef.current = true;
      navigationUtils.previousPage(PdfIframeRef);
      // Reset flag after a short delay to allow API event to fire
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && !isNavigatingRef.current) {
      isNavigatingRef.current = true;
      navigationUtils.nextPage(PdfIframeRef);
      // Reset flag after a short delay to allow API event to fire
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    }
  };

  // Navigate to specific page
  const navigateToPage = useCallback((pageNumber) => {
    if (pageNumber !== currentPage && !isNavigatingRef.current) {
      isNavigatingRef.current = true;
      navigationUtils.goToPage(PdfIframeRef, pageNumber);
      // Reset flag after a short delay to allow API event to fire
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    }
  }, [currentPage, PdfIframeRef]);

  // Calculate page from mouse position
  const calculatePageFromPosition = useCallback((clientX) => {
    if (!progressBarRef.current) return currentPage;

    const rect = progressBarRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
    const newPage = Math.round(percentage * (totalPages - 1)) + 1;

    return Math.max(1, Math.min(totalPages, newPage));
  }, [currentPage, totalPages]);

  // Generic event handler for both mouse and touch
  const handleStart = useCallback((clientX) => {
    setIsDragging(true);
    const newPage = calculatePageFromPosition(clientX);
    if (newPage !== currentPage) {
      navigateToPage(newPage);
    }
  }, [currentPage, calculatePageFromPosition, navigateToPage]);

  const handleMove = useCallback((clientX) => {
    if (!isDragging) return;
    const newPage = calculatePageFromPosition(clientX);
    if (newPage !== currentPage) {
      navigateToPage(newPage);
    }
  }, [isDragging, currentPage, calculatePageFromPosition, navigateToPage]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse events
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    handleStart(e.clientX);
  }, [handleStart]);

  const handleMouseMove = useCallback((e) => {
    e.preventDefault();
    handleMove(e.clientX);
  }, [handleMove]);

  // Touch events
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX);
  }, [handleStart]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  // Global event listeners for drag operations
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleEnd);

      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);

      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, handleMouseMove, handleEnd, handleTouchMove]);

  // Hide thumb after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowThumb(false), 3000);
    return () => clearTimeout(timer);
  }, [showThumb]);

  // Helper functions for cleaner JSX
  const isNotesView = () => {
    return viewCombination === "notes" ||
      viewCombination === "pdf+notes" ||
      viewCombination === "notes+pdf" ||
      viewCombination === "notes+chat" ||
      viewCombination === "chat+notes" ||
      isSmartNoteTakingVisible;
  };

  const isProgressBarView = () => {
    return (viewCombination === "pdf+chat" && !isSmartNoteTakingVisible) ||
      (viewCombination === "pdf" && !isSmartNoteTakingVisible);
  };

  const getIconClass = (isActive) => {
    return `w-[22px] h-[20px] ${isActive
      ? "grayscale brightness-0 dark:grayscale-0 dark:brightness-100"
      : "dark:grayscale dark:brightness-200 grayscale-0 brightness-100"
      }`;
  };

  const ActionButton = ({ onClick, icon, tooltip, isActive = false }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="h-8 w-8 p-0 rounded-full hover:bg-gray-700/80 group"
    // disabled={!currentDocument?.id}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Image
            src={icon}
            height={30}
            width={30}
            alt={tooltip}
            className={getIconClass(isActive)}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </Button>
  );

  if (!footerVisible || existingPage === "chat") {
    return null;
  }

  return (
    <div
      className={`${isExpanded
        ? "left-0 right-0 w-full"
        : "xl:left-[250px] xl:w-[calc(100vw-267px)] left-[111px] w-[calc(100vw-128px)] max-md:w-[100vw] max-md:left-0"
        } fixed z-40 bottom-0 bg-[#181A1D]`}
    >
      <div
        className={`w-full px-[35px] pt-4  xl:pt-5 transition-transform duration-300 ${isNotesView() ? "" : "pb-[14px] xl:py-5"}
          bg-[#EBEBF5] text-black dark:bg-[#0F1012] dark:text-white
          backdrop-blur-sm ${isExpanded ? "" : "rounded-b-[31px]"}`}
      >
        <div
          className={`flex items-center ${(viewCombination === "pdf" || viewCombination === "pdf+chat") ? "justify-between" : "justify-end"} w-full ${isNotesView() ? "h-[90px]" : "h-[21px]"
            }`}
        >
          {/* Left Section - Navigation */}
          {viewCombination === "pdf" &&
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    className="h-5 w-5 p-0 rounded-sm bg-[#919191] hover:bg-[#919191] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} className="text-black w-[10px] h-[6px]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Previous</p></TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-1 w-auto">
                <span className="dark:text-white text-black text-sm font-medium">
                  {currentPage}
                </span>
                <span className="text-[#919191] text-sm">/</span>
                <span className="text-[#919191] text-sm">{totalPages}</span>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    className="h-5 w-5 p-0 rounded-sm bg-[#919191] hover:bg-[#919191] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} className="text-black w-[10px] h-[6px]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Next</p></TooltipContent>
              </Tooltip>
            </div>
          }
          {/* Center Section */}
          {isNotesView() && (
            <div className="w-full flex items-center justify-center">
              <Toolbar />
            </div>
          )}

          {isProgressBarView() && (
            <div
              className={` mx-8  justify-center p-4 rounded items-center h-full ${viewCombination === "pdf+chat" ? "w-2/5" : "w-full max-w-md"}`}
              onClick={() => setShowThumb(true)}
              onTouchMove={() => setShowThumb(true)}
            >
              <div
                ref={progressBarRef}
                className="relative cursor-grab active:cursor-grabbing w-full min-h-[20px]"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                style={{ touchAction: "none" }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Progress
                      value={100}
                      className="h-[3px] dark:bg-[#B9B9B9] bg-[#2A2D32] pointer-events-none"
                    />
                  </TooltipTrigger>
                  <TooltipContent><p>Progress bar</p></TooltipContent>
                </Tooltip>

                <div
                  className="absolute top-0 left-0 h-[3px] bg-[#36AF8D] rounded-full transition-all duration-150 ease-out pointer-events-none"
                  style={{
                    width: `${progressPercentage}%`,
                    transitionDuration: isDragging ? "0ms" : "150ms",
                  }}
                />

                {showThumb && (
                  <div
                    className="absolute top-0 -translate-y-1/2 w-4 h-4 bg-[#36AF8D] rounded-full border-2 dark:border-[#2e343b] border-[#B9B9B9] shadow-lg transition-all duration-150 ease-out hover:scale-110 active:scale-95 z-10"
                    style={{
                      left: `calc(${progressPercentage}% - 8px)`,
                      transitionDuration: isDragging ? "0ms" : "150ms",
                      boxShadow: isDragging
                        ? "0 4px 12px rgba(54, 175, 141, 0.4)"
                        : "0 2px 8px rgba(0, 0, 0, 0.3)",
                    }}
                  />
                )}

                <div
                  className="absolute inset-0 -my-2 cursor-grab active:cursor-grabbing"
                  style={{ minHeight: "20px" }}
                />
              </div>
            </div>
          )}

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-1">
            {viewCombination === "pdf" && <div className="flex items-center gap-1">
              <ActionButton
                onClick={() => {
                  setIsScreenShotEnable(prev => !prev);
                  setisSmartNoteTakingVisible(false);
                }}
                icon="/newIcons/camera.svg"
                tooltip="Screen Shot"
                isActive={isScreenShotEnable}
              />

              <ActionButton
                onClick={() => {
                  setAiTrainIcon(!aiTrainIcon);
                  setDocument(false);
                  setisSmartNoteTakingVisible(false);
                  setViewCombination("pdf");
                }}
                icon={aiTools}
                tooltip="AI Tools"
                isActive={aiTrainIcon}
              />

              <ActionButton
                onClick={() => {
                  setDocument(!documentInsight);
                  setAiTrainIcon(false);
                  setisSmartNoteTakingVisible(false);
                  setViewCombination("pdf");
                }}
                icon={documentInsights}
                tooltip="Documents Insight"
                isActive={documentInsight}
              />
            </div>}

            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 hover:bg-zinc-700 text-gray-300 active:text-teal-400 hover:text-teal-400 "
              // disabled={!currentDocument?.id}
              onClick={() => {
                if (!isExpanded) {
                  setAiTrainIcon(false);
                  setDocument(false);
                  setisExpanded(true);
                  zoomUtils.zoomToWidth(PdfIframeRef);
                } else {
                  setisExpanded(false);
                  setFooterVisible(true);
                  setisHeadderVisible(true);
                }
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Image
                    src={expand}
                    height={30}
                    width={30}
                    alt="expand"
                    className={getIconClass(isExpanded)}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{!isExpanded ? "Expand Screen" : "Minimize Screen"}</p>
                </TooltipContent>
              </Tooltip>
            </Button>
          </div>
        </div>
      </div>

      {!isExpanded && <div className="h-5 w-full bg-[#181A1D]"></div>}
    </div>
  );
};

export default Footer;