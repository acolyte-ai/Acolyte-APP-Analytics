"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";

import {
  ArrowLeft,
  Film,
  Link2,
  MousePointer2,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Grab,
  Hand,
  Maximize2,
  Minimize2,
  ChevronsRight,
  Minimize2Icon,
} from "lucide-react";
import Image from "next/image";

import undo from "@/public/undo.svg";
import redo from "@/public/redo.svg";
import shapes from "@/public/shapestool.svg";
import addtext from "@/public/text.svg";
import menu from "@/public/toolbarmenu.svg";
import { useSettings } from "@/context/SettingsContext";
import ShapeSelector from "./toolbar/ShapeSelector";
import TextMenu from "./toolbar/TextMenu";
import PenMenu from "./toolbar/PenMenu";
import { position } from "html2canvas/dist/types/css/property-descriptors/position";

// Types
interface Tool {
  id: string;
  type?: string;
  icon?: React.ReactNode;
  text?: string;
  className?: string;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  style?: React.CSSProperties;
}

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTool?: Tool | null;
  onToolUpdate?: (updatedTool: Tool) => void;
  setPenState?: (tool: Pen) => void;
  sethighLighterState?: (tool: Pen) => void;
}

// Context for settings

// Constants
const DEFAULT_COLORS = ["#000", "#228be6", "#40c057", "#ffd43b", "#fa5252"];

// Reusable Menu Component with Click Outside Handler
const MenuBase = ({
  isOpen,
  onClose,
  children,
  className,
  position = "absolute right-2 bottom-32",
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  position?: string;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={menuRef} className={`${position} ${className || ""} z-50`}>
      {children}
    </div>
  );
};


// Shape selector menu component
const ShapeSelectorMenu = ({
  isOpen,
  onClose,
  selectedTool,
  onToolUpdate,
}: MenuProps) => {
  return (
    <MenuBase
      isOpen={isOpen}
      onClose={onClose}
      position="fixed right-1 -top-20"
      className={`
        transform
        transition-all duration-200 ease-out
        ${isOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-8"
        }
        ${!isOpen && "pointer-events-none"}
      `}
    >
      <div
        className={`
           rounded-xl shadow-lg
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-y-0" : "translate-y-4"}
        `}
      >
        <ShapeSelector
          selectedTool={selectedTool}
          onToolUpdate={onToolUpdate}
        />
      </div>
    </MenuBase>
  );
};

// Text options menu component
const TextOptionsMenu = ({
  isOpen,
  onClose,
  selectedTool,
  onToolUpdate,
}: MenuProps) => {
  return (
    <MenuBase
      isOpen={isOpen}
      onClose={onClose}
      position="fixed left-24 -top-20"
      className={`
        transform
        transition-all duration-300 ease-out
        ${isOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-8"
        }
        ${!isOpen && "pointer-events-none"}
      `}
    >
      <div
        className={`
           rounded-xl shadow-lg
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-y-0" : "translate-y-4"}
        `}
      >
        <TextMenu selectedTool={selectedTool} onToolUpdate={onToolUpdate} />
      </div>
    </MenuBase>
  );
};

const PenOptionsMenu = ({
  isOpen,
  onClose,
  selectedTool,
  onToolUpdate,
  sethighLighterState,
  setPenState,
}) => {
  const updateState = (updatedTool) => {
    if (selectedTool?.id === "pencil") {
      setPenState(updatedTool);
    } else if (selectedTool?.id === "highlighter") {
      sethighLighterState(updatedTool);
    }
    onToolUpdate(updatedTool);
  };

  return (
    <MenuBase
      isOpen={isOpen}
      onClose={onClose}
      position="fixed left-24 -top-20"
      className={`
        transform
        transition-all duration-300 ease-out
        ${isOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-8"
        }
        ${!isOpen && "pointer-events-none"}
      `}
    >
      <div
        className={`
           rounded-xl shadow-lg
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-y-0" : "translate-y-4"}
        `}
      >
        <PenMenu selectedTool={selectedTool} onToolUpdate={updateState} />
      </div>
    </MenuBase>
  );
};

interface Pen {
  strokeWidth: number;
  opacity: number;
}

