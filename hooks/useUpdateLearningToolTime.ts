import { useCallback } from "react";

const API_URL =
  "https://r6qdqb5ej7.execute-api.ap-south-1.amazonaws.com/dev/v1/update-learning-tool";

export const useUpdateLearningToolTime = (userId) => {
  const updateLearningToolTime = useCallback(
    async (toolType, timeIncrement) => {
      if (!userId) {
        console.warn("User ID is missing. Cannot update learning tool time.");
        return; // or throw new Error("User ID is required");
      }

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            toolType,
            timeIncrement,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(`Learning tool time updated successfully:`, result);
        return result;
      } catch (error) {
        console.error("Error updating learning tool time:", error);
        throw error;
      }
    },
    [userId]
  );

  return { updateLearningToolTime };
};
