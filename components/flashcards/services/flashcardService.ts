// flashcardService.ts
import { FlashcardData } from "./flashcardTypes";

// Interface for storing a flashcard with creation date
export interface FlashcardStoreData extends FlashcardData {
  createdAt: string;
  lastEdited: string;
  commentCount?: number;
}
export const generateFlashcard = async (
  heading: string,
  userId: string,
  currentDocumentId: string,
  subject: string
): Promise<FlashcardData> => {
  try {
    // Submit flashcard generation
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_GENERATION_URL}/generate-flashcard`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          key: `${currentDocumentId}.pdf`,
          query_text: heading,
          subject: subject,
          model_id: "gpt-4o-mini"
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const { task_id } = await response.json();
    console.log("Flashcard task submitted:", task_id);

    // Poll for completion
    const result = await pollTaskStatus(task_id);

    return {
      id: Date.now(),
      title: result.heading || heading,
      description: result.description,
      body_system: result.body_system,
      difficulty: result.difficulty,
      topic: result.topic,
    };

  } catch (error) {
    console.error("Error generating flashcard:", error);
    throw error; // Let component handle the error
  }
};

// Poll task status until completion
const pollTaskStatus = async (taskId: string): Promise<any> => {
  const maxRetries = 120; // 2 minutes
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_GENERATION_URL}/job_status/${taskId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const statusData = await response.json();
      console.log("Flashcard status:", statusData.status, statusData.progress);

      if (statusData.status === "completed") {
        return statusData.result;
      } else if (statusData.status === "failed") {
        throw new Error(statusData.error || "Flashcard generation failed");
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      retries++;

    } catch (error) {
      console.error("Error polling flashcard status:", error);
      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw new Error("Flashcard generation timeout");
};
// export const generateFlashcard = async (heading: string, userId: string, currentDocumentId: string): Promise<FlashcardData> => {
//     // For testing - skip API call and return mock data
//     console.log("Mock flashcard generated for:", heading);

//     // Create appropriate mock response based on heading
//     let mockDescription = '';

//     switch(heading.toLowerCase()) {
//         case 'sleep hygiene':
//             mockDescription = "Sleep hygiene refers to a set of practices and habits that promote consistent, high-quality sleep and daytime alertness. Key recommendations include maintaining a regular sleep schedule, creating a comfortable sleep environment, avoiding stimulants and large meals close to bedtime, and engaging in regular physical activity.";
//             break;
//         case 'bradycardia':
//             mockDescription = "Bradycardia is a condition characterized by an abnormally slow heart rate, typically defined as less than 60 beats per minute in adults. It can be caused by various factors including heart tissue damage, medication effects, or in some athletes, as a normal adaptation to training.";
//             break;
//         case 'hepatomegaly':
//             mockDescription = "Hepatomegaly refers to an abnormal enlargement of the liver. It can be caused by various conditions including infections, fatty liver disease, heart failure, liver cancer, or metabolic disorders. Diagnosis typically involves physical examination, imaging studies, and blood tests.";
//             break;
//         case 'hypertension':
//             mockDescription = "Hypertension, or high blood pressure, is a chronic medical condition where blood pressure in the arteries is persistently elevated. It is a major risk factor for heart disease, stroke, kidney disease, and other health problems. Management typically includes lifestyle modifications and medication.";
//             break;
//         default:
//             mockDescription = `${heading} is a medical term that relates to health and wellbeing. Further specifics would depend on the exact context and field of medicine in which this term is used.`;
//     }

//     // Return mock flashcard data
//     return {
//         id: Date.now(),
//         title: heading,
//         description: "hellllll",
//     };
// };

export interface FlashcardData {
  userId: string;
  description: string;
  difficulty: string;
  heading: string;
  flashcardTopic: string;
  docId: string;
  title: string;
  text: string;
  subject: string;
  bodySystem: string;
}

// Base API URL from environment variables
const API_BASE_URL =
  `${process.env.NEXT_PUBLIC_API_URL}/dev` || "http://localhost:3000/dev";

export const storeFlashcard = async (flashcard: {
  userId: string;
  description: string;
  difficulty: string;
  heading: string;
  flashcardTopic: string;
  docId: string;
  title: string;
  text: string;
  subject: string;
  bodySystem: string;
  bookName: string;
}): Promise<{ success: boolean; flashcard?: FlashcardData }> => {
  try {
    console.log("flashcard:::::::::", flashcard)
    const response = await fetch(
      process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + `/dev/v1/flashcard`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flashcard),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      flashcard: data.flashcard,
    };
  } catch (error) {
    console.error("Error storing flashcard:", error);
    return { success: false };
  }
};

// Fetch all flashcards for a user
export const fetchFlashcards = async (
  userId: string
): Promise<FlashcardData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/flashcard/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data as FlashcardData[];
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return [];
  }
};

// Fetch a single flashcard by ID
export const fetchFlashcardById = async (
  userId: string,
  flashcard_id: string
): Promise<FlashcardData | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/flashcard/${userId}/${flashcard_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data as FlashcardData;
  } catch (error) {
    console.error("Error fetching flashcard by ID:", error);
    return null;
  }
};

// Delete a flashcard
export const deleteFlashcard = async (
  userId: string,
  flashcard_id: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/flashcard/${userId}/${flashcard_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return false;
  }
};

// Format relative time (e.g., "2 days ago", "yesterday")
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return "today";
  } else if (diffInDays === 1) {
    return "yesterday";
  } else {
    return `${diffInDays} days ago`;
  }
};

// Initialize with some sample flashcards if none exist
export const initializeSampleData = (): void => {
  const flashcardsJSON = localStorage.getItem("flashcards");
  if (!flashcardsJSON) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const sampleFlashcards: FlashcardStoreData[] = [
      {
        id: 1,
        title: "BRADYCARDIA",
        description: "Abnormally slow heart rate (less than 60 BPM)",
        createdAt: now.toISOString(),
        lastEdited: twoDaysAgo.toISOString(),
        commentCount: 8,
      },
      {
        id: 2,
        title: "HEPATOMEGALY",
        description: "Abnormal enlargement of the liver",
        createdAt: yesterday.toISOString(),
        lastEdited: yesterday.toISOString(),
        commentCount: 3,
      },
      {
        id: 3,
        title: "HYPERTENSION",
        description: "Persistently elevated blood pressure in the arteries",
        createdAt: twoDaysAgo.toISOString(),
        lastEdited: twoDaysAgo.toISOString(),
        commentCount: 5,
      },
    ];

    localStorage.setItem("flashcards", JSON.stringify(sampleFlashcards));
  }
};
