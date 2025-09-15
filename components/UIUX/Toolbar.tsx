"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";

import undo from "@/public/newIcons/right.svg";
import redo from "@/public/newIcons/left.svg";
import shapes from "@/public/newIcons/shapes.svg";
import addtext from "@/public/newIcons/text.svg";
import colorPicker from "@/public/newIcons/colorPicker.svg"
import { useSettings } from "@/context/store";
import ShapeSelector from "../PDFViewer/canvas/Tools/ShapeSelector";
import TextMenu from "../PDFViewer/canvas/Tools/TextMenu";
import PenMenu from "../PDFViewer/canvas/Tools/PenMenu";

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
      position="fixed right-0 left-0 flex items-center justify-center -top-24"
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
      position="fixed right-0 left-0 flex items-center justify-center -top-20"
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
      position="fixed right-0 left-0 flex items-center justify-center -top-20"
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
    setisSmartNoteTakingVisible,
    isSmartNoteTakingVisible,

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
            width={22}
            height={22}
            className="w-[34px] h-[34px] max-lg:w-[20px] max-lg:h-[20px] object-contain"
            alt="Redo"
          />

        ),
      },
      {
        id: "redo",
        icon: (

          <Image
            src={redo}
            width={22}
            height={22}
            className="w-[34px] h-[34px] max-lg:w-[20px] max-lg:h-[20px] object-contain"
            alt="Undo"
          />
        ),
      },
      {
        id: "selection",
        type: "pen",
        icon: (
          <Image
            src={"/newIcons/navigator.svg"}
            className="w-[50px] h-[50px]  scale-x-[1.5] scale-y-[1.5]  pt-[20px]"
            width={30}
            height={30}

            alt="select"
          />
        ),
        color: globalSelectedColor,
        strokeWidth: 1,
        opacity: 100,
      },
      {
        id: "pencil",
        type: "pen",
        icon: (

          <Image
            src={"/newIcons/pencil.svg"}
            className="w-[22px] h-[140px] scale-x-[2.7] scale-y-[2.2] pt-[33px] "
            width={100}
            height={140}
            alt="select"
          />
        ),

        color: globalSelectedColor,
        strokeWidth: penState?.strokeWidth,
        opacity: penState?.opacity,
      },
      {
        id: "highlighter",
        type: "pen",
        icon: (
          <Image
            src={"/newIcons/marker.svg"}
            className="w-[22px] h-[140px] scale-x-[2.7] scale-y-[2.2] pt-[33px]  "
            width={100}
            height={140}
            alt="select"
          />
        ),
        color: globalSelectedColor,
        strokeWidth: highLighterState?.strokeWidth,
        opacity: highLighterState?.opacity,
      },
      {
        id: "objectEraser",
        type: "pen",
        icon: (
          <Image
            src={"/newIcons/eraser.svg"}
            className="w-[22px] h-[140px] scale-x-[2.7] scale-y-[2.2]  pt-[33px] "
            width={100}
            height={140}
            alt="select"
          />
        ),
        color: globalSelectedColor,
        strokeWidth: 1,
      },
      {
        id: "shapes",
        icon: (
          <Image
            src={shapes}
            width={22}
            height={22}
            className="w-[34px] h-[34px] max-lg:w-[20px] max-lg:h-[20px] object-contain"
            alt="Shapes"
          />
        ),
        color: globalSelectedColor,
      },
      {
        id: "text",
        icon: (
          <Image
            src={addtext}
            width={22}
            height={22}
            className="w-[34px] h-[34px] max-lg:w-[20px] max-lg:h-[20px] object-contain"
            alt="Add Text"
          />
        ),
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
          data="/newIcons/navigator.svg"
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

    setActiveTool({id: "rectangleSelection",})
  }, [isSmartNoteTakingVisible])

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
    toolbarDeactivate()


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
      // setOpenMenu("text");
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
      className={`w-full font-sans h-full transition-all duration-300  flex`}>

      {/* Conditionally render either collapsed or expanded view, not both */}
      {/* {isCollapsed ? (
        // Collapsed view - show only active tool
        <div
          className="flex items-center bg-transparent"
          onClick={toggleToolbar}
        >
          {selectedTool && (
            <button className="rounded-full  transition-colors overflow-hidden shadow-lg">
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
      ) : ( */}

      <div className="flex items-center justify-center w-full h-[90px] overflow-hidden px-4">

        {/* Undo and Redo */}
        <div className="flex items-center gap-[12px] max-lg:gap-1">
          {toolsByType.undoRedo.map((tool) => {
            const toolState = getToolState(tool.id);
            return (
              <button
                key={tool.id}
                className="flex items-center justify-center w-[34px] h-[34px]"
                onMouseEnter={() => setHoveredToolId(tool.id)}
                onMouseLeave={() => setHoveredToolId(null)}
                onClick={() => setActiveTool(toolState)}
              >
                {renderTool(toolState)}
              </button>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="w-[27px] max-lg:w-1"></div>

        {/* Color Picker */}
        <div className="flex items-center justify-center ">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center justify-center w-[34px] h-[34px] relative"
            aria-label="Custom color"
          >
            <Image
              src={colorPicker}
              height={22}
              width={22}
              alt="color picker"
              className="w-[34px] h-[34px] max-lg:w-[20px] max-lg:h-[20px] object-contain"
            />
          </button>
          {showColorPicker && (

            <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-3 z-50 border" onClick={(e) => e.stopPropagation()} >
              <div className="grid grid-cols-8 gap-2 mb-3" >
                {[
                  '#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#FFFF00', '#ADFF2F', '#00FF00', '#00FA9A',
                  '#00FFFF', '#00BFFF', '#0080FF', '#0000FF', '#4169E1', '#8A2BE2', '#9400D3', '#FF00FF',
                  '#FF1493', '#FF69B4', '#FFC0CB', '#F5F5DC', '#FFFFFF', '#D3D3D3', '#A9A9A9', '#696969',
                  '#000000', '#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F4A460', '#DAA520', '#B8860B'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleColorChange(color);
                    }}
                    className="w-6 h-6 rounded border-2 border-zinc-300 hover:border-zinc-500 hover:scale-110 transition-all duration-200"
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>

              {/* Custom color input */}
              <div className="border-t pt-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Custom Color:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedTool?.color || globalSelectedColor}
                    onChange={(e) => { e.stopPropagation(); handleColorChange(e.target.value) }}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedTool?.color || globalSelectedColor}
                    onChange={(e) => { e.stopPropagation(); handleColorChange(e.target.value) }}
                    className="flex-1 px-2 py-1 text-sm border rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowColorPicker(false)}
                className="mt-3 w-full px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded transition-colors"
              >
                Done
              </button>
            </div>


          )}
        </div>

        {/* Spacer */}
        <div className="w-[27px] max-lg:w-1"></div>

        {/* Main Tools (Markers) - These need consistent height */}
        <div className="flex items-center gap-[27px] max-lg:gap-4">
          {toolsByType.markers.map((tool) => {
            const toolState = getToolState(tool.id);
            return (
              <div
                key={tool.id}
                className={`relative transition-transform duration-300 ease-in-out ${hoveredToolId === tool.id ||
                  selectedTool?.id === tool.id
                  ? "-translate-y-2"
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
                  className={"cursor-pointer"}
                >
                  {renderTool(toolState)}
                </button>
              </div>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="w-[27px] max-lg:w-1"></div>

        {/* Shapes and Text */}
        <div className="flex items-center gap-[27px] max-lg:gap-1">
          {toolsByType.shapesAndText.map((tool) => {
            const toolState = getToolState(tool.id);
            return (
              <button
                key={tool.id}
                className="flex items-center justify-center w-[34px] h-[34px]"
                onClick={() => handleToolSelect(tool.id)}
                id={tool.id === "shapes" ? "toolbar-geometric" : "toolbar-text"}
              >
                {renderTool(toolState)}
              </button>
            );
          })}
        </div>


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
      {/* )} */}

    </div>
  );
};

export default Toolbar;
