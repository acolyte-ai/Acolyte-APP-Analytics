import React, { useState, useEffect } from "react";
import { BookOpen, Clock, Loader2 } from "lucide-react";
import { useSettings } from "@/context/store";
import useUserId from "@/hooks/useUserId";

interface InsightItem {
  id: string;
  text: string;
}

interface InsightSection {
  title: string;
  items: InsightItem[];
}

interface DocumentInsightData {
  key_concepts: string[];
  important_terminology: string[];
  comprehension_check: string[];
}

const API_BASE_URL =
  "https://rj2rr7rhrueihv6rrxy3nh75hy0kjqmv.lambda-url.ap-south-1.on.aws/";
const GENERATE_SMART_SUMMARY_URL =
  `${process.env.NEXT_PUBLIC_GENERATION_URL}/generate-smart-summary`;

// localStorage keys for document insights
const getDataKey = (pdfId: string) => `document_insights_${pdfId}`;
const getLastUpdatedKey = (pdfId: string) =>
  `document_insights_updated_${pdfId}`;
const getGenerationStatusKey = (pdfId: string) =>
  `document_insights_generating_${pdfId}`;

// Cache duration: 1 hour (in milliseconds)
const CACHE_DURATION = 60 * 60 * 1000;

interface GenerationStatus {
  isGenerating: boolean;
  timestamp: number;
  progress?: string;
}