// Main Toolbar component
const Toolbar = () => {
  // Global state from context
  const {
    setActiveTool,
    selectedColor: globalSelectedColor,
    setSelectedColor: setGlobalSelectedColor,
    activeTool,
    isToolBarCollapsed: isCollapsed, setIsToolBarCollapsed: setIsCollapsed,
    isSmartNoteTakingVisible, setisSmartNoteTakingVisible, currentView
  } = useSettings();


  useEffect(() => {
    if (!isCollapsed) {
      setisSmartNoteTakingVisible(true)
    } else {
      setisSmartNoteTakingVisible(false)
    }
  }, [isCollapsed])

  // Local state
  const [hoveredToolId, setHoveredToolId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [penState, setPenState] = useState<Pen | null>({
    opacity: 100,
    strokeWidth: 1,
  });
  const [highLighterState, sethighLighterState] = useState<Pen | null>({
    opacity: 70,
    strokeWidth: 5,
  });

  // Tool-specific state
  const [toolsState, setToolsState] = useState<Record<string, Tool>>({});

  // Menu state
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Initialize tools with default state
  const defaultTools = useMemo(
    () => [
      {
        id: "undo",
        icon: (
          <Image
            src={undo}
            className="text-gray-600 w-[28px] h-[28px] "
            alt="Undo"
          />
        ),
      },
      {
        id: "redo",
        icon: (
          <Image
            src={redo}
            className="text-gray-600 w-[28px] h-[28px]"
            alt="Redo"
          />
        ),
      },
      {
        id: "selection",
        type: "pen",
        icon: (
          <object
            data="/selectiontool.svg"
            type="image/svg+xml"
            style={{ pointerEvents: "none" }}
          />
        ),
        style: {
          padding: "45px 0px 20px 20px", // top, right, bottom, left
        },
        color: globalSelectedColor,
        strokeWidth: 1,
        opacity: 100,
        className: "translate-y-4",
      },
      {
        id: "pencil",
        type: "pen",
        icon: (
          <object
            data="/penciltool.svg"
            type="image/svg+xml"
            style={{ pointerEvents: "none" }}
          />
        ),
        style: {},
        color: globalSelectedColor,
        strokeWidth: penState?.strokeWidth,
        opacity: penState?.opacity,
      },
      {
        id: "highlighter",
        type: "pen",
        icon: (
          <object
            data="/markertool.svg"
            type="image/svg+xml"
            style={{ pointerEvents: "none" }}
          />
        ),
        style: {},
        color: globalSelectedColor,
        strokeWidth: highLighterState?.strokeWidth,
        opacity: highLighterState?.opacity,
      },
      {
        id: "objectEraser",
        type: "pen",
        icon: (
          <object
            data="/erasertool.svg"
            type="image/svg+xml"
            style={{ pointerEvents: "none" }}
          />
        ),
        style: {},
        color: globalSelectedColor,
        strokeWidth: 1,
      },
      {
        id: "shapes",
        icon: <Image src={shapes} alt="Shapes" className="w-[29px] h-[29px]" height={50}
          width={50} />,
        className: "text-gray-600 font-medium",
        color: globalSelectedColor,
      },
      {
        id: "text",
        icon: (
          <Image src={addtext} alt="Add Text" className="w-[29px] h-[29px]" height={50}
            width={50} />
        ),
        className: "text-gray-600",
        color: globalSelectedColor,
      },
    ],
    [globalSelectedColor, penState, highLighterState]
  );

  useEffect(() => {
    setSelectedTool({
      id: "selection",
      type: "pen",
      icon: (
        <object
          data="/selectiontool.svg"
          type="image/svg+xml"
          style={{ pointerEvents: "none" }}
        />
      ),
      style: {
        padding: "45px 0px 20px 20px", // top, right, bottom, left
      },
      color: globalSelectedColor,
      strokeWidth: 1,
      opacity: 100,
      className: "translate-y-4",
    })
  }, [])

  // Initialize tool state on first render
  useEffect(() => {
    const initialToolsState = defaultTools.reduce((acc, tool) => {
      acc[tool.id] = tool;
      return acc;
    }, {} as Record<string, Tool>);

    setToolsState(initialToolsState);
  }, [defaultTools]);

  // Initialize selected tool from active tool
  useEffect(() => {
    if (activeTool && !selectedTool) {
      setSelectedTool(activeTool);
      // Update toolsState with the active tool
      setToolsState((prev) => ({
        ...prev,
        [activeTool.id]: activeTool,
      }));
    }
  }, [activeTool, selectedTool]);

  // Group tools by type
  const toolsByType = useMemo(
    () => ({
      undoRedo: defaultTools.filter((tool) =>
        ["undo", "redo"].includes(tool.id)
      ),
      markers: defaultTools.filter(
        (tool) => tool.type === "pen" || tool.id === "objectEraser"
      ),
      shapesAndText: defaultTools.filter((tool) =>
        ["text", "shapes"].includes(tool.id)
      ),
    }),
    [defaultTools]
  );

  // Update a specific tool with new properties
  const updateTool = (toolId: string, updates: Partial<Tool>) => {
    setToolsState((prev) => {
      const updatedTool = {
        ...prev[toolId],
        ...updates,
        style: {
          ...prev[toolId]?.style,
          ...(updates.color && { border: `2px solid ${updates.color}` }),
          ...updates.style,
        },
      };

      // If this is the currently selected tool, also update selectedTool
      if (selectedTool?.id === toolId) {
        setSelectedTool(updatedTool);
        setActiveTool(updatedTool);
      }

      return {
        ...prev,
        [toolId]: updatedTool,
      };
    });
  };

  // Handle toolbar collapse/expand
  const toggleToolbar = () => {
    // If no tool is selected when expanding, select the default tool
    if (isCollapsed && !selectedTool) {
      const defaultTool = toolsState["selection"];
      setSelectedTool(defaultTool);
      setActiveTool(defaultTool);
    }
    setIsCollapsed(!isCollapsed);



  };

  // Handle color selection
  const handleColorChange = (color: string) => {
    // Update global color state
    setGlobalSelectedColor(color);

    // Update the currently selected tool's color
    if (selectedTool) {
      updateTool(selectedTool.id, { color });
    }

    setShowColorPicker(false);
  };

  // Handle tool selection
  const handleToolSelect = (toolId: string) => {
    const tool = toolsState[toolId];
    setSelectedTool(tool);
    setActiveTool(tool);

    // Close all menus first
    setOpenMenu(null);

    // Open appropriate menu based on tool type
    if (toolId === "shapes") {
      setOpenMenu("shapes");
    } else if (toolId === "text") {
      setOpenMenu("text");
    } else if (
      tool.type === "pen" &&
      !["objectEraser", "selection"].includes(toolId)
    ) {
      setOpenMenu("pen");
    }
  };

  // Handle tool updates from menus
  const handleToolUpdate = (updatedTool: Tool) => {
    updateTool(updatedTool.id, updatedTool);
  };

  // Toggle menu
  const toggleMenu = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  // Render tool icon/text
  const renderTool = (tool: Tool) => {
    if (tool.icon) return tool.icon;
    if (tool.text) return <span className={tool.className}>{tool.text}</span>;
    return null;
  };

  // Get the actual tool state from toolsState or fall back to default if not found
  const getToolState = (toolId: string) => {
    return toolsState[toolId] || defaultTools.find((t) => t.id === toolId);
  };

  return (
    <div
      className={`fixed font-sans transition-all duration-300 ${isCollapsed
        ? "bottom-5 right-10 transform-none"
        : "bottom-9 left-1/2 transform -translate-x-1/2"
        } flex`}
      style={{ zIndex: 100 }}
    >

      {/* Conditionally render either collapsed or expanded view, not both */}
      {isCollapsed ? (
        // Collapsed view - show only active tool
        <div
          className="flex items-center bg-transparent"
          onClick={toggleToolbar}
        >
          {selectedTool && (
            <button className="rounded-full hover:bg-gray-100 bg-[#F6F6F6] transition-colors overflow-hidden shadow-lg">
              <div className="flex items-center justify-center size-20">
                {selectedTool.type === "pen" ? (
                  <div style={{ height: (selectedTool.id === "selection") ? 40 : 100 }}>
                    {renderTool(selectedTool)}
                  </div>
                ) : (
                  renderTool(selectedTool)
                )}
              </div>
            </button>
          )}
        </div>
      ) : (
        // Expanded view
        <div className="bg-transparent flex w-[732px] h-[87px] pl-6 gap-3 max-w-2xl mx-auto">
          {/* Undo and Redo */}
          <div className="flex items-center gap-3 flex-col justify-center">
            {toolsByType.undoRedo.map((tool) => {
              const toolState = getToolState(tool.id);
              return (
                <button
                  key={tool.id}
                  className="rounded-lg hover:bg-gray-100 transition-colors duration-200 p-1 bg-[#F6F6F6] shadow-2xl"
                  onMouseEnter={() => setHoveredToolId(tool.id)}
                  onMouseLeave={() => setHoveredToolId(null)}
                  onClick={() => setActiveTool(toolState)}
                >
                  {renderTool(toolState)}
                </button>
              );
            })}
          </div>
          <div className="bg-[#F6F6F6] rounded-full shadow-2xl overflow-hidden flex gap-3">

            {/* Only render the collapse button when expanded */}

            {!isCollapsed && (

              <div className="text-black cursor-pointer items-center bg-slate-300 shadow-md rounded-full h-10 w-10 ml-5 mt-5 mb-5 flex justify-center" onClick={toggleToolbar}>
                <ChevronsRight />
              </div>

            )}

            {/* Markers */}
            <div className="flex items-center -mb-12 ">
              {toolsByType.markers.map((tool) => {
                const toolState = getToolState(tool.id);
                // console.log(toolState);
                return (
                  <div
                    key={tool.id}
                    className={`relative transition-transform duration-300 ease-in-out ${hoveredToolId === tool.id ||
                      selectedTool?.id === tool.id
                      ? "-translate-y-4"
                      : ""
                      }`}
                    style={toolState.style}

                    id={tool.id === "pencil" ? "toolbar-pen" : tool.id === "highlighter" ? "toolbar-highlight" :
                      tool.id === "objectEraser" ? "toolbar-eraser" :
                        tool.id === "selection" ? "toolbar-selection" : tool.id === "text" ? "" : ""
                    }
                  >
                    <button
                      onMouseEnter={() => setHoveredToolId(tool.id)}
                      onMouseLeave={() => setHoveredToolId(null)}
                      onClick={() => handleToolSelect(tool.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        style={{ width: 60, height: 100, cursor: "pointer" }}
                      >
                        {renderTool(toolState)}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Colors */}
            <div className="flex flex-col items-center justify-center gap-1 mr-2">
              <div className="flex items-center gap-2 mb-2" id="toolbar-color">
                {DEFAULT_COLORS.slice(0, 3).map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`rounded-full hover:bg-gray-100 transition-colors duration-200 ${selectedTool?.color === color
                      ? "ring-2 ring-offset-2 ring-blue-500"
                      : ""
                      }`}
                    style={{
                      backgroundColor: color,
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                    }}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {DEFAULT_COLORS.slice(3).map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`rounded-full hover:bg-gray-100 transition-colors duration-200 ${selectedTool?.color === color
                      ? "ring-2 ring-offset-2 ring-blue-500"
                      : ""
                      }`}
                    style={{
                      backgroundColor: color,
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                    }}
                    aria-label={`Color ${color}`}
                  />
                ))}
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="rounded-full p-1 hover:bg-gray-100 transition-colors duration-200 w-7 h-7 flex items-center justify-center"
                  aria-label="Custom color"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500" />
                </button>
                {showColorPicker && (
                  <div className="absolute bottom-24 bg-white rounded-lg shadow-lg p-2">
                    <input
                      type="color"
                      value={selectedTool?.color || globalSelectedColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-32 h-32"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Shapes and Text */}
            <div className="flex flex-col justify-center items-center gap-1.5 mr-4" >
              {toolsByType.shapesAndText.map((tool) => {
                const toolState = getToolState(tool.id);
                return (
                  <button
                    key={tool.id}
                    className="rounded-full hover:bg-gray-100 transition-colors pt-1 duration-200"
                    onClick={() => handleToolSelect(tool.id)}
                    id={tool.id === "shapes" ? "toolbar-geometric" : "toolbar-text"}
                  >
                    {renderTool(toolState)}
                  </button>
                );
              })}
            </div>

            {/* Menu */}

          </div>
        </div>
      )}

      <ShapeSelectorMenu
        isOpen={openMenu === "shapes"}
        onClose={() => setOpenMenu(null)}
        selectedTool={selectedTool}
        onToolUpdate={handleToolUpdate}
      />
      <TextOptionsMenu
        isOpen={openMenu === "text"}
        onClose={() => setOpenMenu(null)}
        selectedTool={selectedTool}
        onToolUpdate={handleToolUpdate}
      />
      <PenOptionsMenu
        isOpen={openMenu === "pen"}
        onClose={() => setOpenMenu(null)}
        selectedTool={selectedTool}
        onToolUpdate={handleToolUpdate}
        setPenState={setPenState}
        sethighLighterState={sethighLighterState}
      />
    </div>
  );
};

export default Toolbar;
