import { useEffect, useState, useCallback } from "react";
import { useSettings } from "@/context/store";

const STORAGE_KEY = "viewCombination";

export function useViewCombination() {
  const { viewCombination, setViewCombination } = useSettings();

  // Get initial value from localStorage or context
  const getInitialValue = () => {
    if (typeof window !== "undefined") {
      const savedValue = localStorage.getItem(STORAGE_KEY);
      if (savedValue) return savedValue;
    }
    return viewCombination || "pdf"; // default to pdf if nothing stored
  };

  const [internalViewCombination, setInternalViewCombination] = useState(getInitialValue);

  const currentViewCombination = viewCombination ?? internalViewCombination;

  // Unified update function
  const updateViewCombination = useCallback(
    (newValue: string) => {
      if (setViewCombination) {
        setViewCombination(newValue);
      }
      setInternalViewCombination(newValue);
    },
    [setViewCombination]
  );

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedValue = localStorage.getItem(STORAGE_KEY);
      if (savedValue && savedValue !== currentViewCombination) {
        updateViewCombination(savedValue);
      }
    }
  }, []);

  // Save to localStorage whenever viewCombination changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, currentViewCombination);
    }
  }, [currentViewCombination]);

  // Parse active features array
  const activeFeatures = currentViewCombination
    ? currentViewCombination.split("+")
    : [];

  return {
    currentViewCombination,
    activeFeatures,
    updateViewCombination,
  };
}