const DocumentInsights = ({ id, className = "" }) => {
  const { theme } = useSettings();
  const USER_ID = useUserId();
  const PDF_ID = id;

  const [sections, setSections] = useState<InsightSection[]>([]);
  const [comprehensionQuestions, setComprehensionQuestions] = useState<
    string[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [readingTime] = useState<number>(15); // Default reading time
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<string>("");

  // Helper functions for localStorage operations
  const setLocalStorageData = (data: DocumentInsightData) => {
    try {
      localStorage.setItem(getDataKey(PDF_ID), JSON.stringify(data));
      localStorage.setItem(getLastUpdatedKey(PDF_ID), Date.now().toString());
    } catch (error) {
      console.warn("Failed to save document insights to localStorage:", error);
    }
  };

  const getLocalStorageData = (): DocumentInsightData | null => {
    try {
      const data = localStorage.getItem(getDataKey(PDF_ID));
      const lastUpdated = localStorage.getItem(getLastUpdatedKey(PDF_ID));

      if (data && lastUpdated) {
        const timeDiff = Date.now() - parseInt(lastUpdated);
        if (timeDiff < CACHE_DURATION) {
          return JSON.parse(data);
        } else {
          // Data is expired, remove it
          removeLocalStorageData();
        }
      }
    } catch (error) {
      console.warn(
        "Failed to read document insights from localStorage:",
        error
      );
    }
    return null;
  };

  const removeLocalStorageData = () => {
    try {
      localStorage.removeItem(getDataKey(PDF_ID));
      localStorage.removeItem(getLastUpdatedKey(PDF_ID));
      localStorage.removeItem(getGenerationStatusKey(PDF_ID));
    } catch (error) {
      console.warn(
        "Failed to remove document insights from localStorage:",
        error
      );
    }
  };

  const setGenerationStatus = (status: GenerationStatus) => {
    try {
      localStorage.setItem(
        getGenerationStatusKey(PDF_ID),
        JSON.stringify(status)
      );
      setIsGenerating(status.isGenerating);
      setGenerationProgress(status.progress || "");
    } catch (error) {
      console.warn("Failed to save generation status:", error);
    }
  };

  const getGenerationStatus = (): GenerationStatus | null => {
    try {
      const status = localStorage.getItem(getGenerationStatusKey(PDF_ID));
      if (status) {
        const parsed = JSON.parse(status);
        // Check if generation started more than 10 minutes ago (consider it failed)
        const timeDiff = Date.now() - parsed.timestamp;
        if (timeDiff > 10 * 60 * 1000) {
          removeGenerationStatus();
          return null;
        }
        return parsed;
      }
    } catch (error) {
      console.warn("Failed to read generation status:", error);
    }
    return null;
  };

  const removeGenerationStatus = () => {
    try {
      localStorage.removeItem(getGenerationStatusKey(PDF_ID));
      setIsGenerating(false);
      setGenerationProgress("");
    } catch (error) {
      console.warn("Failed to remove generation status:", error);
    }
  };

  const transformDataToSections = (
    data: DocumentInsightData
  ): InsightSection[] => {
    const transformedSections: InsightSection[] = [];

    // Transform key_concepts
    if (data.key_concepts && data.key_concepts.length > 0) {
      transformedSections.push({
        title: "Key Concepts",
        items: data.key_concepts.map((concept, index) => ({
          id: `concept-${index}`,
          text: concept,
        })),
      });
    }

    // Transform important_terminology
    if (data.important_terminology && data.important_terminology.length > 0) {
      transformedSections.push({
        title: "Important Terminology",
        items: data.important_terminology.map((term, index) => ({
          id: `term-${index}`,
          text: term,
        })),
      });
    }

    return transformedSections;
  };

  const generateDocumentInsights =
    async (): Promise<DocumentInsightData | null> => {
      try {
        console.log("Generating document insights for PDF:", PDF_ID);

        // Set generation status
        setGenerationStatus({
          isGenerating: true,
          timestamp: Date.now(),
          progress: "Generating document insights...",
        });

        // Call the generation API (only triggers generation, doesn't return data)
        const response = await fetch(GENERATE_SMART_SUMMARY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: USER_ID,
            key: PDF_ID,
            model_id: "gpt-4o-mini",
            document_insight: true,
          }),
        });

        console.log(
          "Generate document insights API response status:",
          response.status
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Generated document insights result:", result);

        // Check if generation was successful
        if (!result.success) {
          throw new Error("Generation failed");
        }

        // Update generation status to indicate polling phase
        setGenerationStatus({
          isGenerating: true,
          timestamp: Date.now(),
          progress: "Processing document insights...",
        });

        // Poll the main Lambda API for the generated data
        const pollForData = async (
          maxAttempts = 30,
          delayMs = 2000
        ): Promise<DocumentInsightData> => {
          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
              console.log(`Polling attempt ${attempt} for document insights`);

              const pollResponse = await fetch(API_BASE_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  input: `${PDF_ID}#documentInsight`,
                  userId: USER_ID,
                }),
              });

              if (pollResponse.ok) {
                const pollResult = await pollResponse.json();
                console.log(
                  `Polling result for attempt ${attempt}:`,
                  pollResult
                );

                if (
                  pollResult.success &&
                  pollResult.data &&
                  pollResult.data.data
                ) {
                  console.log(
                    `Successfully retrieved generated document insights on attempt ${attempt}`
                  );
                  return pollResult.data.data;
                }
              }

              // Update progress
              setGenerationStatus({
                isGenerating: true,
                timestamp: Date.now(),
                progress: `Processing document insights... (${attempt}/${maxAttempts})`,
              });

              // Wait before next attempt (except on last attempt)
              if (attempt < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
              }
            } catch (pollError) {
              console.warn(
                `Polling attempt ${attempt} failed for document insights:`,
                pollError
              );

              // Continue to next attempt unless it's the last one
              if (attempt < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
              }
            }
          }

          throw new Error(
            `Failed to retrieve document insights after ${maxAttempts} polling attempts`
          );
        };

        // Start polling for the data
        const generatedData = await pollForData();

        // Validate and structure the insight data
        const insightData: DocumentInsightData = {
          key_concepts: generatedData.key_concepts || [],
          important_terminology: generatedData.important_terminology || [],
          comprehension_check: generatedData.comprehension_check || [],
        };

        console.log("Processed generated document insights:", insightData);

        // Save to localStorage and remove generation status
        setLocalStorageData(insightData);
        removeGenerationStatus();

        return insightData;
      } catch (error) {
        console.error("Error generating document insights:", error);
        removeGenerationStatus();
        throw error;
      }
    };
  const fetchDocumentInsights =
    async (): Promise<DocumentInsightData | null> => {
      try {
        console.log("Fetching document insights for PDF:", PDF_ID);

        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: `${PDF_ID}#documentInsight`,
            userId: USER_ID,
            document_insight: true,
          }),
        });

        console.log("Document insights API response status:", response.status);

        if (!response.ok) {
          // throw new Error(`HTTP error! status: ${response.status}`);
          // console.log(res)
        }

        const result = await response.json();
        console.log("Document insights API result:", result);

        if (result.success && result.data && result.data.data) {
          const insightData = result.data.data;
          console.log("Document insights data:", insightData);

          // Save to localStorage
          setLocalStorageData(insightData);
          return insightData;
        } else {
          console.warn(
            "No document insights data found, trying to generate..."
          );

          // If no data found, try to generate it
          const generatedData = await generateDocumentInsights();
          if (generatedData) {
            console.log("Successfully generated document insights");

            // Wait a moment then try to fetch again from the main API
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Try to fetch the generated data from main API
            console.log("Retrying API fetch after generation");
            const retryResponse = await fetch(API_BASE_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                input: `${PDF_ID}#documentInsight`,
                userId: USER_ID,
                document_insight: true,
              }),
            });

            if (retryResponse.ok) {
              const retryResult = await retryResponse.json();
              console.log("Retry result:", retryResult);
              if (
                retryResult.success &&
                retryResult.data &&
                retryResult.data.data
              ) {
                // Save to localStorage
                setLocalStorageData(retryResult.data.data);
                return retryResult.data.data;
              }
            }

            // If retry fails, return the generated data directly
            console.log("Using generated data directly");
            return generatedData;
          }

          return null;
        }
      } catch (error) {
        console.error("Error fetching document insights:", error);
        throw error;
      }
    };

  const loadDocumentInsights = async () => {
    if (!USER_ID || !PDF_ID) {
      console.log("Missing USER_ID or PDF_ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if we're already generating
      const generationStatus = getGenerationStatus();
      if (generationStatus && generationStatus.isGenerating) {
        console.log("Already generating document insights, showing status...");
        setIsGenerating(true);
        setGenerationProgress(
          generationStatus.progress || "Generating insights..."
        );
        setLoading(false);
        return;
      }

      // First check localStorage
      const cachedData = getLocalStorageData();
      if (cachedData) {
        console.log("Using cached document insights:", cachedData);
        const transformedSections = transformDataToSections(cachedData);
        setSections(transformedSections);
        setComprehensionQuestions(cachedData.comprehension_check || []);
        setLoading(false);
        return;
      }

      // If no cached data, fetch from API
      const data = await fetchDocumentInsights();
      if (data) {
        const transformedSections = transformDataToSections(data);
        setSections(transformedSections);
        setComprehensionQuestions(data.comprehension_check || []);
      } else {
        setError("Failed to load document insights");
      }
    } catch (err) {
      console.error("Error loading document insights:", err);
      setError("Failed to load document insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentInsights();
  }, [USER_ID, PDF_ID]);

  if (loading) {
    return (
      <div
        className={`bg-[#EBEBF5] text-black dark:bg-[#0F1012] dark:text-white pt-32 ml-5 pr-[35px] w-[233px] xl:w-[250px] rounded-lg space-y-6 xl:space-y-[13px] ${className}`}
      >
        {/* Header */}
        <div className="flex items-center gap-[14px] text-[#36AF8D]">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-lg font-medium text-nowrap font-pt-sans">
            Document Insights
          </h2>
        </div>

        {/* Loading Content */}
        <div className="dark:bg-[#1A1B1F] bg-white rounded-[9px] w-[198px] xl:w-[226px] p-[25px] h-[400px] flex flex-col justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#36AF8D] mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading insights...
          </p>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div
        className={`bg-[#EBEBF5] text-black dark:bg-[#0F1012] dark:text-white pt-32 ml-5 pr-[35px] w-[233px] xl:w-[250px] rounded-lg space-y-6 xl:space-y-[13px] ${className}`}
      >
        {/* Header */}
        <div className="flex items-center gap-[14px] text-[#36AF8D]">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-lg font-medium text-nowrap font-pt-sans">
            Document Insights
          </h2>
        </div>

        {/* Generating Content */}
        <div className="dark:bg-[#1A1B1F] bg-white rounded-[9px] w-[198px] xl:w-[226px] p-[25px] h-[400px] flex flex-col justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#36AF8D] mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {generationProgress || "Generating insights..."}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-[#EBEBF5] text-black dark:bg-[#0F1012] dark:text-white pt-32 ml-5 pr-[35px] w-[233px] xl:w-[250px] rounded-lg space-y-6 xl:space-y-[13px] ${className}`}
      >
        {/* Header */}
        <div className="flex items-center gap-[14px] text-[#36AF8D]">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-lg font-medium text-nowrap font-pt-sans">
            Document Insights
          </h2>
        </div>

        {/* Error Content */}
        <div className="dark:bg-[#1A1B1F] bg-white rounded-[9px] w-[198px] xl:w-[226px] p-[25px] h-[400px] flex flex-col justify-center items-center">
          <p className="text-sm text-red-500 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#EBEBF5] text-black dark:bg-[#0F1012] dark:text-white pt-32 ml-5 pr-[35px] w-[233px] xl:w-[250px] rounded-lg space-y-6 xl:space-y-[13px] ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-[14px] text-[#36AF8D]">
        <BookOpen className="w-5 h-5" />
        <h2 className="text-lg font-medium text-nowrap font-pt-sans">
          Document Insights
        </h2>
      </div>

      {/* Content */}
      <div className="dark:bg-[#1A1B1F] bg-white rounded-[9px] w-[198px] xl:w-[226px] p-[25px] h-full flex flex-col overflow-hidden justify-start items-start">
        {/* Dynamic Sections */}
        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className="space-y-[18px] mb-[34px] xl:mb-[18px] w-full font-pt-sans"
          >
            <h3 className="text-[#36AF8D] font-medium text-[15px] xl:text-lg text-nowrap">
              {section.title}
            </h3>
            <ul className="space-y-[10px]">
              {section.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start w-full justify-start font-pt-sans gap-[10px] px-[10px]"
                >
                  <span className="w-1 h-1 bg-gray-400 mt-2 rounded-full flex-shrink-0" />
                  <span className="dark:text-gray-300 text-black text-[13px] xl:text-[15px] leading-relaxed">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Comprehension Check */}
        {comprehensionQuestions.length > 0 && (
          <div className="space-y-3 w-full">
            <h3 className="text-[#36AF8D] font-medium text-[15px] xl:text-lg text-nowrap font-pt-sans">
              Comprehension Check
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#797979] text-xs">
                  Questions ({comprehensionQuestions.length})
                </span>
                <div className="flex items-center gap-1 text-[#797979] text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{readingTime} min left</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full dark:bg-[#2A2D32] bg-[#96a0b1] rounded-full h-1">
                <div
                  className="bg-[#36AF8D] h-1 rounded-full transition-all duration-300"
                  style={{ width: "40%" }}
                />
              </div>

              {/* Sample question display */}
              {comprehensionQuestions.length > 0 && (
                <div className="mt-4">
                  <p className="text-[13px] xl:text-[14px] dark:text-gray-300 text-gray-700 leading-relaxed">
                    {comprehensionQuestions[0]}
                  </p>
                  {comprehensionQuestions.length > 1 && (
                    <p className="text-[11px] xl:text-[12px] text-[#797979] mt-2">
                      +{comprehensionQuestions.length - 1} more questions
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentInsights;
