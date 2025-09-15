import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExpandIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import expand from "@/public/expandAchievements.svg"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import React, { useEffect, useState } from 'react';
import Flashcard from './../UI/flashcardFrontUI';
import FlashcardBack from './../UI/flascardBackUI';
import axios from 'axios';
import { GET_FLASHCARD } from '../api/url';
import useUserId from '@/hooks/useUserId';
import { toast } from 'sonner';
interface Props {
    data: {
        "flashcard_id": string,
        "title": string,
        "subject": string,
        "bookmarkedDate": string
    }[]
}



function BookMarkFlashcard() {





    return (
        <Dialog >
            <DialogTrigger>
                <div
                    className="rounded-lg px-5 py-3 xl:py-[10px]
                                                    dark:bg-[#181A1D] bg-[#F3F4F9] w-full
                                                    dark:shadow-[inset_0_0_8px_#B8B8B82B]
                                                    border border-[#B8B8B8] dark:border-none
                                                    shadow-md transition-all duration-300 ease-in-out
                                                    cursor-pointer space-y-[2px] font-pt-sans
                                                    hover:shadow-lg hover:scale-105
                                                    hover:bg-[#E6E8F0] dark:hover:bg-[#1F2125]
                                                    hover:border-[#A0A0A0]"
                    onClick={() => {
                        setFlipped(false);
                        handleGEtFlashCard(card.flashcard_id);
                    }}
                >
                    <div className="flex items-start justify-between">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <h3 className="dark:text-white text-black font-medium truncate text-[15px] xl:text-[17px]">
                                    {card.title}
                                </h3>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{card.title}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex items-end w-full justify-between gap-[1px]">
                        <div className="flex items-start flex-col justify-start">
                            <p className="dark:text-[#9B9B9B] text-black text-[11px] xl:text-sm">
                                {card.subject}
                            </p>
                            <p className="dark:text-[#9B9B9B] text-black text-[11px] xl:text-sm">
                                {
                                    Math.floor((new Date().getTime() - new Date(card.bookmarkedDate).getTime()) / (1000 * 60 * 60 * 24)) === 0
                                        ? "Today"
                                        : Math.floor((new Date().getTime() - new Date(card.bookmarkedDate).getTime()) / (1000 * 60 * 60 * 24)) + " days ago"
                                }
                            </p>
                        </div>
                        <Image
                            src={"/newIcons/bookmark.svg"}
                            height={30}
                            width={30}
                            className="w-6 h-6 xl:w-[18px]"
                            alt={"bookmark"}
                        />
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="[&>button]:hidden h-[357px] max-sm:max-w-[323px] max-w-[688px] bg-transparent dark:bg-transparent
                                            max-sm:min-h-[60px] max-sm:h-[167px] min-h-[20vh] mx-auto p-0 border-none">
                <div
                    className={`relative w-full h-full flex items-center justify-center mx-auto
                                                    transition-transform duration-700 transform-style-preserve-3d ${flipped ? "rotate-y-180" : ""}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Front Side */}
                    <div className="absolute w-full top-0 right-0 left-0 backface-hidden rounded-3xl shadow-xl
                                                    bg-gradient-to-br from-[#E0CCF9] to-[#D1B4F6] dark:from-[#26282C] dark:to-[#181A1D] p-7 max-sm:p-5 border">
                        <Flashcard
                            flipFn={() => setFlipped(true)}
                            handleBookmark={handleBookmark}
                            handleBookmarkDelete={handleBookmarkDelete}
                            bookmark={flashcardsData?.isBookmarked}
                            id={flashcardsData?.flashcard_id}
                            heading={flashcardsData?.title || "Unknown"}
                            readMore={flashcardsData?.text || "unknown"}
                        />
                    </div>

                    {/* Back Side */}
                    <div className="absolute w-full top-0 right-0 left-0 backface-hidden rotate-y-180 rounded-3xl shadow-xl
                                                    bg-gradient-to-br from-[#E0CCF9] to-[#D1B4F6] dark:from-[#26282C] dark:to-[#181A1D] p-7 max-sm:p-5 border">
                        <FlashcardBack
                            flipFn={() => setFlipped(false)}
                            description={flashcardsData?.description || "unknown"}
                            title={flashcardsData?.title || "Unknown"}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}



const BookmarkedCards = ({ data }: Props) => {
    const [flipped, setFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bookmarked, setBookmark] = useState(false);
    const userId = useUserId();

    // ✅ Fix 1: Initialize as empty array instead of undefined
    const [bookmarkdata, setBookmarkData] = useState<{
        bookmarkedDate: string,
        flashcard_id: string,
        subject: string,
        title: string
    }[]>([]);

    const [flashcardsData, setFlashCardData] = useState<{
        "subject": string,
        "isBookmarked": boolean,
        "interval": number,
        "bodySystem": string,
        "reviewCount": number,
        "dueDate": string,
        "difficultyLevel": string,
        "difficulty": number,
        "topics": string,
        "totalReviews": number,
        "lastReviewedAt": string | null,
        "isCorrect": boolean,
        "userId": string,
        "againClicks": number,
        "easeFactor": number,
        "lapsesCount": number,
        "bookName": string,
        "createdAt": string,
        "text": string,
        "flashcard_id": string,
        "correctReviews": number,
        "docId": string,
        "description": string,
        "pageNo": number,
        "title": string
    }>();

    const handleGEtFlashCard = async (id: string) => {
        console.log('Creating new deck...');
        try {
            const response = await axios.get(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + GET_FLASHCARD + `flashcard_id=${id}&userId=${userId}`);
            setFlashCardData(response.data.flashcard);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            console.log(err.message || 'Failed to fetch dashboard data');
        }
    };

    // ✅ Fix 2: Change dependency from bookmarkdata to data
    useEffect(() => {
        if (data) {
            setBookmarkData(data);
        }
    }, [data]); // Only depend on 'data' prop, not bookmarkdata

    const handleBookmark = async (id: string, heading: string) => {
        try {
            const response = await axios.post(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + "/dev/v1/flashcard/bookmark", {
                "flashcard_id": id,
                "userId": userId
            });

            setBookmark(true);

            // ✅ Fix 3: Convert Date to string and add safety check
            setBookmarkData((prev) => {
                if (!Array.isArray(prev)) return [];

                return [...prev, {
                    bookmarkedDate: new Date().toISOString(), // Convert to string
                    flashcard_id: id,
                    subject: heading,
                    title: "Flexural"
                }];
            });

            toast.success("Bookmarked " + heading, {
                position: "bottom-right",
            });
        } catch (error) {
            console.log("error::", error?.message);
        }
    };

    const handleBookmarkDelete = async (id: string, heading: string) => {
        try {
            const response = await axios.patch(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + "/dev/v1/flashcard/bookmark", {
                "flashcard_id": id,
                "userId": userId
            });

            setBookmark(false);

            // ✅ Fix 4: Add safety check for filter
            setBookmarkData((prev) => {
                if (!Array.isArray(prev)) return [];
                return prev.filter(item => item.flashcard_id !== id);
            });

            toast.success("deleted bookmark " + heading, {
                position: "bottom-right",
            });
        } catch (error) {
            console.log("error::", error?.message);
        }
    };


    export default function BookmarkDialog() {


        return (
            <Dialog>
                <DialogTrigger asChild className="p-0  mt-0">
                    <Button variant={"ghost"} size={"icon"} className="bg-[#F3F4F9] m-0 mt-0 dark:bg-[#1C2626] w-[18px] h-[18px]">
                        <Image src={expand} alt={"expand"} width={30}
                            height={30} className=" object-contain h-full w-full dark:contrast-100 contrast-50" />

                    </Button>
                </DialogTrigger>


                <DialogContent className="border-0 bg-transparent dark:bg-transparent text-white mx-auto md:max-w-[885px] max-w-[350px] sm:max-w-[600px]  fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <DialogHeader className="flex items-center justify-between w-full text-[18px] mb-4">
                        <DialogTitle className="font-bold bg-transparent w-full">Achievement</DialogTitle>

                    </DialogHeader>

                    <div className="h-[400px] w-full font-pt-sans dark:bg-[#181A1D] bg-[#F3F4F9] px-[22px] py-[47px] rounded-[9px]">
                        <ScrollArea className="w-full h-full overflow-hidden">

                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }


