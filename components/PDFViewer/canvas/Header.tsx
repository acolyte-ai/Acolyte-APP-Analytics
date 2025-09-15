"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSettings } from "@/context/store";
import { getFileById } from "@/db/pdf/fileSystem";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Pause, Timer, RotateCcw } from "lucide-react";
import { Play, Square, X, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import search from "@/public/newIcons/search.svg";
import alarm from "@/public/newIcons/alarm.svg";
import { TrainButton } from "../AI/TrainButton";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ViewToggleButtons } from "@/components/UIUX/ViewToggleButtons";

interface HeaderProps {
  title?: string;
  pages?: number;
  annotations?: number;
  updatedMode?: (value: any) => void;
  mode?: string;
}

export default function Header({ updatedMode, mode }: HeaderProps) {
  const [lastUpdate, setLastUpdate] = useState("");
  const [remainingCount, setRemainingCount] = useState(0);
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "User 1",
      email: "user1@example.com",
      initials: "A",
      color: "bg-blue",
    },
    {
      id: 2,
      name: "User 2",
      email: "user2@example.com",
      initials: "B",
      color: "bg-purple-500",
    },
    {
      id: 3,
      name: "User 3",
      email: "user3@example.com",
      initials: "C",
      color: "bg-red",
    },
  ]);
  const [showInput, setShowInput] = useState(false);
  // const [showUserList, setShowUserList] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [optionsMenu, setOption] = useState<{
    search: boolean;
    single: boolean;
    double: boolean;
    time: boolean;
    train: boolean;
  }>({
    search: false,
    single: true,
    double: false,
    time: false,
    train: false,
  });

  const {
    theme,
    isHeadderVisible,
    currentDocumentId,
    currentDocument,
    setcurrentDocument,
    isSearchVisible,
    setisSearchVisible,
    fileSystem,
    isExpanded,
    isSmartNoteTakingVisible,
    syncStatus,
    setisSmartNoteTakingVisible,
    setIsToolBarCollapsed,
    viewCombination,
  } = useSettings();

  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [initialTime, setInitialTime] = useState(300);
  const [inputMinutes, setInputMinutes] = useState(5);
  const intervalRef = useRef(null);
  const [toggleSmartTakingNotes, settoggleSmartTakingNotes] = useState(false);



  useEffect(() => {
    const validCombinations = ["pdf", "pdf+chat", "chat"];
    const shouldEnable = validCombinations.includes(viewCombination);

    if (toggleSmartTakingNotes && shouldEnable) {
      setIsToolBarCollapsed(false);
    } else {
      setIsToolBarCollapsed(true);
    }
  }, [toggleSmartTakingNotes, viewCombination]);

  // Format time to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Start timer
  const startTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  // Pause timer
  const pauseTimer = () => {
    setIsRunning(false);
  };

  // Stop and reset timer
  const stopTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  // Set new timer duration
  const setTimerDuration = (minutes) => {
    const seconds = minutes * 60;
    setInitialTime(seconds);
    setTimeLeft(seconds);
    setInputMinutes(minutes);
    setIsRunning(false);
  };

  // Timer countdown effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            // Timer finished - you can add notification here
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Progress percentage for visual indicator
  const progressPercentage =
    initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;

  useEffect(() => {
    (async () => {
      const fileId = currentDocumentId; // Replace with the actual file ID
      const fileDetails = await getFileById(fileSystem, fileId);
      // console.log(fileId, fileDetails);

      if (fileDetails) {
        // console.log("File found:", fileDetails);
        setcurrentDocument({
          id: fileDetails.id,
          title: fileDetails.name,
          isTrained: fileDetails.isTrained,
          parentId: fileDetails?.parentId, // Assuming parentId is part of the file details
        });
      } else {
        console.log("File not found");
      }
    })();
  }, [currentDocumentId]);

  const searchBarRef = useRef(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const updateLastUpdateTime = () => {
      const now = new Date();
      const formattedDate = now.toLocaleString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setLastUpdate(formattedDate);
    };

    updateLastUpdateTime();
    const interval = setInterval(updateLastUpdateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updatedMode?.(theme || "light");
  }, [mode, theme, updatedMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setisSearchVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible]);

  // Extract name from email
  const getNameFromEmail = (email) => {
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._]/g, " ");
  };

  // Generate initials from name
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Handle adding new user
  const handleAddUser = async () => {
    if (!emailInput.trim()) return;

    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const name = getNameFromEmail(emailInput);
    const initials = getInitials(name);
    const randomColor = "bg-yellow-400";

    const newUser = {
      id: Date.now(),
      name,
      email: emailInput.trim(),
      initials,
      color: randomColor,
    };

    setUsers((prev) => [...prev, newUser]);
    setEmailInput("");
    setShowInput(false);
    setIsLoading(false);
    setRemainingCount(remainingCount + 1);
  };

  // Handle key press in input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddUser();
    } else if (e.key === "Escape") {
      setShowInput(false);
      setEmailInput("");
    }
  };

  // Remove user
  const removeUser = (userId) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const visibleUsers = users.slice(0, 3);
  // const remainingCount = Math.max(0, users.length - 3);

  const handleClose = () => {
    setIsOpen(false);
    setEmailInput("");
  };

  const handleCopyLink = () => {
    // Copy invite link logic
    navigator.clipboard.writeText("https://example.com/invite/abc123");
    console.log("Link copied to clipboard");
  };

  const existingUsers = [
    {
      id: 1,
      email: "trungkienspktnd@gamail.com",
      avatar: null,
      initials: "TK",
      color: "bg-orange-500",
    },
    {
      id: 2,
      email: "nvt.isst.nute@gmail.com",
      avatar: null,
      initials: "NV",
      color: "bg-blue-500",
    },
    {
      id: 3,
      email: "manhhachkt08@gmail.com",
      avatar: null,
      initials: "MH",
      color: "bg-yellow-500",
    },
  ];

  const existingPage = usePathname().split("/")[2];
  const existingParent = usePathname().split("/")[1];
  // console.log(existingPage, existingParent, currentDocument, currentDocumentId, syncStatus);
  return (
    <div className="">
      {isHeadderVisible &&
        !(existingPage === "chat" && existingParent === "workspace") && (
          <AnimatePresence>
            {/* Background Layer - Fixed to top-0 */}$
            {!isExpanded && (
              <div
                className={`fixed top-0 right-0 z-30 ${isExpanded
                  ? "left-0 w-full"
                  : "xl:left-[250px] xl:w-[calc(100vw-267px)] left-[111px] w-[calc(100vw-128px)] max-md:w-[100vw] max-md:left-0"
                  }`}
              >
                <div className="h-[100px] w-full bg-[#181A1D] "></div>
              </div>
            )}
            {/* Header Content - Fixed with top-6 */}
            <div
              className={`fixed right-0  z-40 ${isExpanded
                ? "left-0 w-full top-0"
                : "xl:left-[250px] top-6  xl:w-[calc(100vw-267px)] left-[111px] w-[calc(100vw-128px)] max-md:w-[100vw] max-md:left-0"
                }`}
            >
              <motion.header
                className={`transition-transform duration-300 w-full px-[35px] py-6 xl:py-[23px] rounded-t-[31px]
         flex items-center justify-between   bg-[#EBEBF5] text-black dark:bg-[#0F1012] dark:text-white `}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="flex items-center justify-between h-11 flex-wrap 2xl:justify-around w-full 2xl:w-auto 2xl:gap-16">
                  {/* Left Section - Title and Last Update */}
                  <div className="flex flex-col items-start justify-center min-w-0 flex-1 font-pt-sans shrink">
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h1 className="text-base sm:text-lg font-semibold truncate mr-10 w-[120px] xl:w-[300px] cursor-help">
                            {currentDocument?.title || currentDocument?.id || "Document Default"}
                          </h1>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          align="start"
                          className="max-w-xs"
                        >
                          <p className="text-sm">
                            {currentDocument?.title || currentDocument?.id || "Document Default"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-[#A2A5B2] font-medium block text-nowrap truncate w-[120px] xl:w-[300px] cursor-help">
                          Last Update:{" "}
                          {lastUpdate || "25 August 2024 at 12:15 PM"}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        align="start"
                        className="max-w-xs"
                      >
                        <p className="text-sm">
                          Last Update:{" "}
                          {lastUpdate || "25 August 2024 at 12:15 PM"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Right Section - Control Buttons */}


                <div className="flex items-center justify-end gap-[29px] max-lg:gap-4 flex-1 w-full shrink">

                  {viewCombination === "pdf" &&
                    <>

                      < Button
                        onClick={() => {
                          setisSearchVisible(!isSearchVisible);
                          setOption((prev) => ({
                            ...prev,
                            search: !prev.search,
                            single: false,
                            double: false,
                            time: false,
                            train: false,
                          }));
                        }}
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 hover:bg-zinc-700 text-gray-300 active:text-teal-400 hover:text-teal-400"
                      // disabled={!currentDocument?.id}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Image
                              src={search}
                              height={30}
                              width={30}
                              alt="burger"
                              className={`${optionsMenu.search
                                ? "grayscale brightness-0 dark:grayscale-0 dark:brightness-100"
                                : "dark:grayscale dark:brightness-200 grayscale-0 brightness-100 "
                                } w-[24px] h-[24px]`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>search</p>
                          </TooltipContent>
                        </Tooltip>
                      </Button>


                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsTimerOpen(true);
                          setOption((prev) => ({
                            ...prev,
                            search: false,
                            single: false,
                            double: false,
                            time: true,
                            train: false,
                          }));
                        }}
                        className="w-8 h-8 p-0 hover:bg-zinc-700 text-gray-300 active:text-teal-400 hover:text-teal-400"
                      // disabled={!currentDocument?.id}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Image
                              src={alarm}
                              height={30}
                              width={30}
                              alt="burger"
                              className={`${optionsMenu.time
                                ? "grayscale brightness-0 dark:grayscale-0 dark:brightness-100"
                                : "dark:grayscale dark:brightness-200 grayscale-0 brightness-100"
                                } w-[24px] h-[24px]`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Alarm</p>
                          </TooltipContent>
                        </Tooltip>
                      </Button>

                      <Button
                        onClick={() => {
                          setisSmartNoteTakingVisible((prev) => !prev);
                          settoggleSmartTakingNotes((prev) => !prev);
                          setIsToolBarCollapsed(false);
                        }}
                        variant="ghost"
                        size="sm"
                        // disabled={!currentDocument?.id}
                        className="w-8 h-8 p-0 hover:bg-zinc-700 text-gray-300 active:text-teal-400 hover:text-teal-400"
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Image
                              src={"/newIcons/notes-overlay.svg"}
                              height={30}
                              width={30}
                              alt="burger"
                              className={`${isSmartNoteTakingVisible
                                ? "grayscale brightness-0 dark:grayscale-0 dark:brightness-100"
                                : "dark:grayscale dark:brightness-200 grayscale-0 brightness-100"
                                } w-[24px] h-[24px]`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Notes overlay</p>
                          </TooltipContent>
                        </Tooltip>
                      </Button>
                    </>
                  }

                  <ViewToggleButtons
                    toggle={toggleSmartTakingNotes}
                    handleToggle={() => {
                      settoggleSmartTakingNotes(false);
                      setisSmartNoteTakingVisible(false);
                    }}
                  />
                  {viewCombination === "pdf" &&
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setOption((prev) => ({
                              ...prev,
                              search: false,
                              single: false,
                              double: false,
                              timer: false,
                              train: true,
                            }));
                          }}
                          className={`h-[47px] w-[49px] p-1 rounded-full hover:bg-gray-700/80 group`}
                          disabled={currentDocument?.isTrained ?? false}
                        >
                          <TrainButton
                            syncStat={syncStatus}
                            options={optionsMenu.train}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Train PDF</p>
                      </TooltipContent>
                    </Tooltip>
                  }
                </div>


              </motion.header>
            </div>
          </AnimatePresence >
        )
      }

      {
        isTimerOpen && (
          <Card className="fixed top-[140px] right-[35px] w-[422px]  shadow-lg border z-50 bg-[#181A1D] border-gray-700">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2">
                      <Image
                        src={alarm}
                        height={30}
                        width={30}
                        alt="burger"
                        className={` w-[24px] h-[24px] grayscale brightness-125`}
                      />
                      <span className="font-semibold text-white">Timer</span>
                    </div>

                    <div className="text-center text-zinc-400 text-sm mb-6 ">
                      Set your study duration
                    </div>
                  </div>

                  {timeLeft === 0 && (
                    <Badge
                      variant="destructive"
                      className="text-xs bg-[#E4473D] dark:bg-[#E4473D] text-white"
                    >
                      Time&apos;s Up!
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsTimerOpen(false);
                    setOption((prev) => ({
                      ...prev,
                      search: false,
                      single: false,
                      double: false,
                      time: false,
                      train: false,
                    }));
                  }}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {isRunning && (
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    {/* Background circle */}
                    <svg
                      className="w-32 h-32 transform -rotate-90"
                      viewBox="0 0 128 128"
                    >
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-[#E4473D]"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke={isRunning ? " #3f3f46 " : "#36AF8D"}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)
                          }`}
                        className="transition-all duration-1000 ease-linear  "
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Timer text in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-2xl font-mono font-bold text-white">
                        {formatTime(timeLeft)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isRunning && (
                <div className="bg-[#282A2E]  w-full  py-[19px] px-[22px] rounded-lg flex flex-col items-center mb-6">
                  {/* Custom time input with +/- buttons */}
                  <div className="grid grid-cols-5 gap-[21px] w-full ">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTimerDuration(Math.max(1, inputMinutes - 1))
                      }
                      disabled={isRunning}
                      className="h-10 w-10 p-0  bg-transparent dark:bg-transparent col-span-1
                      dark:border-[#5D6168] border-[#5D6168] dark:hover:text-black text-white hover:bg-[#2d8f75] dark:hover:bg-[#2d8f75] hover:text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>

                    <div className="text-3xl font-mono font-bold text-white min-w-[100px] text-center col-span-3">
                      {String(Math.floor(inputMinutes)).padStart(2, "0")}:00
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTimerDuration(Math.min(60, inputMinutes + 1))
                      }
                      disabled={isRunning}
                      className="h-10 w-10 p-0 col-span-1  bg-transparent dark:bg-transparent dark:hover:text-black dark:border-[#5D6168] border-[#5D6168] text-white hover:bg-[#2d8f75] dark:hover:bg-[#2d8f75] hover:text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>

                    {/* Time preset buttons */}
                    <div className=" gap-2 col-span-full grid grid-cols-5">
                      {[
                        { label: "1m", value: 1 },
                        { label: "10m", value: 10 },
                        { label: "20m", value: 20 },
                        { label: "30m", value: 30 },
                        { label: "1h", value: 60 },
                      ].map((preset) => (
                        <Button
                          key={preset.value}
                          variant={
                            inputMinutes === preset.value ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setTimerDuration(preset.value)}
                          className={`text-xs flex-1 h-8 ${inputMinutes === preset.value
                            ? "bg-[#36AF8D] dark:bg-[#36AF8D] text-white hover:dark:bg-[#36AF8D] hover:bg-[#36AF8D] dark:hover:text-black dark:text-black"
                            : " bg-transparent dark:bg-transparent border-[#5D6168] dark:border-[#5D6168] dark:hover:text-black text-white hover:bg-[#36AF8D] dark:hover:bg-[#36AF8D] hover:text-white"
                            }`}
                          disabled={isRunning}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Control buttons */}
              <div className="flex gap-3 mt-[45px]">
                {!isRunning ? (
                  <Button
                    onClick={startTimer}
                    disabled={timeLeft === 0}
                    className="flex-1 gap-2 bg-[#36AF8D] hover:bg-[#36AF8D] dark:bg-[#36AF8D] dark:hover:bg-[#36AF8D] text-white h-10"
                    size="sm"
                  >
                    <Play className="w-4 h-4" fill="black" />
                    Start
                  </Button>
                ) : (
                  <Button
                    onClick={pauseTimer}
                    className="flex-1 gap-2 bg-[#E4473D] hover:bg-[#d63c31] dark:bg-[#E4473D] dark:hover:bg-[#d63c31] text-white h-10"
                    size="sm"
                  >
                    <Square className="w-4 h-4" fill="black" />
                    Stop
                  </Button>
                )}

                <Button
                  onClick={stopTimer}
                  variant="outline"
                  className={`flex-1 gap-2 bg-transparent border ${!isRunning
                    ? "border-[#36AF8D] dark:border-[#36AF8D] hover:bg-[#36AF8D]"
                    : "border-[#E4473D] dark:border-[#E4473D] hover:bg-[#E4473D]"
                    }  text-white   h-10`}
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      }
    </div >
  );
}
