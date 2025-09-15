"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSettings } from "@/context/store";
import useUserId from "@/hooks/useUserId";
import { Button } from "@/components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import PDFViewer from "@/components/pdf/pdfjs-8/Render";
import { ChatInterface } from "@/components/chat/Interface/chat-interface";
import ExcalidrawComponent from "../excalidraw/ExcalidrawComponent";
import NavigationFeature from "@/components/UIUX/NavigationFeature";
import AIToolsSidebar from "@/components/pdf/pdfjs-8/aiTools";
import DocumentInsights from "@/components/pdf/pdfjs-8/documentationInsight";
import ChatService from "@/components/chat/services/chatService";
import { useSyncLogic } from "../AI/SyncLogic";

// Memoized components to prevent unnecessary re-renders
const MemoizedPDFViewer = React.memo(PDFViewer);
const MemoizedChatInterface = React.memo(ChatInterface);
const MemoizedExcalidrawComponent = React.memo(ExcalidrawComponent);
const MemoizedNavigationFeature = React.memo(NavigationFeature);
const MemoizedAIToolsSidebar = React.memo(AIToolsSidebar);
const MemoizedDocumentInsights = React.memo(DocumentInsights);

export default function Reader() {
  const { id } = useParams();
  const userId = useUserId();
  const {
    data,
    setcurrentDocumentId,
    isSmartNoteTakingVisible,
    activeTool,
    documentInsight,
    aiTrainIcon,
    isExpanded,
    viewCombination,
  } = useSettings();

  const { syncAll, isDownloaded, download } = useSyncLogic();

  useEffect(() => {
    // Call download only once on mount
    if (download) {
      download();
    }

    const handleBeforeUnload = () => {
      syncAll();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      syncAll(); // run on unmount
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [id, userId]);

  // Memoize view configuration - only depends on viewCombination
  const viewConfig = useMemo(() => {
    const activeFeatures = viewCombination.split("+");
    const componentOrder = ["pdf", "chat", "notes"];
    const orderedComponents = componentOrder.filter((comp) =>
      activeFeatures.includes(comp)
    );
    const isSplitView = activeFeatures.length > 1;

    let panelSizes = { first: 100 };
    if (activeFeatures.length === 2) {
      panelSizes = { first: 50, second: 50 };
    } else if (activeFeatures.length === 3) {
      panelSizes = { first: 33.33, second: 33.33, third: 33.34 };
    }

    return {
      activeFeatures,
      orderedComponents,
      isSplitView,
      panelSizes,
      shouldShowPDF: activeFeatures.includes("pdf"),
      shouldShowChat: activeFeatures.includes("chat"),
      shouldShowNotes: activeFeatures.includes("notes"),
    };
  }, [viewCombination]);

  // Memoize sidebar configuration
  const sidebarConfig = useMemo(() => {
    // Show sidebar only when in single view mode (not split view)
    const shouldShowSidebar = !viewConfig.isSplitView;
    const showAITools = aiTrainIcon && shouldShowSidebar;
    const showDocumentInsights =
      documentInsight && !aiTrainIcon && shouldShowSidebar;

    return {
      shouldShowSidebar,
      showAITools,
      showDocumentInsights,
    };
  }, [viewConfig.isSplitView, aiTrainIcon, documentInsight]);

  // Memoize overlay configuration
  const overlayConfig = useMemo(() => {
    const shouldShowOverlay = data || isSmartNoteTakingVisible;
    const overlayClasses = `absolute top-0 right-0 z-10 h-screen ${
      isExpanded
        ? "w-full px-[35px]"
        : "xl:w-[calc(100vw-250px)] w-[calc(100vw-111px)] px-[35px]"
    } rounded-[31px] bg-transparent`;

    return {
      shouldShowOverlay,
      overlayClasses,
    };
  }, [data, isSmartNoteTakingVisible, isExpanded]);

  useEffect(() => {
    setcurrentDocumentId(id);
  }, [id, setcurrentDocumentId]);

  // Memoized render functions
  const renderSidebar = useCallback(() => {
    if (sidebarConfig.showAITools) {
      return (
        <div
          className={`top-[90px] xl:top-36 pr-[35px] h-screen overflow-hidden transition-transform duration-300 bg-[#EBEBF5] text-black dark:bg-[#0F1012] dark:text-white`}
        >
          <MemoizedAIToolsSidebar id={id} />
        </div>
      );
    }

    if (sidebarConfig.showDocumentInsights) {
      return (
        <div
          className={`top-[90px] xl:top-24 pr-[35px] h-screen overflow-hidden transition-transform duration-300 bg-[#EBEBF5] text-black dark:bg-[#0F1012] dark:text-white`}
        >
          <MemoizedDocumentInsights sections_new={[]} id={id} />
        </div>
      );
    }

    return null;
  }, [sidebarConfig.showAITools, sidebarConfig.showDocumentInsights]);

  // Container classes
  const containerClasses = useMemo(() => {
    return `transition-all px-[35px] h-full flex flex-col rounded-b-[31px] mr-[17px] relative overflow-hidden duration-300 ease-in-out ${
      isExpanded
        ? "w-full"
        : "xl:w-[calc(100vw-267px)] w-[calc(100vw-128px)] max-md:w-[100vw]"
    } bg-[#EBEBF5] text-black dark:bg-[#0F1012] dark:text-white`;
  }, [isExpanded]);

  // Render all components but hide them with CSS instead of unmounting
  return (
    <div className={containerClasses}>
      <div className="h-full w-full mb-6 xl:mb-[27px] rounded-t-[9px] overflow-hidden transition-all duration-300 dark:bg-[#25272c] bg-white">
        <div className="flex flex-col items-center h-full w-full overflow-hidden">
          <MemoizedNavigationFeature />

          {viewConfig.isSplitView ? (
            // SPLIT VIEW MODE
            <ResizablePanelGroup
              direction="horizontal"
              className="h-full w-full"
              key={viewCombination}
            >
              {viewConfig.orderedComponents.map((component, index) => {
                const isLast =
                  index === viewConfig.orderedComponents.length - 1;
                const panelSize =
                  index === 0
                    ? viewConfig.panelSizes.first
                    : index === 1
                    ? viewConfig.panelSizes.second
                    : viewConfig.panelSizes.third;

                return (
                  <React.Fragment key={component}>
                    <ResizablePanel
                      defaultSize={panelSize}
                      minSize={25}
                      maxSize={65}
                      className="w-full h-full"
                    >
                      {/* PDF Panel */}
                      <div
                        className={`w-full h-full ${
                          component === "pdf" && viewConfig.shouldShowPDF
                            ? "flex"
                            : "hidden"
                        }`}
                      >
                        <div className="w-full h-full relative">
                          <MemoizedPDFViewer id={id} userId={userId} />
                          {overlayConfig.shouldShowOverlay && (
                            <div className={overlayConfig.overlayClasses}>
                              <MemoizedExcalidrawComponent
                                id={id}
                                isTransparent={true}
                                isDownloaded={isDownloaded}
                              />
                            </div>
                          )}
                        </div>
                        {renderSidebar()}
                      </div>

                      {/* Chat Panel */}
                      <div
                        className={`relative h-full w-full ${
                          component === "chat" && viewConfig.shouldShowChat
                            ? "block"
                            : "hidden"
                        }`}
                      >
                        <MemoizedChatInterface id={id} />
                      </div>

                      {/* Notes Panel */}
                      <div
                        className={`relative h-screen w-full ${
                          component === "notes" && viewConfig.shouldShowNotes
                            ? "block"
                            : "hidden"
                        }`}
                      >
                        <MemoizedExcalidrawComponent
                          id={id}
                          isDownloaded={isDownloaded}
                        />
                      </div>
                    </ResizablePanel>
                    {!isLast && <ResizableHandle withHandle />}
                  </React.Fragment>
                );
              })}
            </ResizablePanelGroup>
          ) : (
            // SINGLE VIEW MODE
            <div className="h-full w-full flex">
              {/* All components rendered but hidden */}
              <div
                className={`w-full h-full ${
                  viewConfig.shouldShowPDF ? "flex" : "hidden"
                }`}
              >
                <div className="w-full h-full relative">
                  <MemoizedPDFViewer id={id} userId={userId} />
                  {overlayConfig.shouldShowOverlay && (
                    <div className={overlayConfig.overlayClasses}>
                      <MemoizedExcalidrawComponent
                        id={id}
                        isTransparent={true}
                        isDownloaded={isDownloaded}
                      />
                    </div>
                  )}
                </div>
                {renderSidebar()}
              </div>

              <div
                className={`relative h-full w-full ${
                  viewConfig.shouldShowChat ? "block" : "hidden"
                }`}
              >
                <MemoizedChatInterface id={id} />
              </div>

              <div
                className={`relative h-screen w-full ${
                  viewConfig.shouldShowNotes ? "block" : "hidden"
                }`}
              >
                <MemoizedExcalidrawComponent id={id} isDownloaded={isDownloaded} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
