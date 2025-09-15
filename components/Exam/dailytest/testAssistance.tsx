"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import stopwatch from "@/public/stopWatch.svg";
import help from "@/public/Help circle.svg";
import pause from "@/public/pauseIconNew.svg";
import exit from "@/public/closeIcon.svg";
import fullScreens from "@/public/fullScreen.svg";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { useRouter } from "next/navigation";
import { CANCEL_EXAM } from "../api/url";
import play from "@/public/pauseIcon.svg";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ExaminationInstructions from "./help-test";

type QuestionStatus = "pending" | "attempted" | "skipped" | "review";

interface Question {
  id: number;
  status: QuestionStatus;
}

interface TestProgressBarProps {
  totalTime: number; // in seconds
  questions: Question[];
  currentQuestion: number;
  parameters: {
    review: number;
    attempted: number;
    skip: number;
    pending: number;
  };
  attemptId: string;
  fullScreen: () => void;
  moveQuestion: (val: number) => void;
}

const TestAssistance: React.FC<TestProgressBarProps> = ({
  totalTime,
  questions,
  currentQuestion,
  parameters,
  attemptId,
  moveQuestion,
  fullScreen,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(totalTime);
  const [isPaused, setIsPaused] = useState(false);
  const [isTimeUpDialogOpen, setIsTimeUpDialogOpen] = useState(false);
  const router = useRouter()

  // Timer countdown
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer has ended
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Handle when timer reaches zero
  const handleTimeUp = async () => {
    setIsTimeUpDialogOpen(true);
    try {
      await axios.post(CANCEL_EXAM, { attemptId: attemptId });
    } catch (error) {
      console.log("error", error.message);
    }
  };

  // Handle time up dialog action
  const handleTimeUpConfirm = async () => {
    setIsTimeUpDialogOpen(false);
    handleCancelExam()
  };

  // Format seconds to hh:mm:ss
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}h : ${m
      .toString()
      .padStart(2, "0")}m : ${s.toString().padStart(2, "0")}s`;
  };

  // Get color for progress bar based on question status and position
  const getProgressBarColor = (question: Question, index: number) => {

    const questionNumber = index + 1;
    const currentQuestionNumber = currentQuestion + 1;

    if (questionNumber === currentQuestionNumber) {
      // Current question - show gray/active color
      return "bg-gray-500 dark:bg-gray-500";
    } else if (questionNumber < currentQuestionNumber || questionNumber > currentQuestionNumber) {
      // Previous questions - show their actual status
      switch (question.status) {
        case "attempted":
          return "bg-[#36AF8D] dark:bg-[#36AF8D]";
        case "skipped":
          return "bg-[#C93939] dark:bg-[#C93939]";
        case "review":
          return "bg-[#9E00F9] dark:bg-[#9E00F9]";
        default:
          return "bg-[#A9A9A9] dark:bg-[#A9A9A9]";
      }
    } else {
      // Future questions - show as pending/white
      return "bg-[#A9A9A9] dark:bg-[#A9A9A9]";
    }
  };

  async function handleCancelExam() {
    try {
      const url = window.location.pathname;
      const id = url.split('/').pop()
      const response = await axios.post(process.env.NEXT_PUBLIC_PM_BASE_URL + CANCEL_EXAM, { attemptId: attemptId })
      console.log("response::", response.data)
      router.push("/assesment/dash/" + id);
    } catch (error) {
      console.log("error", error.message)
    }
  }

  return (
    <div
      className="dark:bg-[#181A1D] bg-[#F3F4F9] dark:text-white text-black p-4 rounded-lg w-full
        grid grid-cols-12 max-sm:grid-cols-1 2xl:gap-[44px]
        2xl:py-[20px] 2xl:px-[31px] px-[25px] py-[18px] max-md:py-[16px] gap-9
         max-sm:gap-5"
    >
      {/* Top Section: Timer and Buttons */}
      <div className="text-green-400 font-medium max-sm:col-span-1 gap-2 items-center flex 2xl:text-[18px] col-span-5 text-[15px]">
        <Image
          src={stopwatch}
          height={18}
          width={18}
          alt={"icon"}
          className="2xl:w-[28px] 2xl:h-[33px] w-[16px] h-[19px] dark:grayscale-0 grayscale dark:brightness-100 brightness-0"
        />
        <p>Time Left -</p>
        <p className="dark:text-emerald-400 text-[#228367] ">{formatTime(timeLeft)}</p>
      </div>

      <div className="grid grid-cols-4 max-sm:grid-cols-2 max-sm:col-span-1 2xl:gap-[18px] gap-4 col-span-7 font-medium font-pt-sans ">
        <Dialog>
          <DialogTrigger className="p-0 shadow-none border-none w-full flex items-center justify-center"> <Button
            size={"sm"}
            variant={"secondary"}
            className=" 2xl:px-[16px] bg-[#9EAEFF] dark:bg-[#282A2E] w-full hover:bg-[#9EAEFF]/70 dark:hover:bg-zinc-500  border-[#4254AA] dark:border-none border 2xl:py-[15px] px-[14px] py-[13px]"
          >
            <Image
              src={help}
              height={18}
              width={18}
              alt={"icon"}
              className="w-4 h-4  object-contain"
            />
            <p className="text-[15px] 2xl:text-[18px] dark:text-white text-white">Help</p>
          </Button></DialogTrigger>
          <DialogContent className="p-0 shadow-none w-full h-full flex items-center justify-center border-none bg-transparent dark:bg-transparent" >
            <DialogHeader>
              <DialogTitle>Help</DialogTitle>
              {/* <DialogDescription> */}
              <ExaminationInstructions />
              {/* </DialogDescription> */}
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Button
          size={"sm"}
          variant={"secondary"}
          className="2xl:px-[16px] 2xl:py-[15px] bg-[#DC9123]  dark:bg-[#282A2E]  hover:bg-[#DC9123]/70 dark:hover:bg-zinc-500
           border-[#6D4914] dark:border-none border px-[14px]
           py-[13px] "
          onClick={() => setIsPaused(!isPaused)}
        >
          <Image
            src={isPaused ? play : pause}
            height={18}
            width={18}
            alt={"icon"}
            className="w-4 h-4  object-contain grayscale brightness-200"
          />
          <p className="text-[15px] 2xl:text-[18px] dark:text-white text-white">{isPaused ? "Resume" : "Pause"}</p>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size={"sm"}
              variant={"secondary"}
              className=" 2xl:px-[16px] 2xl:py-[15px]   px-[14px] py-[13px]
              bg-[#C93939]  dark:bg-[#282A2E]  hover:bg-[#C93939]/70 dark:hover:bg-zinc-500
           border-[#7D1A1A] dark:border-none border
              "

            >
              <Image
                src={exit}
                height={18}
                width={18}
                alt={"icon"}
                className="w-4 h-4  object-contain"
              />
              <p className="text-[15px] 2xl:text-[18px] dark:text-white text-white">Exit</p>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="dark:bg-[#181A1D] bg-white border-none p-7 max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[23px] font-bold leading-8 font-[futureHeadline]">Are you sure you want to exit?</AlertDialogTitle>
              <AlertDialogDescription className="text-[20px] font-normal leading-6 font-pt-sans ">
                Your progress will be saved, but you'll need to restart the test session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-[47px]">
              <AlertDialogCancel className="hover:bg-[#36AF8D] dark:hover:bg-[#36AF8D] font-[futureHeadline] border text-[18px] w-[144px] h-[33px] dark:text-white text-black bg-transparent dark:bg-transparent border-[#36AF8D] dark:border-[#36AF8D]  ">Cancel</AlertDialogCancel>
              <AlertDialogAction className="hover:bg-[#36AF8D] dark:hover:bg-[#36AF8D] font-[futureHeadline] border text-[18px] w-[144px] h-[33px] dark:text-black text-white bg-[#36AF8D] dark:bg-[#36AF8D] border-[#36AF8D] dark:border-[#36AF8D] " onClick={() => {
                handleCancelExam()

              }}>Exit Test</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          size={"sm"}
          variant={"secondary"}
          className=" 2xl:px-[16px] 2xl:py-[15px]  px-[14px] py-[13px]
             bg-[#36AF8D]  dark:bg-[#282A2E]  hover:bg-[#36AF8D]/70 dark:hover:bg-zinc-500
           border-[#1B6C55] dark:border-none border
          "
          onClick={() => fullScreen()}
        >
          <Image
            src={fullScreens}
            height={18}
            width={18}
            alt={"icon"}
            className="w-4 h-4 object-contain"
          />
          <p className="text-[15px] 2xl:text-[18px] dark:text-white text-white">Full screen</p>
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 justify-start items-center w-full max-sm:col-span-1 col-span-12">
        {questions.map((q, index) => {
          const colorClass = getProgressBarColor(q, index);

          return (
            <div
              key={q.id}
              className={`h-2 rounded-sm ${colorClass} cursor-pointer hover:border-2 hover:border-sky-500`}
              style={{ width: `calc(100% / ${questions.length})` }}
              onClick={() => moveQuestion(index)}
            />
          );
        })}
      </div>

      {/* Question Indicator */}
      <div className="text-start 2xl:text-[16px] text-[13px] max-sm:col-span-1 col-span-2 lg:col-span-4 text-nowrap font-pt-sans font-medium">
        Question {currentQuestion + 1} of {questions.length}
      </div>

      {/* Legend */}
      <div
        className=" xl:gap-7 gap-6 max-sm:col-span-1
             text-wrap w-full flex items-center justify-end flex-wrap
             2xl:gap-[42px] text-[13px] 2xl:text-[16px] max-sm:gap-6
             col-span-10 lg:col-span-8 font-pt-sans font-medium place-content-end"
      >
        <div className="flex items-center gap-1 text-[#9E00F9] ">
          <span className="w-[14px] h-[14px] 2xl:w-[17px] 2xl:h-[17px] bg-[#9E00F9] rounded-sm" />{" "}
          Review: {parameters.review}
        </div>
        <div className="flex items-center gap-1 text-[#36AF8D]">
          <span className="w-[14px] h-[14px] 2xl:w-[17px] 2xl:h-[17px] bg-[#36AF8D]  rounded-sm" />{" "}
          Attempted: {parameters.attempted}
        </div>
        <div className="flex items-center gap-1 text-[#C93939]">
          <span className="w-[14px] h-[14px] 2xl:w-[17px] 2xl:h-[17px] bg-[#C93939]  rounded-sm" />{" "}
          Skipped: {parameters.skip}
        </div>
        <div className="flex items-center gap-1 text-[#919191]">
          <span className="w-[14px] h-[14px] 2xl:w-[17px] 2xl:h-[17px] bg-[#919191]  rounded-sm" />{" "}
          Pending: {parameters.pending}
        </div>
      </div>

      {/* Time Up Dialog */}
      <AlertDialog open={isTimeUpDialogOpen} onOpenChange={setIsTimeUpDialogOpen}>
        <AlertDialogContent className="dark:bg-[#181A1D] bg-white border-none p-7 max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[23px] font-bold leading-8 font-[futureHeadline]">Time&apos;s Up!</AlertDialogTitle>
            <AlertDialogDescription className="text-[20px] font-normal leading-6 font-pt-sans ">
              Your exam time has ended. The exam is now over and your progress has been saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-[47px]">
            <AlertDialogAction className="hover:bg-[#36AF8D] dark:hover:bg-[#36AF8D] font-[futureHeadline] border text-[18px] w-[144px] h-[33px] dark:text-black text-white bg-[#36AF8D] dark:bg-[#36AF8D] border-[#36AF8D] dark:border-[#36AF8D] " onClick={handleTimeUpConfirm}>
              View Results
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestAssistance;