import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ColorPicker = ({ onChange }) => {
  const [color, setColor] = useState("black");
  return (
    <div className="relative inline-block">
      {/* Gradient ring container */}
      <div className="w-6 h-6 rounded-full p-0.5 relative animate-spin-slow bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500">
        {/* Inner container for color picker */}
        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
          {/* Color input */}
          <input
            type="color"
            value={color}
            onChange={(e) => { onChange(e.target.value); setColor(e.target.value) }}
            className="w-full h-full opacity-0 absolute cursor-pointer z-10"
          />
          {/* Color display */}
          <div
            className="w-4 h-4 rounded-full cursor-pointer"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
};

const TextMenu = () => {
  const [fontSize, setFontSize] = useState("3");
  const [fontFamily, setFontFamily] = useState("Roboto");
  const [fontWeight, setFontWeight] = useState("Bold");
  const onStrokeColorChange = (color: string) => {
    console.log(color);
  };

  return (
    <div className="relative">
      <div className="bg-white dark:bg-gray-800 rounded-full py-1.5 px-3 flex items-center gap-4 shadow-lg dark:shadow-gray-900/20 border border-gray-100 dark:border-gray-700">
        {/* Color */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-700 dark:text-gray-300 text-xs">Color</span>
          <ColorPicker onChange={onStrokeColorChange} />
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200 dark:bg-gray-600" />

        {/* Size */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-700 dark:text-gray-300 text-xs">Size</span>
          <div className="bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5 flex items-center gap-1">
            <span className="text-gray-600 dark:text-gray-400 text-xs">T</span>
            <span className="text-gray-700 dark:text-gray-200 text-xs font-medium">
              {fontSize}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200 dark:bg-gray-600" />

        {/* Font */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-700 dark:text-gray-300 text-xs">Font</span>
          <div className="flex gap-1.5">
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger className="bg-gray-100 dark:bg-gray-700 border-0 h-6 text-xs px-2 w-20 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="Roboto" className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Roboto</SelectItem>
                <SelectItem value="Arial" className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Arial</SelectItem>
                <SelectItem value="Helvetica" className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Helvetica</SelectItem>
              </SelectContent>
            </Select>

            <Select value={fontWeight} onValueChange={setFontWeight}>
              <SelectTrigger className="bg-gray-100 dark:bg-gray-700 border-0 h-6 text-xs px-2 w-16 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">
                <SelectValue placeholder="Weight" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="Regular" className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Regular</SelectItem>
                <SelectItem value="Medium" className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Medium</SelectItem>
                <SelectItem value="Bold" className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pointer */}
      <div className="absolute w-3 h-3 bg-white dark:bg-gray-800 rotate-45 -bottom-1.5 right-8 shadow-xl dark:shadow-gray-900/30 border-b border-r border-gray-100 dark:border-gray-700" />
    </div>
  );
};

export default TextMenu;
