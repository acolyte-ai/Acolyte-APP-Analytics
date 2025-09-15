import { useState, useEffect, useRef } from "react";
import useUserId from "@/hooks/useUserId";
import {
  FlashcardData,
  generateFlashcard,
  storeFlashcard,
} from "../services/flashcardService";
import { useSettings } from "@/context/store";
import FlashCardUI from "./flashCard";
import { toast } from "sonner";
import FlashcardHeaderIcon from "../UI/flashcard-loading-UI";

interface FlashcardGeneratorProps {
  topic: string;
  onFlashcardGenerated?: (flashcard: FlashcardData) => void;
}

export default function FlashcardGenerator({
  topic,
  onFlashcardGenerated,

}: FlashcardGeneratorProps) {

  const [isGenerating, setIsGenerating] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [generatedFlashcard, setGeneratedFlashcard] =
    useState<FlashcardData | null>(null);
  const [showFlashcard, setShowFlashcard] = useState(false);

  const userId = useUserId();
  const {
    currentDocumentId,
    setshowAITrainModal,
    isTrainCompleted,
    currentDocument,
    settrainNotificationMessage,
    currentPage,
    rootFolder,
    fileSystem,
    flashCardGenerated,
    setFlashCardGenerated
  } = useSettings();
  // Add a ref to track if storage has been attempted for the current flashcard
  const hasStoredCurrentFlashcard = useRef(false);

  // Generate a flashcard when topic, userId or currentDocumentId changes
  useEffect(() => {
    if (topic && topic.trim() && userId && currentDocumentId) {
      //
      if (!isTrainCompleted) {
        setshowAITrainModal(true);
        settrainNotificationMessage(
          "Do you want to train AI with this document? This will help generate more accurate flashcards."
        );
      } else {
        handleGenerate();
      }
    }
  }, [topic, userId, currentDocumentId]);

  // Effect to handle flashcard storage
  useEffect(() => {
    // Only proceed if we have a flashcard, we're not currently generating or storing,
    // and we haven't already stored this flashcard
    if (
      generatedFlashcard &&
      !isStoring &&
      !isGenerating &&
      !hasStoredCurrentFlashcard.current
    ) {
      // Mark that we're storing this flashcard to prevent duplicate storage
      hasStoredCurrentFlashcard.current = true;

      // Store the flashcard
      // handleStore();
    }
  }, [generatedFlashcard, isGenerating, isStoring]);

  // Reset the storage flag when the flashcard changes
  useEffect(() => {
    hasStoredCurrentFlashcard.current = false;
  }, [generatedFlashcard]);

  // Generate a flashcard
  const handleGenerate = async () => {
    if (!topic.trim()) {
      console.log("No topic provided");
      return;
    }

    if (!currentDocumentId || !userId) {
      console.log("Missing userId or currentDocumentId");
      return;
    }

    console.log("Generating flashcard for topic:", topic);
    const url = window.location.pathname;
    const ids = url.split("/").pop();
    const extractId = fileSystem.filter((item) => item.id === ids)[0];
    const files = fileSystem.filter(
      (item) => item.type === "folder" && item.id === extractId.parentId
    )[0];
    let folderName;

    if (files.parentId !== null) {
      const files = fileSystem.filter(
        (item) => item.type === "folder" && item.id === extractId.parentId
      )[0].parentId;
      const fys = fileSystem.filter(
        (item) => item.type === "folder" && item.id === files
      )[0];

      folderName = fys.name;
    } else {
      folderName = files.name;
    }

    const subject = folderName ?? "Anatomy";

    try {
      setIsGenerating(true);

      // Call the API to generate a flashcard
      const flashcard = await generateFlashcard(
        topic,
        userId,
        currentDocumentId,
        subject
      );
      console.log("Flashcard generated:", flashcard);

      if (!flashcard) {
        console.log("No flashcard to store");
        return;
      }

      setIsStoring(true);

      const flashCardData = {
        userId: userId,
        flashcardTopic: flashcard?.topic,
        difficulty: flashcard?.difficulty,
        description: flashcard?.description,
        heading: flashcard?.title,
        docId: ids,
        title: flashcard?.title,
        text: topic,
        bodySystem: flashcard?.body_system,
        subject: subject,
        bookName: currentDocument?.title,

      };
      console.log("This is flashcards", flashCardData);

      // Call the API to store the flashcard
      const success = await storeFlashcard(flashCardData);



      if (success) {
        console.log("Flashcard stored successfully");
      }

      // First set the flashcard data
      setGeneratedFlashcard({
        heading: flashcard?.title,
        description: flashcard?.description,
        body_system: flashcard?.body_system,
        flashcard_id: success?.flashcard?.flashcard_id,
        title: success?.flashcard?.title ?? "",
        subject: success?.flashcard?.subject,
        bookName: currentDocument?.title,
      });

      // Then ensure we show it (in a separate state update to avoid race conditions)
      // Use a short timeout to ensure the state update happens in the next event loop
      // setTimeout(() => {
      //   setShowFlashcard(true);
      //   console.log("Showing flashcard UI");
      // }, 50);

      // Notify parent component if callback is provided
      if (onFlashcardGenerated) {
        onFlashcardGenerated(flashcard);
      }
      setIsGenerating(false);
      toast("Flashcard generated for", {
        description: flashcard?.title,
        position: "bottom-right",
        duration: Infinity,
        closeButton: true,
        dismissible: true,
        onDismiss: () => {
          setShowFlashcard(true);
        },
        style: {
          fontSize: '16px', // Fixed syntax error and increased base font size

          '--toast-icon-size': '24px', // Makes the tick icon bigger
        } as React.CSSProperties,
        actionButtonStyle: {
          fontSize: '14px', // Button text size
          padding: '8px 16px', // Makes button bigger
          minHeight: '36px', // Button height
        },
        action: {
          label: "view",
          onClick: () => {
            setShowFlashcard(true); // call it here too
            toast.dismiss() // actually close the toast so onDismiss runs as well
          },
        },
      })

    } catch (error) {
      console.error("Error generating flashcard:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Store the generated flashcard
  // Close the flashcard
  const handleCloseFlashcard = () => {
    setShowFlashcard(false);
    // Reset the generated flashcard when closing
    setGeneratedFlashcard(null);
  };

  // Debugging render condition
  console.log("Render conditions:", {
    currentDocument,
    generatedFlashcard,
    showFlashcard,
    hasFlashcard: !!generatedFlashcard,
    isGenerating,
    isStoring,
    hasStoredCurrentFlashcard: hasStoredCurrentFlashcard.current,
  });




  return (


    <>
      {/* {
        !showFlashcard && generatedFlashcard &&

        <FlashcardHeaderIcon
          isGenerating={isGenerating}
          hasFlashcard={!!generatedFlashcard?.body_system ? true : false}
          onShowFlashcard={handleShowFlashcardFromHeader}
        />
      } */}

      {
        showFlashcard && generatedFlashcard && (
          <div className="fixed inset-0 z-50 w-screen h-screen backdrop-blur-sm  flex justify-center items-center">
            <FlashCardUI
              flashcardData={generatedFlashcard}
              onClose={handleCloseFlashcard}
              loading={isGenerating}
              showFlashcard={() => setShowFlashcard(false)}
            />
          </div>
        )
      }
    </>

  );
}


{/* {isGenerating && (
        <div className="backdrop-blur-sm fixed inset-0 z-50 flex justify-center items-center">
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      )} */}