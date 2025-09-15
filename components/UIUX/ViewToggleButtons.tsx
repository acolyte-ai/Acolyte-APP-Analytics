"use client";

import React, { useEffect, useState } from "react";
import { useSettings } from "@/context/store";
import Image from "next/image";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useViewCombination } from "@/hooks/useViewCombination.ts";

export const ViewToggleButtons = ({
  handleToggle,
}: {
  toggle: boolean;
  handleToggle: () => void;
}) => {
  const { currentViewCombination, activeFeatures, updateViewCombination } =
    useViewCombination();

  const features = [
    { id: "pdf", iconPath: "/newIcons/pdf.svg", label: "PDF" },
    { id: "notes", iconPath: "/newIcons/notes.svg", label: "Notes" },
    { id: "chat", iconPath: "/newIcons/acolyteAI.svg", label: "Chat" },
  ];

  const toggleFeature = (featureId: string) => {
    const isCurrentlyActive = activeFeatures.includes(featureId);

    if (featureId === "chat" || featureId === "notes") {
      handleToggle();
    }

    if (isCurrentlyActive) {
      // Always allow turning OFF a feature (but keep at least one active)
      if (activeFeatures.length <= 1) return;
      const newFeatures = activeFeatures.filter((f) => f !== featureId);
      updateViewCombination(newFeatures.join("+"));
    } else {
      // Allow turning ON a feature, but if we already have 2, replace the last one
      if (activeFeatures.length >= 2) {
        // Replace the last active feature with the new one
        const order = ["pdf", "notes", "chat"];
        const newFeatures = [activeFeatures[0], featureId].sort(
          (a, b) => order.indexOf(a) - order.indexOf(b)
        );
        updateViewCombination(newFeatures.join("+"));
      } else {
        // Normal case: just add the new feature
        const order = ["pdf", "notes", "chat"];
        const newFeatures = [...activeFeatures, featureId].sort(
          (a, b) => order.indexOf(a) - order.indexOf(b)
        );
        updateViewCombination(newFeatures.join("+"));
      }
    }
  };

  return (
    <ToggleGroup
      type="multiple"
      value={activeFeatures}
      className="flex items-center rounded-full bg-white dark:bg-[#181A1D] shadow-none
   dark:border-none border border-[#36AF8D] p-1 gap-1"
    >
      {features.map((feature) => {
        const isActive = activeFeatures.includes(feature.id);
        // Now all features are always toggleable (except we prevent turning off the last one)
        const canToggle = isActive ? activeFeatures.length > 1 : true;

        return (
          <ToggleGroupItem
            key={feature.id}
            value={feature.id}
            onClick={() => {
              toggleFeature(feature.id);
            }}
            disabled={!canToggle}
            className={`group relative flex items-center justify-center gap-2
          text-sm font-medium transition-all duration-300 shadow-none
             ${feature.label === "Chat"
                ? "rounded-r-full"
                : feature.label === "PDF"
                  ? "rounded-l-full"
                  : ""
              }

          ${isActive
                ? `
               text-white dark:text-white bg-gradient-to-r dark:from-[#181A1D] dark:to-[#181A1D]  font-semibold
               border-0 `
                : canToggle
                  ? `text-white dark:text-white hover:text-white
                 hover:bg-white/5`
                  : `text-white dark:text-white cursor-not-allowed `
              }
           'cursor-pointer'
        `}
            title={
              isActive
                ? activeFeatures.length === 1
                  ? "Cannot disable - at least one feature must be active"
                  : `Disable ${feature.label}`
                : activeFeatures.length >= 2
                  ? `Enable ${feature.label} (will replace one active feature)`
                  : `Enable ${feature.label}`
            }
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src={feature.iconPath}
                  alt={feature.label}
                  width={40}
                  height={40}
                  className={`
            transition-all duration-300 w-[28px] h-[25px]
            ${isActive
                      ? "grayscale-0 dark:grayscale-0 dark:brightness-110"
                      : "dark:grayscale dark:brightness-200 grayscale brightness-100 "
                    }
            ${!isActive && canToggle ? "dark:group-hover:brightness-200" : ""}
          `}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{feature.label}</p>
              </TooltipContent>
            </Tooltip>

            {/* Expand label when active */}
            <span
              className={`
          overflow-hidden transition-all duration-300 whitespace-nowrap
          ${isActive
                  ? "w-fit"
                  : "max-w-0 group-hover:max-w-[100px] "
                }
        `}
            ></span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
};