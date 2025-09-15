"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";

import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import { ActiveTool, useSettings } from "@/context/store";
import { restoreElements, WelcomeScreen } from "@excalidraw/excalidraw";
import { getAppState } from "@/db/note/canvas";
import { saveAppState } from "@/db/note/canvas";
import { v4 as uuidv4 } from "uuid";
import useUserId from "@/hooks/useUserId";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw), // Adjust the import path if necessary
  { ssr: false } // Disable server-side rendering
);

const ExcalidrawComponent = ({
  id,
  isTransparent,
  isDownloaded,
}: {
  id: string;
  isTransparent?: boolean;
  isDownloaded: boolean;
}) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();

  const {
    setIsVisible,
    data,
    setData,
    activeTool,
    setActiveTool,
    setfirst,
    setcurrentView,
    first,
    isDarkFilter,
    currentView,
    setIsScreenShotEnable,
  } = useSettings();

  const userId = useUserId();

  useEffect(() => {
    if (isTransparent) {
      setcurrentView("read");
    } else {
      setcurrentView("write");
      setData(null);
    }
  }, [isTransparent, id, currentView]);

  // Modified dark mode effect to ensure it consistently applies
  useEffect(() => {
    if (!excalidrawAPI) return;

    // Small delay to ensure API is fully initialized
    const timer = setTimeout(() => {
      excalidrawAPI.updateScene({
        appState: {
          theme: isDarkFilter ? "dark" : "light",
        },
      });
      console.log("Theme updated to:", isDarkFilter ? "dark" : "light");
    }, 100);

    return () => clearTimeout(timer);
  }, [isDarkFilter, excalidrawAPI]);

  useEffect(() => {
    setcurrentView("write");
    if (!activeTool?.id) return;
    switchTool(activeTool.id);
  }, []);

  // Handle changes in the Excalidraw component
  const handleChange = async (
    elements: readonly ExcalidrawElement[],
    state: AppState,
    files: BinaryFiles
  ) => {
    if (elements.length < 1) return;
    setIsVisible(false);
    await save();
  };

  const save = async () => {
    const elements = excalidrawAPI?.getSceneElements();
    const state = data ? excalidrawAPI?.getAppState() : {};
    const files = excalidrawAPI?.getFiles() ?? {};
    await saveAppState(id, elements, state, files);
  };

  // Modified function to properly preserve dark mode setting
  const loadCanvasData = async () => {
    if (!excalidrawAPI || !id) return;

    try {
      const canvasData = await getAppState(id);
      if (canvasData) {
        // First add files to excalidraw if they exist
        if (canvasData.files && Object.keys(canvasData.files).length > 0) {
          const fileArray = Object.entries(canvasData.files).map(
            ([id, file]) => ({
              id,
              ...file,
            })
          );

          excalidrawAPI.addFiles(fileArray);
        }

        // Now update the scene with elements and appState
        excalidrawAPI.updateScene({
          elements: canvasData.elements || [],
          appState: {
            // ...canvasData.appState,
            viewBackgroundColor: isTransparent ? "transparent" : "#ffffff",
            theme: isDarkFilter ? "dark" : "light", // Ensure theme is set correctly,
            collaborators: [],
          },
        });

        excalidrawAPI.scrollToContent(undefined, {});
      }
    } catch (error) {
      console.error("Error loading canvas data:", error);
    }
  };

  // Use effect to load canvas data when excalidrawAPI is available and download status changes
  useEffect(() => {
    if (excalidrawAPI && isDownloaded) {
      loadCanvasData();
    }
  }, [excalidrawAPI, isDownloaded,id]);

  // Also reload when switching between transparent/non-transparent modes
  useEffect(() => {
    if (excalidrawAPI) {
      loadCanvasData();
    }
  }, [excalidrawAPI, isTransparent, currentView, id, isDownloaded]);

  const handlePointerUpdate = () => {
    const elements = excalidrawAPI?.getSceneElements();

    if (!activeTool?.id) return;
    switchTool(activeTool.id);
  };

  // Handle undo action
  const undo = () => {
    const undoButton = document.querySelector('[aria-label="Undo"]');
    if (undoButton) {
      undoButton?.click();
    }
  };

  // Handle redo action
  const redo = () => {
    const undoButton = document.querySelector('[aria-label="Redo"]');
    if (undoButton) {
      undoButton?.click();
    }
  };

  const switchTool = (selectedTool: ActiveTool["type"]) => {
    if (!excalidrawAPI) return;

    // Reset tool properties
    const resetToolProperties = () => {
      excalidrawAPI.updateScene({
        appState: {
          currentItemStrokeColor: "#000000",
          currentItemStrokeWidth: 1,
          currentItemOpacity: 100,
        },
      });
    };

    // Define active tool properties with safe defaults
    const toolProperties = activeTool || {
      strokeColor: "#000000",
      strokeWidth: 1,
      opacity: 100,
      fillColor: "transparent",
      color: "#000000",
    };

    switch (selectedTool) {
      case "pen":
      case "pencil":
      case "highlighter":
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: "freedraw" });
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolProperties.color,
            currentItemOpacity: toolProperties.opacity,
            currentItemStrokeWidth: toolProperties.strokeWidth,
          },
        });
        break;

      case "image":
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: "image" });
        break;

      case "arrow":
      case "line":
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: selectedTool });
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolProperties.strokeColor,
            currentItemStrokeWidth: toolProperties.strokeWidth,
            currentItemOpacity: toolProperties.opacity,
          },
        });
        break;

      case "circle":
      case "rectangle":
      case "diamond":
        resetToolProperties();

        // Map the selected tool properly
        const mappedTool =
          selectedTool === "circle"
            ? "ellipse"
            : selectedTool === "rectangle"
            ? "rectangle"
            : selectedTool;

        excalidrawAPI.setActiveTool({ type: mappedTool });
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolProperties.strokeColor || "#000000",
            currentItemStrokeWidth: toolProperties.strokeWidth || 2,
            currentItemOpacity: toolProperties.opacity || 100,
            currentItemBackgroundColor:
              toolProperties?.fillColor || "transparent",
          },
        });

        break;

      case "texthighlighter":
        excalidrawAPI.setActiveTool({ type: "line" });
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolProperties.color,
            currentItemStrokeWidth: 20,
            currentItemOpacity: 50,
          },
        });
        break;

      case "text":
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: "text" });
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolProperties.color,
          },
        });
        break;

      case "objectEraser":
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: "eraser" });
        break;

      case "rectangleSelection":
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: "selection" });
        break;
      case "undo":
        resetToolProperties();
        undo();
        setActiveTool(null);
        break;
      case "redo":
        resetToolProperties();
        redo();
        setActiveTool(null);
        break;

      default:
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: "selection" });
    }
  };

  useEffect(() => {
    if (!activeTool?.id) return;
    switchTool(activeTool.id);
  }, [
    activeTool?.id,
    activeTool?.color,
    excalidrawAPI,
    activeTool?.opacity,
    activeTool?.fillColor,
    activeTool?.strokeColor,
    activeTool?.strokeWidth,
    first,
  ]);

  useEffect(() => {
    function clearSelections() {
      if (!excalidrawAPI || !activeTool?.id) return;
      switchTool(activeTool.id);

      // Remove event listeners to prevent multiple bindings
      document.removeEventListener("mousemove", clearSelections);
      document.removeEventListener("touchmove", clearSelections);
      document.removeEventListener("click", clearSelections);
      document.removeEventListener("touchstart", clearSelections);
    }

    document.addEventListener("mousemove", clearSelections);
    document.addEventListener("touchmove", clearSelections);
    document.addEventListener("click", clearSelections);
    document.addEventListener("touchstart", clearSelections);

    return () => {
      document.removeEventListener("mousemove", clearSelections);
      document.removeEventListener("touchmove", clearSelections);
      document.removeEventListener("click", clearSelections);
      document.removeEventListener("touchstart", clearSelections);
    };
  }, []);

  // Modified addImageToExcalidraw function with check for existing image
  const addImageToExcalidraw = async (x: number, y: number) => {
    if (!excalidrawAPI || !data) return;

    // Check if data.added is true, meaning we've already added this image
    if (data.added) return;

    const imageDataURL = data.url;
    if (!imageDataURL) return;
    const selectionStart = data.selection;
    const selectionBounds = data.bounds;

    const imageId = uuidv4();

    // Create the image file object
    const imageFile = {
      id: imageId,
      dataURL: imageDataURL,
      mimeType: "image/png",
      created: Date.now(),
      lastRetrieved: Date.now(),
    };

    try {
      // Add the file to Excalidraw
      await excalidrawAPI.addFiles([imageFile]);

      // Create the image element
      const imageElement = {
        type: "image",
        fileId: imageId,
        status: "saved",
        x: x,
        y: y,
        width: selectionBounds.width,
        height: selectionBounds.height,
        backgroundColor: "",
        version: 1,
        seed: Math.random(),
        versionNonce: Date.now(),
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
      };

      // Get current scene elements and add new image
      const elements = [
        ...excalidrawAPI.getSceneElementsIncludingDeleted(),
        imageElement,
      ];

      const appState = excalidrawAPI.getAppState();

      // Update the Excalidraw scene and wait for it to complete
      await excalidrawAPI.updateScene({
        elements: restoreElements(elements),
        appState: {},
      });

      // Mark this image as added to prevent duplicate additions
      setData({ ...data, added: true });
      setIsScreenShotEnable(false);

      // Reset data state after successful update
      setTimeout(() => {
        setData(null);
        setfirst(true);
      }, 2000);
    } catch (error) {
      console.error("Error adding image to Excalidraw:", error);
      setData(null);
    }
  };

  return (
    <div
      className={`w-full h-full ${data || isTransparent ? "dotted-grid" : ""}`}
    >
      {!isDownloaded ? (
        // Loading screen
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <img
              src="/bigOwl.svg"
              alt="Loading Logo"
              className="w-20 h-20 animate-bounce"
            />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Loading your canvas...
            </p>
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        </div>
      ) : (
        <Excalidraw
          onChange={handleChange}
          onPointerUpdate={handlePointerUpdate}
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          zenModeEnabled={false}
          onPointerDown={(e, s) => {
            addImageToExcalidraw(s.origin.x, s.origin.y);
          }}
          initialData={{
            appState: {
              viewBackgroundColor: isTransparent ? "transparent" : "#ffffff",
              currentItemStrokeColor: "#000000",
              currentItemBackgroundColor: "transparent",
              theme: isDarkFilter ? "dark" : "light",
            },
          }}
        >
          <WelcomeScreen>
            <WelcomeScreen.Center>
              <img
                src="/bigOwl.svg"
                alt="Acolyte Logo"
                style={{ width: 100, height: 100 }}
              />
              <WelcomeScreen.Center.Heading>
                Welcome to Acolyte!
              </WelcomeScreen.Center.Heading>
            </WelcomeScreen.Center>
          </WelcomeScreen>
        </Excalidraw>
      )}
    </div>
  );
};

export default ExcalidrawComponent;