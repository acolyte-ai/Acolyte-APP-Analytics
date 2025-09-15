"use client";
import React, { useEffect, useState } from "react";
import { useSettings } from "@/context/store";
import { motion } from "framer-motion";
import sun from "@/public/newIcons/light.svg";
import Moon from "@/public/newIcons/dark.svg";
import Image from "next/image";

interface Type {
    type?: "global" | "local";
}

const DarkToggleButtonPDF = ({ type = "global" }: Type) => {
    const [isDark, setIsDark] = useState(false);
    const { setisDarkFilter, setisDarkMode, setglobalDarkMode } = useSettings();

    useEffect(() => {
        // Check for saved preference in localStorage
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add("dark");
            if (type === "global") {
                setIsDark(true);
            } else {
                // setisDarkFilter(true);
            }
            setisDarkMode(true);
            setglobalDarkMode(true);
        }
    }, []);

    const toggleDarkMode = () => {
        if (type === "global") {
            if (isDark) {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("theme", "light");
            } else {
                document.documentElement.classList.add("dark");
                localStorage.setItem("theme", "dark");
            }
        } else if (type === "local") {
            setisDarkFilter(!isDark);
        }

        setIsDark(!isDark);
        setglobalDarkMode(!isDark);
    };

    return (
        <motion.button
            onClick={toggleDarkMode}
            className={` rounded-full  transition-all w-full h-full
       `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
                boxShadow: isDark
                    ? "0 4px 6px rgba(0, 0, 0, 0.3)"
                    : "0 4px 6px rgba(0, 0, 0, 0.1)"
            }}
        >
            <div className="relative w-8 h-8 ">
                {/* Dark mode icon */}
                <motion.div
                    animate={{
                        opacity: isDark ? 1 : 0,
                        scale: isDark ? 1 : 0.5,
                        rotate: isDark ? 0 : -30
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute "
                >
                    <Image src={Moon} height={30} width={30} alt="moon" className="h-7 w-7 2xl:w-8 2xl:h-8" />
                </motion.div>

                {/* Light mode icon */}
                <motion.div
                    animate={{
                        opacity: isDark ? 0 : 1,
                        scale: isDark ? 0.5 : 1,
                        rotate: isDark ? 30 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute "
                >
                    {/* <Sun size={20} className="h-8 w-8 md:h-5 md:w-5 sm:h-3 sm:w-3" /> */}
                    <Image src={sun} height={30} width={30} alt="sun" className="h-7 w-7 2xl:w-8 2xl:h-8" />
                </motion.div>
            </div>
        </motion.button>
    );
};

export default DarkToggleButtonPDF;