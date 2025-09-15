"use client";
import { useState, useEffect } from "react";
import { useSettings } from "@/context/store";
import { getItem } from "@/lib/fileSystemUtils";
import useUserId from "@/hooks/useUserId";
import { toast } from "sonner";

export const useTrainLogic = (syncStat) => {
  const {
    currentDocumentId,
    isTrainingProgress,
    setisTrainingProgress,
    currentView,
    fileSystem,
    isTrainCompleted,
    setshowAITrainModal,
    settrainNotificationMessage
  } = useSettings();
  const [openTrainModal, setopenTrainModal] = useState(false);
  const [isTrained, setIsTrained] = useState(false);
  const [isStartedTraining, setIsStartedTraining] = useState(false);
  const userId = useUserId();

  const isPdfTrained = async () => {
    try {
      if (!userId || !currentDocumentId) return;

      const res = await getItem(userId, currentDocumentId);
      setIsTrained(res?.isTrained || isTrainCompleted);
      setisTrainingProgress(!res?.isTrained && res?.isStartedTraining);
      setIsStartedTraining(res?.isStartedTraining || false);
    } catch (error) {
      console.error("Failed to check if PDF is trained:", error);
      return false;
    }
  };

  const handleTrainButtonClick = () => {
    setopenTrainModal(true);
    if (!isTrained && !isStartedTraining && !isTrainingProgress) {
      setshowAITrainModal(true);
      settrainNotificationMessage(" Do you want to train AI with this document? This will improve AI's response accuracy.")
    }

    if (syncStat === "syncing") {
      toast.warning(
        "Train will occur after syncing is done",
        { position: "top-center" }
      );
    }
  };

  useEffect(() => {
    isPdfTrained();
  }, [currentDocumentId, currentView, userId, isTrainCompleted, fileSystem]);

  useEffect(() => {
    if (isTrainCompleted) {
      isPdfTrained(); // Re-fetch after training completes
    }
  }, [isTrainCompleted, fileSystem]);

  useEffect(() => {
    if (!currentView) return;
    if (currentView === "chat") {
      // Only show the train modal if training hasn't started yet
      if (!isStartedTraining && !isTrained) {
        setopenTrainModal(true);
      }
    }
  }, [
    currentDocumentId,
    currentView,
    setopenTrainModal,
    isStartedTraining,
    isTrained,
  ]);

  return {
    openTrainModal,
    setopenTrainModal,
    isTrained,
    isStartedTraining,
    isTrainingProgress,
    handleTrainButtonClick
  };
};