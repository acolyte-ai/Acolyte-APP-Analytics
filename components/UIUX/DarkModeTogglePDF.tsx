"use client";
import React, { useEffect, useState } from "react";
import { useSettings } from "@/context/store";
import { motion } from "framer-motion";
import { Moon, Sun, FileText } from "lucide-react";
import PageInverter from "./pdfjs-5/PageInverter";

interface Type {
  type?: "global" | "local";
}

const DarkToggleButtonPDF = ({ type = "global" }: Type) => {
  const [isDark, setIsDark] = useState(false);
  const { setisDarkFilter, setisDarkMode, globalDarkMode, setglobalDarkMode, setisPdfDarkModeEnable } =
    useSettings();

  useEffect(() => {
    // Check for saved preference in localStorage
    const savedGlobalTheme = localStorage.getItem("theme");
    const savedPdfDarkMode = localStorage.getItem("pdfDarkMode");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // Handle global theme
    if (savedGlobalTheme === "dark" || (!savedGlobalTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
      setisDarkMode(true);
      setglobalDarkMode(true);

      if (type === "global") {
        setIsDark(true);
      }
    }

    // Handle PDF-specific dark mode
    if (type === "local") {

      const pdfDarkModeEnabled = savedPdfDarkMode === "true";
      console.log("mounting tim eits working", setisPdfDarkModeEnable)
      setIsDark(pdfDarkModeEnabled);
      setisDarkFilter(pdfDarkModeEnabled);
      setisPdfDarkModeEnable(pdfDarkModeEnabled);
    }
  }, [type, setisDarkFilter, setisDarkMode, setglobalDarkMode, setisPdfDarkModeEnable]);

  const toggleDarkMode = () => {
    const newDarkState = !isDark;

    if (type === "global") {
      // Toggle global dark mode
      if (newDarkState) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      setglobalDarkMode(newDarkState);
      setisDarkMode(newDarkState);
    } else if (type === "local") {
      // Toggle PDF-specific dark mode
      localStorage.setItem("pdfDarkMode", String(newDarkState));
      setisDarkFilter(newDarkState);
      setisPdfDarkModeEnable(newDarkState);
    }

    setIsDark(newDarkState);
  };

  return (
    <motion.button
      onClick={toggleDarkMode}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className="rounded-full shadow-md">
        <div
          className={`flex items-center justify-center rounded-full p-4 transition-all ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}
        >
          <div className="relative flex items-center justify-center">
            {/* Dark mode icon */}
            <motion.div
              animate={{
                opacity: isDark ? 1 : 0,
                scale: isDark ? 1 : 0.5,
                rotate: isDark ? 0 : -30,
              }}
              transition={{ duration: 0.2 }}
              className="absolute"
            >
              <Moon className="h-8 w-8 md:h-5 md:w-5 sm:h-3 sm:w-3" />
            </motion.div>

            {/* Light mode icon */}
            <motion.div
              animate={{
                opacity: isDark ? 0 : 1,
                scale: isDark ? 0.5 : 1,
                rotate: isDark ? 30 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="absolute"
            >
              <Sun className="h-8 w-8 md:h-5 md:w-5 sm:h-3 sm:w-3" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default DarkToggleButtonPDF;