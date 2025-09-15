"use client";
import { useTrainLogic } from "./TrainLogic"; // Import the hook from our logic file
import { useSettings } from "@/context/store";
import { useEffect } from "react";
import trainingOn from "@/public/newIcons/trainingOn.svg";
import trainingDone from "@/public/newIcons/trainingDone.svg";
import trainingStart from "@/public/newIcons/trainingStart.svg";
import Image from "next/image";
import { useSyncLogic } from "./SyncLogic";
import { toast } from "sonner";

export const TrainButton = ({ syncStat, options }) => {
  const {
    isTrained,
    isTrainingProgress,
  } = useTrainLogic(syncStat);

  const { setshowAITrainModal, settrainNotificationMessage } = useSettings();

  const { syncStatus, syncAll } = useSyncLogic();

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     syncAll();
  //   }, 5000); // 5 seconds

  //   return () => clearInterval(interval); // Cleanup on unmount
  // }, [syncAll]);

  return (
    <div
      className=" relative cursor-pointer "
      onClick={() => {
        setshowAITrainModal(true);
        settrainNotificationMessage(
          " Do you want to train AI with this document? This will improve AI's response accuracy."
        );
        toast.info("Training Initiated")
      }}
    >
      {/* Rotating Background - Show when training is in progress or started but not completed */}

      {!isTrained && syncStatus !== "syncing" && (
        <Image
          src={trainingStart}
          height={30}
          width={30}
          alt="burger"
          className={`w-[45px] h-[43px] ${options ? "grayscale brightness-0 dark:grayscale-0 dark:brightness-100" : "dark:grayscale dark:brightness-200 grayscale-0 brightness-100 "} `}
        />
      )}

      {isTrainingProgress && syncStatus === "syncing" && (
        <Image
          src={trainingOn}
          height={30}
          width={30}
          alt="burger"
          className={`w-[45px] h-[43px] ${options ? "grayscale brightness-0 dark:grayscale-0 dark:brightness-100" : "dark:grayscale dark:brightness-200 grayscale-0 brightness-100 "} `}
        />
      )}
      {isTrained && syncStatus === "success" && (
        // <img
        //   src="/synccheck.svg"
        //   alt="Check"
        //   className="absolute bottom-0 right-0 w-4 h-4 min-w-4 min-h-4"
        // />

        <Image
          src={trainingDone}
          height={30}
          width={30}
          alt="burger"
          className={`w-[45px] h-[43px] ${options ? "grayscale brightness-0 dark:grayscale-0 dark:brightness-100" : "dark:grayscale dark:brightness-200 grayscale-0 brightness-100 "} `}
        />
      )}
    </div>
  );
};
