"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Heart,
  Bone,
  Eye,
  Zap,
  Droplets,
  Camera,
  ChevronRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import Image from "next/image";
import SubjectFolders from "@/components/chat/SubjectFolders";
import { useRouter } from "next/navigation";
import useUserId from "@/hooks/useUserId";
import { useSettings } from "@/context/store";
import { useViewCombination } from "@/hooks/useViewCombination.ts";
import { useGetPdfNameById } from "@/hooks/useGetPdfNameById";
import { getDocName } from "@/lib/utils";


// Types
interface Session {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  memory?: any;
  agentId?: string;
}

interface PdfSessions {
  [pdfId: string]: Session[];
}

interface SubjectData {
  [subject: string]: PdfSessions;
}

interface StudyHistoryItem {
  icon: React.ElementType;
  name: string;
  time: string;
  color: string;
  img: string;
  subject: string;
  pdfSessions: PdfSessions;
}

// Component 1: Acolyte AI Card
const AcolyteAICard = ({
  setOpenFolder,
}: {
  setOpenFolder: (open: boolean) => void;
}) => {
  const queryOptions = [
    {
      icon: "/newIcons/doctor.svg",
      label: "Explain a concept",
      query: "Explain a concept",
    },
    {
      icon: "/newIcons/analysis.svg",
      label: "Clinical application",
      query: "Clinical application",
    },
    {
      icon: "/newIcons/piechart.svg",
      label: "Compare and contrast",
      query: "Compare and contrast",
    },
    {
      icon: "/newIcons/help.svg",
      label: "Quiz me on a topic",
      query: " Quiz me on a topic",
    },
  ];

  const handleQueryClick = (query: string) => {
    setOpenFolder(true);
    localStorage.removeItem("active_chat_session");
    localStorage.setItem("aco-query", query);
  };

  return (
    <Card className="dark:bg-transparent bg-transparent border-none shadow-none col-span-2 xl:col-span-2 h-full ">
      <CardHeader className="space-y-5 px-6 p-0 pb-[15px] w-full">
        <div className="flex items-center gap-3">
          <Image
            src={"/bigOwl.svg"}
            height={30}
            width={30}
            className="w-5 h-7"
            alt={"owl"}
          />
          <CardTitle className="dark:text-white text-[#228367] font-[futureHeadlineBold] font-thin tracking-wide  text-[22px] 2xl:text-[23px]">
            Acolyte AI
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent
        className="space-y-4 p-0 bg-[#F3F4F9] dark:bg-[#181A1D] py-[26px] px-[20px] 2xl:py-[28px] 2xl:px-[22px] w-full h=-full
                   dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md rounded-[7px]"
      >
        <Button
          className="w-full m-0 bg-[#36AF8D] hover:bg-[#32a383] text-[16px] mb-[50px] mt-[16px] dark:bg-[#36AF8D] font-[futureHeadlineBold] font-thin tracking-wide
                     dark:hover:bg-[#32a383] text-white dark:text-black"
          onClick={() => {
            setOpenFolder(true);
            localStorage.removeItem("active_chat_session");
          }}
        >
          Start new chat
        </Button>

        <div>
          <h3 className="text-[18px] 2xl:text-[20px]  font-[futureHeadlineBold] font-thin tracking-wide  dark:text-white text-[#184C3D] mb-3 2xl:mb-[14px]">
            Choose query type
          </h3>
          <div className="space-y-3 2xl:space-y-[14px]">
            {queryOptions.map((option, index) => (
              <Button
                key={index}
                variant="ghost"
                className="flex items-center justify-center gap-2 py-[9px] px-4 rounded font-medium text-[17px]
                           dark:hover:bg-[#232529] dark:bg-[#232529] bg-[#F2F2F2] cursor-pointer w-full shadow-md"
                onClick={() => handleQueryClick(option.query)}
              >
                <div className="flex justify-start items-center gap-6 w-56 overflow-hidden">
                  <Image
                    src={option.icon}
                    height={30}
                    width={30}
                    className="w-5 h-5"
                    alt={option.label}
                  />
                  <span className="text-[17px] 2xl:text-[18px] truncate font-causten-semibold">
                    {option.label}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Component 2: Study History Content
const StudyHistoryContent = ({
  studyHistoryItems,
  expandedSubject,
  expandedPdf,
  loading,
  error,
  onSubjectClick,
  onPdfClick,
  onSessionClick,
}: {
  studyHistoryItems: StudyHistoryItem[];
  expandedSubject: string | null;
  expandedPdf: string | null;
  loading: boolean;
  error: string | null;
  onSubjectClick: (subject: string) => void;
  onPdfClick: (pdfId: string) => void;
  onSessionClick: (pdfId: string, session: Session) => void;
}) => {
  const getPdfNameById = useGetPdfNameById()
  const { fileSystem } = useSettings()
  const userId = useUserId();
  const formatSessionName = (sessionId: string) => {
    const parts = sessionId.split("#");
    if (parts.length >= 3) {
      const uuid = parts[1];
      const shortUuid = uuid.substring(0, 8);
      return `Session ${shortUuid}`;
    }
    return `Session ${sessionId.substring(0, 8)}...`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">
          Loading study history...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500 dark:text-red-400">
          Error loading study history: {error}
        </div>
      </div>
    );
  }

  if (studyHistoryItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">
          No study history available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[16px] ">
      {studyHistoryItems.map((item, index) => (
        <div key={index}>
          {/* Subject Level */}
          <div
            className="flex w-full items-center justify-between font-causten-semibold rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-[#232529] p-2 transition-colors"
            onClick={() => onSubjectClick(item.subject)}
          >
            <div className="flex items-center gap-3">
              <Image
                src={item.img}
                height={30}
                width={30}
                className="w-6 h-6"
                alt={item.name}
              />
              <span className="dark:text-white text-black max-sm:text-[15px] text-[18px] 2xl:text-[19px]">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] max-sm:text-[10px] text-gray-400 2xl:text-[16px]">
                {item.time}
              </span>
              <ChevronRight
                className={`w-4 h-4 text-gray-400 transition-transform ${expandedSubject === item.subject ? "rotate-90" : ""
                  }`}
              />
            </div>
          </div>

          {/* PDFs List */}
          {expandedSubject === item.subject && (
            <div className="ml-6 mt-2 space-y-2">
              {Object.entries(item.pdfSessions).map(([pdfId, sessions]) => (
                <div key={pdfId}>
                  <div
                    className="flex items-center justify-between p-2 bg-gray-100 dark:bg-[#232529] rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-[#2a2d32] transition-colors"
                    onClick={() => onPdfClick(pdfId)}
                  >
                    <span className="text-sm dark:text-gray-300 text-gray-600">
                      {getDocName(pdfId, fileSystem)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-base text-gray-400">
                        {sessions.length} session
                        {sessions.length !== 1 ? "s" : ""}
                      </span>
                      <ChevronRight
                        className={`w-3 h-3 text-gray-400 transition-transform ${expandedPdf === pdfId ? "rotate-90" : ""
                          }`}
                      />
                    </div>
                  </div>

                  {/* Sessions List */}
                  {expandedPdf === pdfId && (
                    <div className="ml-4 mt-1 space-y-1">
                      {sessions.map((session, sessionIndex) => (
                        <div
                          key={sessionIndex}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#1a1d21] rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-[#232529] transition-colors"
                          onClick={() => onSessionClick(pdfId, session)}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm dark:text-gray-300 text-gray-600 font-medium">
                              {formatSessionName(session.sessionId)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {/* {formatDate(session.createdAt)} */}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400">
                            {session.sessionId.substring(0, 8)}...
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {index < studyHistoryItems.length - 1 && (
            <Separator className="dark:bg-muted bg-[#282B30] my-[8px]" />
          )}
        </div>
      ))}
    </div>
  );
};

// Component 3: Study History Card
const StudyHistoryCard = ({
  studyHistoryItems,
  expandedSubject,
  expandedPdf,
  loading,
  error,
  onSubjectClick,
  onPdfClick,
  onSessionClick,
}: {
  studyHistoryItems: StudyHistoryItem[];
  expandedSubject: string | null;
  expandedPdf: string | null;
  loading: boolean;
  error: string | null;
  onSubjectClick: (subject: string) => void;
  onPdfClick: (pdfId: string) => void;
  onSessionClick: (pdfId: string, session: Session) => void;
}) => {
  return (
    <Card className="dark:bg-transparent bg-transparent border-none shadow-none col-span-3 xl:col-span-5 w-full">
      <CardHeader className="space-y-5 px-6 p-0 pb-[15px] w-full">
        <CardTitle className="dark:text-white text-[#228367] font-[futureHeadlineBold] font-thin tracking-wide text-[22px] 2xl:text-[23px]">
          Study history
        </CardTitle>
      </CardHeader>
      <CardContent className="dark:bg-[#181A1D] w-full h-[389px] 2xl:h-[404px] overflow-y-auto no-scrollbar bg-[#F3F4F9] rounded-[7px] py-[26px] px-[20px] 2xl:py-[28px] 2xl:px-[48px] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md">
        <StudyHistoryContent
          studyHistoryItems={studyHistoryItems}
          expandedSubject={expandedSubject}
          expandedPdf={expandedPdf}
          loading={loading}
          error={error}
          onSubjectClick={onSubjectClick}
          onPdfClick={onPdfClick}
          onSessionClick={onSessionClick}
        />
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [openFolder, setOpenFFolder] = useState(false);
  const [studyHistoryItems, setStudyHistoryItems] = useState<
    StudyHistoryItem[]
  >([]);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedPdf, setExpandedPdf] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const userId = useUserId();
  const { setComposerInsertText } = useSettings();
  const { currentViewCombination, activeFeatures, updateViewCombination } =
    useViewCombination();

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CHAT_BASE_URL}/?userId=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        const subjectsData: SubjectData = data.subjects || {};

        const historyItems = Object.keys(subjectsData).map(
          (subject, subjectIndex) => {
            const pdfSessions = subjectsData[subject];

            const totalSessions = Object.values(pdfSessions).reduce(
              (total: number, sessions: Session[]) => total + sessions.length,
              0
            );

            return {
              icon: [Activity, Heart, Bone, Eye, Zap, Droplets, Camera][
                subjectIndex % 7
              ],
              name: subject,
              time: `${totalSessions} session${totalSessions !== 1 ? "s" : ""}`,
              color: [
                "text-emerald-400",
                "text-red",
                "text-yellow-400",
                "text-teal-400",
                "text-blue",
                "text-purple-400",
                "text-pink-400",
              ][subjectIndex % 7],
              img: [
                "/newIcons/pediatrician.svg",
                "/newIcons/oncology.svg",
                "/newIcons/bones.svg",
                "/newIcons/hair.svg",
                "/newIcons/germs.svg",
                "/newIcons/kidney.svg",
                "/newIcons/x-ray.svg",
              ][subjectIndex % 7],
              subject: subject,
              pdfSessions: pdfSessions,
            };
          }
        );

        console.log("Transformed history items:", historyItems);
        setStudyHistoryItems(historyItems);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setError(error instanceof Error ? error.message : String(error));
        setStudyHistoryItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (!userId) return;
    fetchChatHistory();
  }, [userId]);

  const handleSubjectClick = (subject: string) => {
    if (expandedSubject === subject) {
      setExpandedSubject(null);
      setExpandedPdf(null);
    } else {
      setExpandedSubject(subject);
      setExpandedPdf(null);
    }
  };

  const handlePdfClick = (pdfId: string) => {
    if (expandedPdf === pdfId) {
      setExpandedPdf(null);
    } else {
      setExpandedPdf(pdfId);
    }
  };

  const handleSessionClick = (pdfId: string, session: Session) => {
    const SESSION_KEY = "active_chat_session";
    localStorage.setItem(SESSION_KEY, session.sessionId);
    const query = localStorage.getItem("aco-query");

    // Set view combination and composer text before navigation
    updateViewCombination("chat");
    // if(!query) return
    setComposerInsertText(`Explain me: ${query}`);

    router.push(`/workspace/${pdfId}`);

    console.log("Navigating to workspace:", {
      pdfId: pdfId,
      sessionId: session.sessionId,
      path: `/workspace/${pdfId}`,
    });
  };

  return (
    <div className="grid sm:grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-7 max-lg:mb-20 lg:gap-x-[30px] gap-y-[30px] p-3 no-scrollbar px-4 md:px-6 lg:px-8 w-full h-auto overflow-y-auto ">
      <AcolyteAICard setOpenFolder={setOpenFFolder} />

      <StudyHistoryCard
        studyHistoryItems={studyHistoryItems}
        expandedSubject={expandedSubject}
        expandedPdf={expandedPdf}
        loading={loading}
        error={error}
        onSubjectClick={handleSubjectClick}
        onPdfClick={handlePdfClick}
        onSessionClick={handleSessionClick}
      />

      {openFolder && (
        <SubjectFolders
          isExpanded={openFolder}
          setIsExpanded={setOpenFFolder}
        />
      )}
    </div>
  );
};

export default Dashboard;
