"use client"
import React, { useEffect, useState } from 'react';
import { Slider } from "@/components/ui/slider";
import stroke from "@/public/stroke.svg"
import Image from 'next/image';
// import { useSettings } from '@/context/SettingsContext';

const StrokeWidthIcon = () => (
  <Image alt="stroke" src={stroke} height={50}
    width={50} />
);

const PenMenu = ({ selectedTool, onToolUpdate }) => {
  const [strokeWidth, setStrokeWidth] = useState(selectedTool?.strokeWidth || 3);
  const [opacity, setOpacity] = useState(selectedTool?.opacity || 0);

  // Set default opacity based on tool type
  useEffect(() => {
    setStrokeWidth(selectedTool?.strokeWidth || 3);

    // Set appropriate default opacity based on tool type
    if (selectedTool?.type === 'highlighter') {
      setOpacity(selectedTool?.opacity || 30); // Lower opacity for highlighter
    } else {
      setOpacity(selectedTool?.opacity || 85); // Higher opacity for pen
    }
  }, [selectedTool]);

  // Handle stroke width change
  const onStrokeChange = (value) => {
    const newStrokeWidth = value[0];
    setStrokeWidth(newStrokeWidth);
    onToolUpdate({ ...selectedTool, strokeWidth: newStrokeWidth });
  };

  // Handle opacity change
  const onOpacityChange = (value) => {
    const newOpacity = value[0];
    setOpacity(newOpacity);
    onToolUpdate({ ...selectedTool, opacity: newOpacity });
  };

  // Determine opacity range based on tool type
  const getOpacityRange = () => {
    if (selectedTool?.id === 'highlighter') {
      return { min: 10, max: 50 }; // Highlighter should be more transparent
    } else {
      return { min: 80, max: 100 }; // Pen should be more opaque
    }
  };

  const opacityRange = getOpacityRange();

  // Normalize stroke width to a percentage for display
  const normalizedStrokeWidth = Math.round((strokeWidth / 10) * 100);

  // Normalize opacity for display (it's already a percentage but we want to show it relative to its range)
  const normalizedOpacity = Math.round(((opacity - opacityRange.min) / (opacityRange.max - opacityRange.min)) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-full py-1.5 px-10 flex items-center gap-4 w-full relative border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Stroke Width */}
      <div className="flex items-center gap-1.5">
        <span className="text-gray-700 dark:text-gray-300 text-xs">Stroke</span>
        <div className="bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5 flex items-center gap-0.5">
          <StrokeWidthIcon className="text-gray-600 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200 text-xs font-medium">{normalizedStrokeWidth}%</span>
        </div>
        <div className="w-20">
          <Slider
            value={[strokeWidth]}
            max={10}
            min={1}
            step={1}
            onValueChange={onStrokeChange}
            className="w-full"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-gray-200 dark:bg-gray-600" />

      {/* Opacity */}
      <div className="flex items-center gap-2 flex-1 w-44">
        <span className="text-gray-700 dark:text-gray-300 text-xs">Opacity</span>
        <div className="bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5 flex items-center gap-0.5">
          <span className="text-gray-700 dark:text-gray-200 text-xs font-medium">{normalizedOpacity}%</span>
        </div>
        <div className="flex-1">
          <Slider
            value={[opacity]}
            max={opacityRange.max}
            min={opacityRange.min}
            step={1}
            onValueChange={onOpacityChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};


export default PenMenu;