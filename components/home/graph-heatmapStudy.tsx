import axios from "axios";
import React, { useEffect, useState } from "react";
import { SUBJECT_HEAT_MAP } from "./api/url";
import { CardElementHome } from "./UI/element-home-card";
import { ScrollArea } from "../ui/scroll-area";
import useUserId from "@/hooks/useUserId";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HeatmapUI from "./UI/heatmapUI";
import { boolean } from "zod";
import { IconDatabaseOff } from "@tabler/icons-react";

const StudyMasteryHeatMap = () => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [count, setCount] = useState<number>(1);
  const [error, setError] = useState()
  const [heatmapData, setheatmapData] = useState<
    {
      subject: string;
      topics: {
        topicName: string;
        subject: string;
        masteryScore: number;
        breakdown: {
          flashcardPerformance: number;
          completionRate: number;
          timeEfficiency: number;
        };
        masteryLevel: string;
      }[];
      averageMastery: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [screenSize, setScreenSize] = useState('large'); // 'large', 'xl', 'medium'
  const userId = useUserId();

  // Calculate responsive pagination based on screen size
  const getColumnsPerPage = () => {
    if (typeof window === 'undefined') return 4;

    const width = window.innerWidth;
    if (width >= 1280) { // xl and above
      return 4;
    } else if (width >= 1024) { // lg to xl
      return 3;
    } else {
      return 3; // smaller screens
    }
  };

  const [columnsPerPage, setColumnsPerPage] = useState(getColumnsPerPage());
  const totalPages = Math.ceil(15 / columnsPerPage);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newColumnsPerPage = getColumnsPerPage();
      setColumnsPerPage(newColumnsPerPage);

      // Reset to first page if current page would be out of bounds
      const newTotalPages = Math.ceil(15 / newColumnsPerPage);
      if (count > newTotalPages) {
        setCount(1);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [count]);

  // Calculate current page data
  const getCurrentPageData = () => {
    const startIndex = (count - 1) * columnsPerPage;
    const endIndex = startIndex + columnsPerPage;
    return heatmapData.slice(startIndex, endIndex);
  };

  function transformHeatmapData(apiData) {
    // Use custom knowledge gap analysis data
    const customData = {
      "Anatomy": [
        {
          "topic": "Thyroid Gland",
          "mastery_pct": 38
        },
        {
          "topic": "Brachial Plexus",
          "mastery_pct": 62
        },
        {
          "topic": "Cerebellum",
          "mastery_pct": 55
        },
        {
          "topic": "Pelvic Floor",
          "mastery_pct": 28
        }
      ],
      "Micro Biology": [
        {
          "topic": "Staphylococcus aureus",
          "mastery_pct": 72
        },
        {
          "topic": "Mycobacterium tuberculosis",
          "mastery_pct": 61
        },
        {
          "topic": "Hepatitis B (Virology)",
          "mastery_pct": 44
        },
        {
          "topic": "Hospital-Acquired Infections",
          "mastery_pct": 35
        }
      ],
      "Pharmacology": [
        {
          "topic": "Antiarrhythmics—Class III",
          "mastery_pct": 48
        },
        {
          "topic": "Antitubercular Drugs",
          "mastery_pct": 66
        },
        {
          "topic": "Insulins & Analogs",
          "mastery_pct": 58
        },
        {
          "topic": "ACE Inhibitors",
          "mastery_pct": 75
        }
      ],
      "Pathology": [
        {
          "topic": "Chronic Otitis Media (COM)",
          "mastery_pct": 30
        },
        {
          "topic": "IgE-Mediated Hypersensitivity",
          "mastery_pct": 30
        },
        {
          "topic": "Atherosclerosis",
          "mastery_pct": 64
        },
        {
          "topic": "Hashimoto Thyroiditis",
          "mastery_pct": 52
        }
      ]
    };

    // Define the 12 required specialties/columns
    const requiredSpecialties = [
      "Anatomy",
      "Micro Biology",
      "Pharmacology",
      "Pathology",
      "Physiology",
      "Pediatrics",
      "Obstetrics & GyG",
      "Orthopedics",
      "Oncology",
      "Radiology",
      "Dermatology",
      "Cardiology",
      "Biochemistry",
      "Emergency Medicine",
      "Psychiatry"
    ];

    // Find the maximum number of topics to determine grid height
    const maxTopics = Math.max(
      4,
      ...Object.values(customData).map((topics) => topics.length)
    );

    return requiredSpecialties.map((specialty) => {
      // Find matching subject data in custom data
      const subjectTopics = customData[specialty];

      if (!subjectTopics || subjectTopics.length === 0) {
        // Create empty rows for this specialty
        return {
          specialty: specialty,
          subjects: Array(maxTopics)
            .fill(null)
            .map(() => ({
              name: "",
              value: 0,
            })),
        };
      }

      // Create rows with actual data
      return {
        specialty: specialty,
        subjects: subjectTopics.map((topic) => ({
          name: topic.topic,
          value: topic.mastery_pct === 0 ? 0.1 : topic.mastery_pct,
        })),
      };
    });
  }

  const init = async () => {
    try {
      setLoading(true);
      // Use custom data instead of API call
      const reformedData = transformHeatmapData(null);
      setheatmapData(reformedData);
      setLoading(false);
    } catch (err) {
      console.error("Error processing dashboard data:", err);
      console.log(err.message || "Failed to process dashboard data");
      setError(err.message)
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  // Color scheme matching the reference image
  const getColorForScore = (score, hasData = true) => {

    if (!hasData || score === 0 || score === null || score === undefined)
      return "bg-transparent"; // Gray for no data
    if (score === 0.1) return "bg-zinc-600"
    if (score >= 80) return "bg-emerald-600";
    if (score >= 60) return "bg-emerald-500"; // Medium emerald for good scores (60-79%)
    if (score >= 40) return "bg-amber-600"; // Dark amber/orange for moderate scores (40-59%)
    return "bg-red"; // Dark red for low scores (0-39%)
  };

  const getTextColorForScore = (score, hasData = true) => {
    if (!hasData || score === 0 || score === null || score === undefined)
      return "text-zinc-300";
    return "text-white font-bold";
  };

  const getMasteryLevel = (score) => {
    if (score === 0 || score === null || score === undefined) return "No Data";
    if (score >= 80) return "Strong";
    if (score >= 60) return "Good";
    if (score >= 40) return "Moderate";
    return "Weak";
  };

  // Enhanced specialty header colors - simpler to match reference
  const getSpecialtyHeaderColor = (Specialty) => {
    return "text-white font-bold";
  };

  // Updated legend to match reference colors
  const legendItems = [
    { color: "bg-[#36AF8D]", label: "Strong " },
    { color: "bg-[#CF8A25]", label: "Moderate " },
    { color: "bg-[#C93939]", label: "Weak" },
  ];

  const canGoNext = count < Math.ceil(15 / columnsPerPage);
  const canGoPrev = count > 1;

  return (
    <CardElementHome
      loading={loading}
      classes={"h-[401px] w-full relative"}
      title="Knowledge Gap Analysis"
    >

      <>

        <div className="absolute -top-12 right-0 flex justify-between items-center gap-2 max-sm:gap-0.5">
          {/* Page indicator */}
          <span className="text-xs max-sm:hidden text-zinc-400 mr-2">
            {count} / {Math.ceil(15 / columnsPerPage)}
          </span>

          <button
            onClick={() => {
              if (canGoPrev) {
                setCount(prev => prev - 1);
              }
            }}
            disabled={!canGoPrev}
            className={`p-1 rounded ${canGoPrev ? 'text-white hover:bg-zinc-700' : 'text-zinc-500 cursor-not-allowed'}`}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => {
              if (canGoNext) {
                setCount(prev => prev + 1);
              }
            }}
            disabled={!canGoNext}
            className={`p-1 rounded ${canGoNext ? 'text-white hover:bg-zinc-700' : 'text-zinc-500 cursor-not-allowed'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {
          heatmapData.length === 0 && <div className="h-[400px] flex-col items-center w-full flex justify-center">
            <IconDatabaseOff className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mb-4" />
            <h3 className="text-base font-medium dark:text-white text-black mb-2">
              {error ?? "Data not available "}
            </h3>
          </div>
        }
        {/* Responsive Heat Map Grid */}

        {
          heatmapData.length > 0 &&

          <>
            <div className="mt-2 h-full rounded-lg w-full flex flex-col justify-center items-stretch gap-[6px] font-causten-semibold">

              <HeatmapUI
                heatmapData={getCurrentPageData()}
                getSpecialtyHeaderColor={getSpecialtyHeaderColor}
                getColorForScore={getColorForScore}
                setHoveredCell={setHoveredCell}
                getTextColorForScore={getTextColorForScore}
              />

              {/* Legend - simplified to match reference */}
              <div className="flex items-start justify-center gap-5 max-sm:gap-2 flex-wrap">
                {legendItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="border border-zinc-400 rounded-full p-1">
                      <div className={`rounded-full ${item.color} w-2 h-2`}></div>
                    </div>
                    <span className="text-xs dark:text-zinc-300 text-zinc-800">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        }

        {/* Hover Tooltip - simplified */}
        {hoveredCell && (
          <div
            className="absolute z-50
      dark:bg-zinc-800 bg-white
      dark:border-zinc-600 border-zinc-200
      rounded-lg p-3 shadow-xl
      pointer-events-none transform space-y-2 -translate-y-full"
          >
            <div className="text-sm font-causten-semibold
      dark:text-white text-zinc-900">
              {hoveredCell.name}
            </div>
            <div className="text-xs
      dark:text-zinc-300 text-zinc-600">
              Score: {hoveredCell.value}%
            </div>
            <div className="text-xs
      dark:text-zinc-400 text-zinc-500">
              Level: {getMasteryLevel(hoveredCell.value)}
            </div>
          </div>
        )}
      </>
    </CardElementHome>
  );
};

export default StudyMasteryHeatMap;