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



const Dashboard = () => {
    interface Session {
        sessionId: string;
        session_name: string;
    }

    interface Pdf {
        pdfId: string;
        sessionIds: Session[];
    }

    interface StudyHistoryItem {
        icon: React.ElementType;
        name: string;
        time: string;
        color: string;
        img: string;
        subject: string;
        pdfs: Pdf[];
    }

    const [openFolder, setOpenFFolder] = useState(false);
    const [studyHistoryItems, setStudyHistoryItems] = useState<StudyHistoryItem[]>([]);
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
    const [expandedPdf, setExpandedPdf] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter()

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                setLoading(true);
                setError(null);

                // Replace with your actual user ID or get it from your auth context
                const userId = "81839d6a-70a1-7035-6884-9ae5c24d8332"; // You'll need to get this dynamically

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_CHAT_BASE_URL}/dev/v1/chat/session-subject/${userId}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            // Add any auth headers if needed
                            // 'Authorization': `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();


                // Transform the API response data structure into study history items
                const historyItems = Object.keys(data.data).map(
                    (subject, subjectIndex) => {
                        const subjectData = data.data[subject];
                        const totalSessions = subjectData.reduce(
                            (total: number, pdf: Pdf) => total + pdf.sessionIds.length,
                            0
                        );

                        return {
                            icon: [Activity, Heart, Bone, Eye, Zap, Droplets, Camera][
                                subjectIndex % 7
                            ],
                            name: subject,
                            time: `${totalSessions} session${totalSessions > 1 ? "s" : ""}`,
                            color: [
                                "text-green-400",
                                "text-red-400",
                                "text-yellow-400",
                                "text-teal-400",
                                "text-blue-400",
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
                            pdfs: subjectData,
                        };
                    }
                );

                setStudyHistoryItems(historyItems);
            } catch (error) {
                console.error("Error fetching chat history:", error);
                setError(error instanceof Error ? error.message : String(error));

                // Fallback to empty state or show error message
                setStudyHistoryItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchChatHistory();
    }, []);

    const handleSubjectClick = (subject: React.SetStateAction<string | null>) => {
        if (expandedSubject === subject) {
            setExpandedSubject(null);
            setExpandedPdf(null);
        } else {
            setExpandedSubject(subject);
            setExpandedPdf(null);
        }
    };

    const handlePdfClick = (pdfId: React.SetStateAction<string | null>) => {
        if (expandedPdf === pdfId) {
            setExpandedPdf(null);
        } else {
            setExpandedPdf(pdfId);
        }
    };

    interface Session {
        sessionId: string;
        session_name: string;
    }

    interface Pdf {
        pdfId: string;
        sessionIds: Session[];
    }

    const handleSessionClick = (pdf: Pdf, session: Session) => {
        const SESSION_KEY = "chat_session_id";
        const NEW_SESSION_FLAG = "is_new_session";

        localStorage.setItem(SESSION_KEY, session?.sessionId);

        localStorage.setItem(NEW_SESSION_FLAG, "false");
        router.push(`/workspace/${pdf.pdfId}`);
        console.log(`/workspace/${pdf.pdfId}`);

        console.log("Session ID:", pdf?.pdfId, session?.sessionId);
        // Add your session navigation logic here
    };



    return (
        <div className="h-screen px-0 overflow-hidden flex flex-col justify-center w-full">
            <div className="flex-1 overflow-hidden w-full">
                <ScrollArea className="h-full w-full overflow-y-auto px-4 remove-scrollbar pb-20">
                    <div className="sm:grid sm:grid-cols-5 gap-[30px] p-3 w-full">
                        {/* Left Column */}

                        {/* Acolyte AI Card */}
                        <Card className="dark:bg-transparent bg-transparent border-none shadow-none col-span-2">
                            <CardHeader className="space-y-5 px-6 p-0 pb-[15px] w-full">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={"/bigOwl.svg"}
                                        height={30}
                                        width={30}
                                        className="w-5 h-7"
                                        alt={"owl"}
                                    />
                                    <CardTitle className="dark:text-white text-black font-semibold text-[22px] 2xl:text-[23px]">
                                        Acolyte AI
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent
                                className="space-y-4 p-0 bg-[#F3F4F9] dark:bg-[#181A1D] py-[26px] px-[20px] 2xl:py-[28px] 2xl:px-[22px] w-full
                                 dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md rounded-[7px]"
                            >
                                <Button
                                    className="w-full m-0 bg-[#36AF8D] hover:bg-[#32a383] text-[16px] mb-[66px] dark:bg-[#36AF8D]
                                    dark:hover:bg-[#32a383] text-white dark:text-black"
                                    onClick={() => {
                                        setOpenFFolder(true);
                                    }}
                                >
                                    Start new chat
                                </Button>

                                <div>
                                    <h3 className="text-[18px] 2xl:text-[20px] font-medium dark:text-white text-black mb-3 2xl:mb-[14px]">
                                        Choose query type
                                    </h3>
                                    <div className="space-y-3 2xl:space-y-[14px]">
                                        <Button
                                            variant="ghost"
                                            className="flex items-center justify-center gap-2 py-[9px] px-4 rounded font-medium text-[17px]
                                                 dark:hover:bg-[#232529] dark:bg-[#232529] bg-[#F2F2F2] cursor-pointer w-full shadow-md"
                                        >
                                            <div className="flex justify-start items-center gap-6 w-56 overflow-hidden">
                                                <Image
                                                    src={"/newIcons/doctor.svg"}
                                                    height={30}
                                                    width={30}
                                                    className="w-5 h-5"
                                                    alt={"owl"}
                                                />
                                                <span className="text-[17px] 2xl:text-[18px] truncate font-pt-sans">
                                                    Explain a concept
                                                </span>
                                            </div>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            className="flex items-center gap-2 p-2 font-medium text-[17px] py-[9px] px-4 rounded w-full dark:hover:bg-[#232529] dark:bg-[#232529] bg-[#F2F2F2] cursor-pointer shadow-md justify-center"
                                        >
                                            <div className="flex justify-start items-center gap-6 w-56 overflow-hidden">
                                                <Image
                                                    src={"/newIcons/analysis.svg"}
                                                    height={30}
                                                    width={30}
                                                    className="w-5 h-5"
                                                    alt={"owl"}
                                                />
                                                <span className="text-[17px] 2xl:text-[18px] truncate font-pt-sans">
                                                    Clinical application
                                                </span>
                                            </div>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            className="flex items-center gap-2 p-2 rounded font-medium py-[9px] px-4 text-[17px] w-full dark:hover:bg-[#232529] dark:bg-[#232529] bg-[#F2F2F2] cursor-pointer shadow-md justify-center"
                                        >
                                            <div className="flex justify-start items-center gap-6 w-56 overflow-hidden">
                                                <Image
                                                    src={"/newIcons/piechart.svg"}
                                                    height={30}
                                                    width={30}
                                                    className="w-5 h-5"
                                                    alt={"owl"}
                                                />
                                                <span className="text-[17px] 2xl:text-[18px] truncate font-pt-sans">
                                                    Compare and contrast
                                                </span>
                                            </div>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            className="flex items-center gap-2 p-2 font-medium text-[17px] py-[9px] px-4 w-full rounded dark:hover:bg-[#232529] dark:bg-[#232529] bg-[#F2F2F2] cursor-pointer shadow-md justify-center"
                                        >
                                            <div className="flex justify-start items-center gap-6 w-56 overflow-hidden">
                                                <Image
                                                    src={"/newIcons/help.svg"}
                                                    height={30}
                                                    width={30}
                                                    className="w-5 h-5"
                                                    alt={"owl"}
                                                />
                                                <span className="text-[17px] 2xl:text-[18px] truncate font-pt-sans">
                                                    Quiz me on a topic
                                                </span>
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Study History */}
                        <Card className="dark:bg-transparent bg-transparent border-none shadow-none col-span-3 w-full">
                            <CardHeader className="space-y-5 px-6 p-0 pb-[15px] w-full">
                                <CardTitle className="dark:text-white text-black text-[22px] 2xl:text-[23px]">
                                    Study history
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="dark:bg-[#181A1D] w-full bg-[#F3F4F9] rounded-[7px] py-[26px] px-[20px] 2xl:py-[28px] 2xl:px-[48px] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="text-gray-500 dark:text-gray-400">
                                            Loading study history...
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="text-red-500 dark:text-red-400">
                                            Error loading study history: {error}
                                        </div>
                                    </div>
                                ) : studyHistoryItems.length === 0 ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="text-gray-500 dark:text-gray-400">
                                            No study history available
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-[16px]">
                                        {studyHistoryItems.map((item, index) => (
                                            <div key={index}>
                                                {/* Subject Level */}
                                                <div
                                                    className="flex w-full items-center justify-between font-pt-sans rounded cursor-pointer"
                                                    onClick={() => handleSubjectClick(item.subject)}
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
                                                            className={`w-4 h-4 text-gray-400 transition-transform ${expandedSubject === item.subject
                                                                ? "rotate-90"
                                                                : ""
                                                                }`}
                                                        />
                                                    </div>
                                                </div>

                                                {/* PDFs List */}
                                                {expandedSubject === item.subject && (
                                                    <div className="ml-6 mt-2 space-y-2">
                                                        {item.pdfs.map((pdf, pdfIndex) => (
                                                            <div key={pdfIndex}>
                                                                <div
                                                                    className="flex items-center justify-between p-2 bg-gray-100 dark:bg-[#232529] rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-[#2a2d32]"
                                                                    onClick={() => handlePdfClick(pdf.pdfId)}
                                                                >
                                                                    <span className="text-sm dark:text-gray-300 text-gray-600">
                                                                        PDF {pdf.pdfId.split("-")[0]}...
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-400">
                                                                            {pdf.sessionIds.length} session
                                                                            {pdf.sessionIds.length > 1 ? "s" : ""}
                                                                        </span>
                                                                        <ChevronRight
                                                                            className={`w-3 h-3 text-gray-400 transition-transform ${expandedPdf === pdf.pdfId
                                                                                ? "rotate-90"
                                                                                : ""
                                                                                }`}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Sessions List */}
                                                                {expandedPdf === pdf.pdfId && (
                                                                    <div className="ml-4 mt-1 space-y-1">
                                                                        {pdf.sessionIds.map(
                                                                            (session, sessionIndex) => (
                                                                                <div
                                                                                    key={sessionIndex}
                                                                                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#1a1d21] rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-[#232529]"
                                                                                    onClick={() =>
                                                                                        handleSessionClick(pdf, session)
                                                                                    }
                                                                                >
                                                                                    <span className="text-xs dark:text-gray-400 text-gray-500">
                                                                                        {session.session_name}
                                                                                    </span>
                                                                                    <span className="text-xs text-gray-400">
                                                                                        {session.sessionId.split("-")[0]}...
                                                                                    </span>
                                                                                </div>
                                                                            )
                                                                        )}
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
                                )}
                            </CardContent>
                        </Card>

                        {openFolder && (
                            <SubjectFolders
                                isExpanded={openFolder}
                                setIsExpanded={setOpenFFolder}
                            />
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default Dashboard;
