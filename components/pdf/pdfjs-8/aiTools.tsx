import React, { useState, useEffect } from "react";
import {
  FileText,
  Quote,
  Network,
  Zap,
  Target,
  CheckSquare,
  ArrowLeft,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { useSettings } from "@/context/store";
import useUserId from "@/hooks/useUserId";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  apiKey: string | null;
  type: "screen" | "navigation"; // screen = in-app screen, navigation = external navigation
}

interface SmartSummaryData {
  executive_summary: string;
  key_points: string[];
  supporting_details: string[];
  clinical_applications: string[];
  sources?: string[] | null;
}

interface CitationData {
  citations: string[];
}

interface GenerationStatus {
  isGenerating: boolean;
  timestamp: number;
  progress?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: "smart-summary",
    label: "Smart Summary",
    icon: <FileText className="w-5 h-5" />,
    apiKey: "smart_summary",
    type: "screen",
  },
  {
    id: "citation-review",
    label: "Citation Review",
    icon: <Quote className="w-5 h-5" />,
    apiKey: "citations",
    type: "screen",
  },
  {
    id: "concept-mapper",
    label: "Concept Mapper",
    icon: <Network className="w-5 h-5" />,
    apiKey: null,
    type: "screen",
  },
  {
    id: "topic-tracker",
    label: "Topic Tracker",
    icon: <Target className="w-5 h-5" />,
    apiKey: null,
    type: "screen",
  },
  {
    id: "flashcard-generator",
    label: "Flashcard Generator",
    icon: <Zap className="w-5 h-5" />,
    apiKey: null,
    type: "navigation",
  },
  {
    id: "extract-quiz",
    label: "Extract & Quiz",
    icon: <CheckSquare className="w-5 h-5" />,
    apiKey: null,
    type: "navigation",
  },
];

const API_BASE_URL =
  "https://rj2rr7rhrueihv6rrxy3nh75hy0kjqmv.lambda-url.ap-south-1.on.aws/";
const GENERATE_CITATIONS_URL =
  `${process.env.NEXT_PUBLIC_GENERATION_URL}/generate-citations`;
const GENERATE_SMART_SUMMARY_URL =
  `${process.env.NEXT_PUBLIC_GENERATION_URL}/generate-smart-summary`;

// localStorage keys
const getDataKey = (apiKey: string, pdfId: string) =>
  `ai_tools_data_${apiKey}_${pdfId}`;
const getGenerationStatusKey = (apiKey: string, pdfId: string) =>
  `ai_tools_generating_${apiKey}_${pdfId}`;
const getLastUpdatedKey = (apiKey: string, pdfId: string) =>
  `ai_tools_updated_${apiKey}_${pdfId}`;

// Cache duration: 1 hour (in milliseconds)
const CACHE_DURATION = 60 * 60 * 1000;

export default function AIToolsSidebar({ id }) {
  const [currentScreen, setCurrentScreen] = useState<string>("main");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const [allToolsData, setAllToolsData] = useState<{ [key: string]: any }>({});
  const [generationStatuses, setGenerationStatuses] = useState<{
    [key: string]: GenerationStatus;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const USER_ID = useUserId();
  const PDF_ID = id;

  // Load all tool data when component mounts
  useEffect(() => {
    if (!USER_ID || !PDF_ID) return;
    loadAllToolsData();
  }, [USER_ID, PDF_ID]);

  // Helper functions for localStorage operations
  const setLocalStorageData = (apiKey: string, data: any) => {
    try {
      localStorage.setItem(getDataKey(apiKey, PDF_ID), JSON.stringify(data));
      localStorage.setItem(
        getLastUpdatedKey(apiKey, PDF_ID),
        Date.now().toString()
      );
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  };

  const getLocalStorageData = (apiKey: string) => {
    try {
      const data = localStorage.getItem(getDataKey(apiKey, PDF_ID));
      const lastUpdated = localStorage.getItem(
        getLastUpdatedKey(apiKey, PDF_ID)
      );

      if (data && lastUpdated) {
        const timeDiff = Date.now() - parseInt(lastUpdated);
        if (timeDiff < CACHE_DURATION) {
          return JSON.parse(data);
        } else {
          // Data is expired, remove it
          removeLocalStorageData(apiKey);
        }
      }
    } catch (error) {
      console.warn("Failed to read from localStorage:", error);
    }
    return null;
  };

  const removeLocalStorageData = (apiKey: string) => {
    try {
      localStorage.removeItem(getDataKey(apiKey, PDF_ID));
      localStorage.removeItem(getLastUpdatedKey(apiKey, PDF_ID));
      localStorage.removeItem(getGenerationStatusKey(apiKey, PDF_ID));
    } catch (error) {
      console.warn("Failed to remove from localStorage:", error);
    }
  };

  const setGenerationStatus = (apiKey: string, status: GenerationStatus) => {
    try {
      localStorage.setItem(
        getGenerationStatusKey(apiKey, PDF_ID),
        JSON.stringify(status)
      );
      setGenerationStatuses((prev) => ({
        ...prev,
        [apiKey]: status,
      }));
    } catch (error) {
      console.warn("Failed to save generation status:", error);
    }
  };

  const getGenerationStatus = (apiKey: string): GenerationStatus | null => {
    try {
      const status = localStorage.getItem(
        getGenerationStatusKey(apiKey, PDF_ID)
      );
      if (status) {
        const parsed = JSON.parse(status);
        // Check if generation started more than 10 minutes ago (consider it failed)
        const timeDiff = Date.now() - parsed.timestamp;
        if (timeDiff > 10 * 60 * 1000) {
          removeGenerationStatus(apiKey);
          return null;
        }
        return parsed;
      }
    } catch (error) {
      console.warn("Failed to read generation status:", error);
    }
    return null;
  };

  const removeGenerationStatus = (apiKey: string) => {
    try {
      localStorage.removeItem(getGenerationStatusKey(apiKey, PDF_ID));
      setGenerationStatuses((prev) => {
        const newStatuses = { ...prev };
        delete newStatuses[apiKey];
        return newStatuses;
      });
    } catch (error) {
      console.warn("Failed to remove generation status:", error);
    }
  };

  const callGenerateAPI = async (apiKey: string): Promise<any> => {
    try {
      // Set generation status
      setGenerationStatus(apiKey, {
        isGenerating: true,
        timestamp: Date.now(),
        progress: `Generating ${apiKey}...`,
      });

      let generateUrl = "";
      if (apiKey === "smart_summary") {
        generateUrl = GENERATE_SMART_SUMMARY_URL;
      } else if (apiKey === "citations") {
        generateUrl = GENERATE_CITATIONS_URL;
      } else {
        removeGenerationStatus(apiKey);
        return null;
      }

      // Call the generation API
      const response = await fetch(generateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: USER_ID,
          key: PDF_ID,
          model_id: "gpt-4o-mini",
          document_insight: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("=========>", result)
      // Check if generation was successful
      if (!result.success) {
        throw new Error("Generation failed");
      }

      // Update generation status to indicate polling phase
      setGenerationStatus(apiKey, {
        isGenerating: true,
        timestamp: Date.now(),
        progress: `Processing ${apiKey}...`,
      });

      // Poll the main Lambda API for the generated data
      const pollForData = async (
        maxAttempts = 30,
        delayMs = 2000
      ): Promise<any> => {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            console.log(`Polling attempt ${attempt} for ${apiKey}`);

            const pollResponse = await fetch(API_BASE_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                input: `${PDF_ID}#${apiKey}`,
                userId: USER_ID,
              }),
            });
            console.log("pollResponse", pollResponse)
            if (pollResponse.ok) {
              const pollResult = await pollResponse.json();

              if (
                pollResult.success &&
                pollResult.data &&
                pollResult.data.data
              ) {
                console.log(
                  `Successfully retrieved generated data for ${apiKey} on attempt ${attempt}`
                );
                return pollResult.data.data;
              }
            }

            // Update progress
            setGenerationStatus(apiKey, {
              isGenerating: true,
              timestamp: Date.now(),
              progress: `Processing ${apiKey}... (${attempt}/${maxAttempts})`,
            });

            // Wait before next attempt (except on last attempt)
            if (attempt < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
          } catch (pollError) {
            console.warn(
              `Polling attempt ${attempt} failed for ${apiKey}:`,
              pollError
            );

            // Continue to next attempt unless it's the last one
            if (attempt < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
          }
        }

        throw new Error(
          `Failed to retrieve data after ${maxAttempts} polling attempts`
        );
      };

      // Start polling for the data
      const generatedData = await pollForData();

      // Process the data based on apiKey type
      let processedResult;
      if (apiKey === "smart_summary") {
        // Parse the executive_summary JSON string if needed
        if (
          generatedData.executive_summary &&
          typeof generatedData.executive_summary === "string"
        ) {
          try {
            const parsed = JSON.parse(generatedData.executive_summary);
            processedResult = {
              executive_summary: parsed.executive_summary || "",
              key_points: parsed.key_points || generatedData.key_points || [],
              supporting_details:
                parsed.supporting_details ||
                generatedData.supporting_details ||
                [],
              clinical_applications:
                parsed.clinical_applications ||
                generatedData.clinical_applications ||
                [],
              sources: parsed.sources || generatedData.sources || null,
            };
          } catch (e) {
            processedResult = generatedData;
          }
        } else {
          processedResult = generatedData;
        }
      } else if (apiKey === "citations") {
        processedResult = { citations: generatedData.citations || [] };
      } else {
        processedResult = generatedData;
      }

      // Save to localStorage and remove generation status
      if (processedResult) {
        setLocalStorageData(apiKey, processedResult);
      }
      removeGenerationStatus(apiKey);

      return processedResult;
    } catch (error) {
      console.error(`Error generating ${apiKey}:`, error);
      removeGenerationStatus(apiKey);
      return null;
    }
  };

  const callAPI = async (apiKey: string): Promise<any> => {
    try {
      console.log(`Starting callAPI for ${apiKey}`);

      // First check if we're already generating this
      const generationStatus = getGenerationStatus(apiKey);
      if (generationStatus && generationStatus.isGenerating) {
        console.log(`Already generating ${apiKey}, skipping...`);
        return null;
      }

      // Check localStorage first
      const cachedData = getLocalStorageData(apiKey);
      if (cachedData) {
        console.log(`Using cached data for ${apiKey}:`, cachedData);
        return cachedData;
      }

      console.log(`Making API call for ${apiKey}`);
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: `${PDF_ID}#${apiKey}`,
          userId: USER_ID,
        }),
      });

      console.log(`API response status for ${apiKey}:`, response.status);

      if (!response.ok) {
        console.log(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`API Result for ${apiKey}:`, result);

      if (result.success && result.data && result.data.data) {
        console.log(
          `Saving successful API result to localStorage for ${apiKey}`
        );
        // Save to localStorage
        setLocalStorageData(apiKey, result.data.data);
        return result.data.data;
      } else {
        console.warn(`No data found for ${apiKey}, trying to generate...`);

        // If no data found, try to generate it
        const generatedData = await callGenerateAPI(apiKey);
        if (generatedData) {
          console.log(
            `Successfully generated data for ${apiKey}:`,
            generatedData
          );

          // Save generated data to localStorage immediately
          setLocalStorageData(apiKey, generatedData);

          // Wait a moment then try to fetch again from the main API
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Try to fetch the generated data from main API
          console.log(`Retrying API fetch for ${apiKey} after generation`);
          const retryResponse = await fetch(API_BASE_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              input: `${PDF_ID}#${apiKey}`,
              userId: USER_ID,
            }),
          });

          if (retryResponse.ok) {
            const retryResult = await retryResponse.json();
            console.log(`Retry result for ${apiKey}:`, retryResult);
            if (
              retryResult.success &&
              retryResult.data &&
              retryResult.data.data
            ) {
              // Save to localStorage
              setLocalStorageData(apiKey, retryResult.data.data);
              return retryResult.data.data;
            }
          }

          // If retry fails, return the generated data directly
          console.log(`Using generated data directly for ${apiKey}`);
          return generatedData;
        }

        console.log(`No data available for ${apiKey}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching ${apiKey}:`, error);
      return null;
    }
  };

  const loadAllToolsData = async () => {
    setLoading(true);
    setError(null);
    const loadedData: { [key: string]: any } = {};

    // Filter items that have API keys (only Smart Summary and Citation Review)
    const itemsWithAPI = navigationItems.filter((item) => item.apiKey !== null);
    console.log("Items with API:", itemsWithAPI);

    // Load existing generation statuses
    const statuses: { [key: string]: GenerationStatus } = {};
    for (const item of itemsWithAPI) {
      const status = getGenerationStatus(item.apiKey!);
      if (status) {
        statuses[item.apiKey!] = status;
      }
    }
    setGenerationStatuses(statuses);

    // First, check localStorage for existing data
    let hasAllData = true;
    for (const item of itemsWithAPI) {
      const cachedData = getLocalStorageData(item.apiKey!);
      if (cachedData) {
        loadedData[item.apiKey!] = cachedData;
        console.log(`Loaded cached data for ${item.apiKey}:`, cachedData);
      } else {
        hasAllData = false;
      }
    }

    // If we have all data in localStorage, use it
    if (hasAllData) {
      console.log("All data found in cache, using cached data:", loadedData);
      setAllToolsData(loadedData);
      setLoading(false);
      return;
    }

    // Otherwise, fetch missing data from API
    const totalItems = itemsWithAPI.length;
    let completed = 0;

    for (const item of itemsWithAPI) {
      // Skip if we already have this data
      if (loadedData[item.apiKey!]) {
        completed++;
        continue;
      }

      // Skip if currently generating
      const generationStatus = getGenerationStatus(item.apiKey!);
      if (generationStatus && generationStatus.isGenerating) {
        setLoadingProgress(
          `${item.label} is being generated... (${completed + 1}/${totalItems})`
        );
        completed++;
        continue;
      }

      setLoadingProgress(
        `Loading ${item.label}... (${completed + 1}/${totalItems})`
      );

      console.log("Fetching data for:", item);
      // Fetch from API
      const data = await callAPI(item.apiKey!);
      console.log(`API call result for ${item.apiKey}:`, data);
      if (data) {
        loadedData[item.apiKey!] = data;
        console.log(`Successfully loaded data for ${item.apiKey}`);
        // Update state immediately so UI reflects the new data
        setAllToolsData((prevData) => ({
          ...prevData,
          [item.apiKey!]: data,
        }));
      }

      completed++;
    }

    // Final state update
    setAllToolsData(loadedData);
    setLoading(false);
    setLoadingProgress("");
    console.log("Final loaded data:", loadedData);
  };

  const handleFeature = (item: NavigationItem) => {
    if (item.type === "navigation") {
      // Handle navigation items (flashcard generator, extract & quiz)
      // You can add your navigation logic here
      console.log(`Navigating to ${item.label}`);
      // Example: window.location.href = '/flashcard-generator';
      // or use your routing solution
    } else {
      // Handle screen items (smart summary, citation review, concept mapper, topic tracker)
      setCurrentScreen(item.id);
    }
  };

  const formatText = (text: string) => {
    if (!text) return "";
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  };

  const SmartSummaryScreen = () => {
    const data = allToolsData["smart_summary"];
    const generationStatus = generationStatuses["smart_summary"];

    if (generationStatus && generationStatus.isGenerating) {
      return (
        <div className="p-4 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#36AF8D] mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generating Smart Summary...
          </p>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="p-4 text-center">
          <p>No data available</p>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-6 overflow-y-auto max-h-[600px]">
        <div>
          <h2 className="text-xs font-semibold mb-2 text-[#36AF8D]">
            Executive Summary
          </h2>
          <p className="text-sm leading-relaxed">{data.executive_summary}</p>
        </div>

        <div>
          <h2 className="text-xs font-semibold mb-2 text-[#36AF8D]">
            Key Points
          </h2>
          <ul className="list-disc pl-4 space-y-1">
            {data.key_points
              ?.filter((point) => point.trim())
              .map((point, index) => (
                <li
                  key={index}
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: formatText(point) }}
                />
              ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold mb-2 text-[#36AF8D]">
            Supporting Details
          </h2>
          <ul className="list-disc pl-4 space-y-1">
            {data.supporting_details?.map((detail, index) => (
              <li
                key={index}
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: formatText(detail) }}
              />
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold mb-2 text-[#36AF8D]">
            Clinical Applications
          </h2>
          <ul className="list-disc pl-4 space-y-1">
            {data.clinical_applications
              ?.filter((app) => app.trim())
              .map((application, index) => (
                <li
                  key={index}
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: formatText(application) }}
                />
              ))}
          </ul>
        </div>
      </div>
    );
  };

  const CitationReviewScreen = () => {
    const data = allToolsData["citations"];
    const generationStatus = generationStatuses["citations"];

    if (generationStatus && generationStatus.isGenerating) {
      return (
        <div className="p-4 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#36AF8D] mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generating Citations...
          </p>
        </div>
      );
    }

    if (!data || !data.citations || data.citations.length === 0) {
      return (
        <div className="p-4 text-center">
          <p>No data available</p>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-3 overflow-y-auto max-h-[600px]">
        <h2 className="text-sm font-semibold mb-4 text-[#36AF8D]">
          Citations ({data.citations.length})
        </h2>
        {data?.citations?.map((citation, index) => (
          <div key={index} className="border-l-2 border-[#36AF8D] pl-3 py-2">
            <ReactMarkdown className="text-sm leading-relaxed">
              {citation}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    );
  };

  const GenericScreen = ({
    title,
    apiKey,
  }: {
    title: string;
    apiKey: string | null;
  }) => {
    if (!apiKey) {
      return (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold mb-4 text-[#36AF8D]">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            This feature will be implemented soon.
          </p>
        </div>
      );
    }

    const data = allToolsData[apiKey];
    const generationStatus = generationStatuses[apiKey];

    if (generationStatus && generationStatus.isGenerating) {
      return (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold mb-4 text-[#36AF8D]">{title}</h2>
          <Loader2 className="w-6 h-6 animate-spin text-[#36AF8D] mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generating content...
          </p>
        </div>
      );
    }

    return (
      <div className="p-4 text-center">
        <h2 className="text-lg font-semibold mb-4 text-[#36AF8D]">{title}</h2>
        {data ? (
          <div className="text-left">
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </div>
    );
  };

  const renderScreen = () => {
    const currentItem = navigationItems.find(
      (item) => item.id === currentScreen
    );

    switch (currentScreen) {
      case "smart-summary":
        return <SmartSummaryScreen />;
      case "citation-review":
        return <CitationReviewScreen />;
      default:
        return currentItem ? (
          <GenericScreen
            title={currentItem.label}
            apiKey={currentItem.apiKey}
          />
        ) : null;
    }
  };

  const getCurrentTitle = () => {
    const item = navigationItems.find((item) => item.id === currentScreen);
    return item ? item.label : "AI Tools";
  };

  // Show loading screen while fetching all data
  if (loading) {
    return (
      <div className="w-full bg-[#EBEBF5] text-black dark:bg-[#0F1012] dark:text-white">
        <nav className="w-[300px] xl:ml-5 ml-3 pt-32 transform transition-transform duration-200 ease-in-out flex flex-col">
          <div className="p-4 pb-6">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded bg-[#36AF8D] flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full opacity-90" />
              </div>
              <h1 className="text-[#36AF8D] font-semibold text-lg xl:text-[20px] font-pt-sans">
                AI Tools
              </h1>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#36AF8D] mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loadingProgress || "Loading AI Tools..."}
              </p>
            </div>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#EBEBF5] text-black dark:bg-[#0F1012] dark:text-white">
      <nav className="w-[300px] xl:ml-5 ml-3 pt-32 transform transition-transform duration-200 ease-in-out flex flex-col">
        {/* Header */}
        <div className="p-4 pb-6">
          <div className="flex items-center space-x-3">
            {currentScreen !== "main" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentScreen("main")}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="w-6 h-6 rounded bg-[#36AF8D] flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full opacity-90" />
            </div>
            <h1 className="text-[#36AF8D] font-semibold text-lg xl:text-[20px] font-pt-sans">
              {getCurrentTitle()}
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {currentScreen === "main" ? (
            /* Navigation Items */
            <div className="py-4 overflow-y-auto">
              <ul className="space-y-[18px] px-3">
                {navigationItems.map((item) => {
                  const hasData = item.apiKey
                    ? allToolsData[item.apiKey]
                    : false;
                  const hasAPI = item.apiKey !== null;
                  const isNavigationType = item.type === "navigation";
                  const isGenerating = item.apiKey
                    ? generationStatuses[item.apiKey]?.isGenerating
                    : false;

                  return (
                    <li key={item.id}>
                      <Button
                        variant="ghost"
                        className={`w-full flex items-center justify-between gap-[10px] px-[22px] py-[13px] rounded-lg text-left text-[15px] xl:text-[18px] dark:hover:bg-zinc-800 dark:bg-[#1A1B1F] bg-white dark:text-[#D9D9D9] text-black hover:text-emerald-400`}
                        onClick={() => handleFeature(item)}
                      >
                        <div className="flex items-center gap-[10px]">
                          <span className="dark:text-[#D9D9D9] text-black">
                            {item.icon}
                          </span>
                          <span className="font-medium text-sm">
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isGenerating && (
                            <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                          )}
                          {hasAPI && hasData && !isGenerating && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                          {isNavigationType && (
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          )}
                        </div>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            /* Tool Screen */
            <div className="bg-white dark:bg-[#1A1B1F] rounded-lg mx-3 shadow-lg">
              {renderScreen()}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
