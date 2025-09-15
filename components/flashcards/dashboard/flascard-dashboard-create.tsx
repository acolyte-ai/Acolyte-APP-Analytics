"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import flashCard from "@/public/newIcons/flashCards.svg"
import CreateFlashcardSkeleton from '../../skeletons/skeleton-flashcard/skeleton-create';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog"

import axios from 'axios';
import { CREATE_FLASHCARD, DUE_CARDS, SUBMIT_REVIEW } from '../api/url';
import SubjectFolders from '@/components/chat/SubjectFolders';

import { ScrollArea } from '@/components/ui/scroll-area';
import useUserId from '@/hooks/useUserId';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import dna from "@/public/dna.svg"
import { ChevronRight } from 'lucide-react';
import { CardElementFlashcard } from '../UI/element-flashcard-card';
import FlashcardDeckDialoguebox from '../dialogueBox/dialoguebox-createDeck';
import { useSettings } from '@/context/store';
import { getDocName } from '@/lib/utils';
import Flashcard from '../UI/flashcardFrontUI';
import FlashcardBack from '../UI/flascardBackUI';
import { toast } from 'sonner';

interface flashcardData {
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
}

const FlashcardInterface = ({ count, estimatedTime, percentage,
    handleBookmarkDelete, handleBookmark, handleGEtFlashCard
}: {
    count: number, estimatedTime: number, percentage: number,
    handleBookmarkDelete: (id: string, heading: string) => boolean,
    handleBookmark: (id: string, heading: string) => boolean,
    handleGEtFlashCard: (id?: string) => flashcardData
}) => {
    const [progress, setProgress] = useState(65);
    const [loading, setLoading] = useState(false)
    const [openFolder, setOpenFFolder] = useState(false);
    const [openDueFlashCard, setOpenDueFlashCard] = useState(false)
    const [choosenSubject, setchoosenSubject] = useState<string>("")
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [flashcardDiagOpen, setFlashcardDiagOpen] = useState(false)
    const [FData, setFData] = useState<{ flashcard_id: string, title: string, isBookmarked: boolean }[]>([]);
    const [flipped, setFlipped] = useState(false);
    const [open, setOpen] = useState(false);
    const [Fopen, setFOpen] = useState(false);
    const dialogueRef = useRef<HTMLButtonElement>(null)
    const [timer, setTimer] = useState(0);
    const [timerRunning, setIsTimerRunning] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const userId = useUserId()
    const { fileSystem } = useSettings()
    const [duecards, setDuecards] = useState<{
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
    }[]>([])

    const [data, setData] = useState<{
        "userId": string,
        "docId": string,
        "pageNo": number,
        "title": string,
        "text": string,
        "description": string
    }>()
    const { flashcardWord } = useSettings()
    const handleViewCards = async () => {
        console.log('Creating new deck...');
        try {
            // setLoading(true);
            const response = await axios.get(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + DUE_CARDS + userId);
            setDuecards(response.data.dueFlashcards)
            // setDueFlashcards(subjectStats)
            setIsDialogOpen(true);
            // setLoading(false)
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            console.log(err.message || 'Failed to fetch dashboard data');
            setLoading(false);
        }
    };


    useEffect(() => {
        if (userId) {
            setLoading(true)
            init()
        }

    }, [userId])

    function init() {
        setProgress(70)
        setLoading(false)
    }

    const startTimer = () => {
        setTimer(0);
        setIsTimerRunning(true);
        timerRef.current = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000); // Update every second
    };

    const stopTimer = () => {
        setIsTimerRunning(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => {
        if (flashcardWord) {
            setFlashcardDiagOpen(true)
        }

    }, [flashcardWord])


    const flashcardAgainClick = async (payload) => {
        // Base URL for the API
        console.log("again ", payload)
        const API_BASE_URL = process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + '/dev/v1';
        try {
            const response = await axios.post(
                `${API_BASE_URL}/flashcard/again-click`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',

                    },

                }
            );
            toast.info("you have clicked again!")
            return response.data

        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Handle Axios-specific errors
                console.error('API Error:', error.response?.data || error.message);
                toast.error("Please try again!")
                // throw new Error(error.response?.data?.message || 'Failed to process flashcard again click');
            } else {
                // Handle unexpected errors
                console.error('Unexpected Error:', error);
                toast.error("Please try again!")
                // throw new Error('An unexpected error occurred');
            }
        }
    };

    const handleSubmitFlashCard = async (id: string, val: "Good" | "Hard" | "Easy" | null) => {
        try {
            setLoading(true);

            await axios.post(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + SUBMIT_REVIEW, {
                "flashcard_id": id,
                "quality": val,
                "timeSpent": timer,
                "userId": userId
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            toast.success("your review has been successfully submitted", {
                position: "bottom-right",
            })
            setLoading(false)
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            console.log(err.message || 'Failed to fetch dashboard data');
            toast.error("please try again your review was not saved!")
            setLoading(false);
        }
    };


    return (
        <>
            {loading && <CreateFlashcardSkeleton />}
            <div className='mx-auto space-y-[30px]'>
                <CardElementFlashcard loading={false} backgroundHidden={false} classes={"h-full mt-8"} title={"Create Flashcard"} >

                    <div className="space-y-9 xl:space-y-[33px] py-[33px] sm:py-[48px]  xl:p-[40px] xl:py-[48px] flex justify-center items-center flex-col
                         rounded-[7px]  px-5  w-full ">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 xl:w-[85px] xl:h-[85px]  rounded-lg flex items-center justify-center">
                                <Image
                                    src={flashCard}
                                    alt="Flashcard icon"
                                    className="w-full h-full rounded object-cover dark:grayscale grayscale-none"
                                    height={50}
                                    width={50}
                                />
                            </div>
                        </div>


                        <Dialog open={flashcardDiagOpen} onOpenChange={setFlashcardDiagOpen}>
                            <DialogTrigger>
                                <Button
                                    // onClick={handleCreateDeck}
                                    // onClick={() => { setOpenFFolder(true) }}
                                    className="min-w-44  font-causten-bold px-[22px] xl:px-[24px]  bg-[#36AF8D] dark:bg-[#36AF8D] hover:bg-emerald-700 hover:dark:bg-emerald-700
                                             text-white dark:text-zinc-900 dark:hover:text-emerald-50 text-[18px] tracking-wide"
                                >
                                    Create New Flashcard
                                </Button></DialogTrigger>
                            <DialogContent className='w-full h-[50vh] max-w-2xl  [&>button]:hidden flex flex-col items-center justify-center bg-transparent
                            dark:bg-transparent border-none shadow-none'>
                                <FlashcardDeckDialoguebox />
                            </DialogContent>
                        </Dialog>



                    </div>
                </CardElementFlashcard>

                {/* Cards Due Today Section */}
                <CardElementFlashcard loading={false} backgroundHidden={false} classes={""} title={""} >
                    <div className=" py-8 px-5 xl:py-[10px] xl:px-[33px] rounded-[7px]">
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={handleViewCards}
                        >
                            <div className="flex items-center flex-col gap-[13px] w-full font-causten-semibold">
                                <div className='flex justify-between w-full'>
                                    <h3 className="font-medium capitalize tracking-wide text-xl" >Cards Due Today</h3>

                                    <div className="text-[#36AF8D] flex items-center text-xl font-bold">
                                        {count}
                                        <ChevronRight className="text-gray-500 w-5 h-5" />
                                    </div>
                                </div>

                                <div className="relative w-full h-2 dark:bg-[#3D4249] bg-[#B9B9B9] rounded overflow-hidden">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-[#36AF8D] transition-all duration-300"
                                        style={{ width: percentage === 0 ? 0 : (Math.ceil(((percentage - count) / percentage) * 100)) }}
                                    ></div>
                                </div>

                                <div className="flex items-center justify-between w-full font-medium text-lg xl:text-xl">
                                    <span className="text-[#989898]">Estimated time</span>
                                    <span className="text-[#36AF8D] ">{estimatedTime} mins</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </CardElementFlashcard>




                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-4xl h-[80vh] overflow-hidden bg-transparent dark:bg-transparent border-none dark:border-none shadow-none">
                        <DialogHeader className='text-[22px] font-medium text-[#228367] capitalize tracking-wide dark:text-white font-causten-semibold'>Cards due today</DialogHeader>
                        <ScrollArea className='h-full w-full'>

                            <div className="grid grid-cols-2 max-md:grid-cols-1 w-full  gap-10 mt-6">
                                {duecards.map((data, index) => (


                                    <Dialog key={index}>
                                        <DialogTrigger className='w-full' >
                                            <div className="w-full shadow dark:border-none hover:shadow-amber-400 dark:hover:shadow-amber-400
                                         rounded-[27.209px]
                                      "
                                                onClick={() => {
                                                    setOpen(true)
                                                    setFlipped(false)
                                                }}
                                            >

                                                <Card key={index} className="w-full  rounded-[27.209px] border-[1.701px] border-[#C5C5C5]   shadow-xl relative  font-pt-sans overflow-hidden h-[382px] max-md:h-[250px]
                                        bg-gradient-to-b from-[#B6B6B6]  to-[#F3F4F9] dark:from-[#26282C] dark:to-[#181A1D] p-8 transition-all duration-300">


                                                    <CardContent className="flex flex-col p-0 h-full justify-between w-full "
                                                        onClick={async () => {
                                                            setLoading(true)
                                                            startTimer()
                                                            const res = await handleGEtFlashCard(data?.flashcard_id || undefined)

                                                            if (res) {
                                                                setData(res)

                                                            } else {
                                                                setData({})
                                                                stopTimer()
                                                            }

                                                            setLoading(false)
                                                        }}
                                                    >

                                                        <div className=" w-full flex flex-col items-start justify-start mb-2">

                                                            <div className="dark:text-white text-[#515151] bg-[#F3F4F9] bg-gradient-to-t dark:from-[#26282C] dark:to-[#181A1D] border dark:border-[#191B21] border-[#B8B8B8]
                                                                              text-lg max-sm:text-[10px] max-sm:text-sm font-medium px-4 py-2 max-sm:py-[3px] max-sm:px-[7px] rounded-full shadow-md ">
                                                                Subject : {data.subject}
                                                            </div>

                                                        </div>
                                                        <ScrollArea className='h-[7rem] w-full overflow-hidden'>
                                                            <p className='dark:text-white text-start text-black font-bold text-[24.505px] leading-[29.538px] font-causten-semibold tracking-wide text-wrap'>{data.title}</p>
                                                        </ScrollArea>
                                                        {/* Main content */}
                                                        <div className="gap-y-2 flex flex-col items-start justify-start ">
                                                            <p className="text-[#36AF8D] text-start font-medium text-[19.31px] font-pt-sans">{data.bodySystem}</p>
                                                            <p className="text-[#6D7688] text-start font-pt-sans font-medium text-[19.31px] ">Pdf : {getDocName(data.bookName, fileSystem)}</p>
                                                            <p className="text-[#6D7688] text-start font-pt-sans font-medium text-[19.31px] ">Due : {new Date(data.dueDate).toDateString()}</p>
                                                        </div>

                                                        <div className=" absolute -right-10 -top-14 max-sm:-right-5 max-sm:-top-7  ">
                                                            <Image
                                                                src={dna}
                                                                alt="dna"
                                                                height={30}
                                                                width={30}
                                                                className="h-72 w-72 max-sm:h-40 max-sm:w-40  darK:opacity-0 opacity-30"
                                                            />
                                                        </div>

                                                    </CardContent>
                                                </Card>
                                            </div>

                                        </DialogTrigger>

                                        <DialogContent
                                            className=" [&>button]:hidden h-[357px] dark:border-none max-sm:max-w-[323px] shadow-none max-w-[688px] bg-transparent dark:bg-transparent
                                                            max-sm:min-h-[60px] max-sm:h-[167px] min-h-[20vh] mx-auto  p-0 border-none"
                                            onInteractOutside={(e) => {
                                                e.preventDefault()
                                            }}
                                        >
                                            <DialogClose asChild>
                                                <button ref={dialogueRef} className="hidden">Close</button>
                                            </DialogClose>
                                            <div
                                                className={`relative w-full h-full flex items-center justify-center mx-auto
                                            transition-transform duration-700 transform-style-preserve-3d ${flipped ? "rotate-y-180" : ""
                                                    }`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="absolute  w-full top-0 right-0 left-0 backface-hidden  rounded-3xl
                                        bg-gradient-to-br from-[#E0CCF9] to-[#D1B4F6] dark:from-[#26282C] dark:to-[#181A1D] p-7 max-sm:p-5 border">
                                                    {!data ? (
                                                        <div className="flex items-center justify-center p-8 h-[31vh] max-sm:h-[20vh]">
                                                            <div className="flex flex-col items-center space-y-3">
                                                                <div className={`w-6 h-6 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary`} />

                                                                <p className="text-sm text-muted-foreground">Loading content...</p>
                                                            </div>
                                                        </div>
                                                    ) : (

                                                        <Flashcard
                                                            flipFn={() => {
                                                                setFlipped(true)
                                                                stopTimer()
                                                            }}

                                                            bookmark={data?.isBookmarked}
                                                            handleBookmark={() => {
                                                                const res = handleBookmark(data.flashcard_id, data?.title || "Un Known")
                                                                if (res) {
                                                                    setFData((prev) =>
                                                                        prev.map((items) =>
                                                                            items.flashcard_id === data.flashcard_id
                                                                                ? { ...items, isBookmarked: true }
                                                                                : items
                                                                        )
                                                                    );
                                                                }
                                                            }}
                                                            handleBookmarkDelete={() => {
                                                                const res = handleBookmarkDelete(data?.flashcard_id, data?.title || "Un Known")
                                                                if (res) {
                                                                    setFData((prev) =>
                                                                        prev.map((items) =>
                                                                            items.flashcard_id === data?.flashcard_id
                                                                                ? { ...items, isBookmarked: false }
                                                                                : items
                                                                        )
                                                                    );
                                                                }
                                                            }}
                                                            id={data?.flashcard_id}
                                                            heading={data?.title || "Un Known"}
                                                            readMore={data?.text || "un Known"}
                                                        />
                                                    )}
                                                </div>

                                                {/* Back Side */}
                                                <div className="absolute w-full dark:border-none  top-0 right-0 left-0 backface-hidden rotate-y-180 rounded-3xl shadow-xl
                                        bg-gradient-to-br from-[#E0CCF9] to-[#D1B4F6] dark:from-[#26282C] dark:to-[#181A1D]   p-7 max-sm:p-5 border ">
                                                    <FlashcardBack
                                                        flipFn={() => {
                                                            setFlipped(false)
                                                            startTimer()
                                                            flashcardAgainClick({ userId: userId, flashcardId: data?.flashcard_id, timeSpent: timer })
                                                        }
                                                        }

                                                        description={data?.description || "un Known"}
                                                        title={data?.title || "Un Known"}
                                                        review={(val: "Good" | "Hard" | "Easy" | null) => {

                                                            console.log("review clicked!!!::", val)

                                                            if (dialogueRef.current) {
                                                                dialogueRef.current.click() // This will close the dialog
                                                            } else {
                                                                console.error("Close button ref not attached!")
                                                            }
                                                            handleSubmitFlashCard(data?.flashcard_id || '', val)
                                                            setOpen(false)
                                                        }}

                                                    />
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                ))}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>

            </div>

            {
                openFolder && <SubjectFolders
                    isExpanded={openFolder}
                    setIsExpanded={setOpenFFolder}
                />
            }


        </>

    );
};


export default FlashcardInterface;