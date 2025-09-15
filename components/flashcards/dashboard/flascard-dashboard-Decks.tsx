import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import MyDecksSkeleton from '../../skeletons/skeleton-flashcard/skeleton-decks';
import Image from "next/image"
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { BY_BODY_SYSTEM, BY_BODY_SYSTEM_FLASHCARD, GET_FLASHCARD, SUBJECT_LIST, SUBMIT_REVIEW } from '../api/url';
import axios from 'axios';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { MdClose } from 'react-icons/md';
import useUserId from '@/hooks/useUserId';
import Flashcard from '../UI/flashcardFrontUI';
import FlashcardBack from '../UI/flascardBackUI';
import { CardElementFlashcard } from '../UI/element-flashcard-card';
import { toast } from 'sonner';
import { ChevronLeft, MoveLeft } from 'lucide-react';

// Interface for the request payload
interface FlashcardAgainClickPayload {
    userId: string;
    flashcardId: string;
    timeSpent: number;
}

// Interface for the API response (adjust based on your actual response structure)
interface FlashcardAgainClickResponse {
    success: boolean;
    message?: string;
    data?: any;
}

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


const MyDecks = ({ subjects, handleBookmarkDelete, handleBookmark, handleGEtFlashCard }:
    {
        subjects: { subject: string, count: number }[],
        handleBookmarkDelete: (id: string, heading: string) => boolean,
        handleBookmark: (id: string, heading: string) => boolean,
        handleGEtFlashCard: (id?: string) => flashcardData
    }) => {
    const [loading, setLoading] = useState(false)
    const [deckList, setDeckList] = useState<{ name: string, cards: number, img: string }[]>([])
    const [deckList_bodySystem, setDeckList_bodySystem] = useState<{ name: string, cards: number, img: string }[]>([])
    const [flipped, setFlipped] = useState(false);
    const [FData, setFData] = useState<{ flashcard_id: string, title: string, isBookmarked: boolean }[]>([]);
    const [data, setData] = useState<flashcardData>()
    const [timer, setTimer] = useState(0);
    const [timerRunning, setIsTimerRunning] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    // const [review, setReview] = useState<"hard" | "good" | "easy" | null>(null)
    const [open, setOpen] = useState(false);
    const [Fopen, setFOpen] = useState(false);
    const dialogueRef = useRef<HTMLButtonElement>(null)
    const userId = useUserId()

    useEffect(() => {
        // ✅ Check if subjects exists and has data
        if (subjects && subjects.length > 0) {
            init()
        }
    }, [subjects])

    useEffect(() => { }, [data])

    const subjectIconMap = {
        Anatomy: "/newIcons/human.svg",
        Physiology: "/newIcons/lungs.svg",
        Oncology: "/newIcons/oncology.svg",
        Pathology: "/newIcons/germs.svg",
        Cardiology: "/newIcons/cardio.svg",
        Pediatrics: "/newIcons/pediatrician.svg",
        "Obstetrics & GyG": "/newIcons/obstetrics.svg",
        Orthopedics: "/newIcons/bones.svg",
        Dermatology: "/newIcons/hair.svg",
        "Emergency Medicine": "/newIcons/emergency.svg",
        Psychiatry: "/newIcons/psychiatry.svg",
        Pharmacology: "/newIcons/pills.svg",
        "Micro Biology": "/newIcons/biology.svg",
        Biochemistry: "/newIcons/biochemistry.svg",
        Radiology: "/newIcons/x-ray.svg",

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

    async function init() {
        setLoading(true)

        try {
            const decks = subjects.map(item => ({
                name: item.subject, // ✅ Fixed: should be 'subject', not 'subjects'
                cards: item.count,
                img: subjectIconMap[item.subject],

            }));
            setDeckList(decks)
            const response = await axios.get(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + BY_BODY_SYSTEM + userId);
            console.log("response====>", response)
            const bodySystemDecks = response.data.bodySystemData.map((item) => ({
                name: item.bodySystem,
                cards: item.flashcardCount,
                img: subjectIconMap[item.bodySystem as keyof typeof subjectIconMap] || subjectIconMap['default'],
            }))

            setDeckList_bodySystem(bodySystemDecks)
            setLoading(false)
        } catch (error) {
            console.error('Error transforming subjects:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFlashcardList = async (id: string) => {
        console.log('Creating new deck...');
        try {
            setLoading(true);
            // const response = await axios.get(SUBJECT_LIST + `subject=${id}&userId=${userId}`);
            const response = await axios.get(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + SUBJECT_LIST + `userId=${userId}`);
            const flashCardData = response?.data ? response?.data?.subjectGroups.filter((item) => item.subject === id)[0].flashcards : []
            console.log("response:::", flashCardData)
            setFData(flashCardData)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            console.log(err.message || 'Failed to fetch dashboard data');
            setLoading(false);
        }
    };



    const handleFlashcardListBodySystem = async (id: string) => {
        console.log('Creating new deck...');
        try {
            setLoading(true);
            const response = await axios.get(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + BY_BODY_SYSTEM_FLASHCARD + `${userId}&bodySystem=${id}`);
            console.log("body system", response.data)
            setFData(response.data.flashcards || [])
            setLoading(false)
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            console.log(err.message || 'Failed to fetch dashboard data');
            setLoading(false);
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

    /**
     * API function to handle flashcard "again" click
     * @param payload - The request payload containing userId, flashcardId, and timeSpent
     * @returns Promise with the API response
     */
    const flashcardAgainClick = async (payload: FlashcardAgainClickPayload): Promise<FlashcardAgainClickResponse> => {
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



    // ✅ Handle loading state while waiting for subjects
    if (!subjects || subjects.length === 0) {
        return (
            <MyDecksSkeleton />
        )
    }




    return (
        <>


            <CardElementFlashcard loading={false} backgroundHidden={true} classes={"relative"} title={"My Decks"} >

                {/* Header */}
                <div className="flex items-center flex-col justify-between w-full ">
                    {/* Tabs Component */}
                    <Tabs defaultValue="discipline" className="w-full">
                        <div className='absolute -top-11 right-0 gap-4 max-[442px]:-top-2 max-[442px]:left-0 '>
                            {/* <h1 className="text-[22px] font-[futureHeadlineBold] text-[#184C3D] dark:text-white xl:text-[24px]">My Decks</h1> */}
                            {!Fopen ? (
                                <TabsList className="dark:bg-[#181A1D] bg-[#F3F4F9] p-1 h-auto space-x-2
                                     dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md ">

                                    <TabsTrigger
                                        value="discipline"
                                        className="bg-[#36AF8D] text-white hover:bg-[#2D8F73] dark:bg-[#36AF8D] dark:text-black dark:hover:bg-[#2D8F73] xl:text-[14px]
                                         py-[5px] px-4 xl:py-[6px] xl:px-[18px] data-[state=active]:bg-[#36AF8D] data-[state=active]:text-white dark:data-[state=active]:bg-[#36AF8D] dark:data-[state=active]:text-black
                                          rounded-[5px] text-sm font-causten-semibold text-[14px] data-[state=inactive]:bg-transparent data-[state=inactive]:text-black dark:data-[state=inactive]:bg-transparent dark:data-[state=inactive]:text-white"
                                    >
                                        By Discipline
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="body-system"
                                        className="bg-[#36AF8D] text-black hover:bg-[#2D8F73] dark:bg-[#36AF8D] dark:text-black dark:hover:bg-[#2D8F73] xl:text-[14px]
                                         py-[5px] px-4 xl:py-[6px] xl:px-[18px] data-[state=active]:bg-[#36AF8D] data-[state=active]:text-white dark:data-[state=active]:bg-[#36AF8D] dark:data-[state=active]:text-black
                                          rounded-[5px] text-sm font-causten-semibold font-[14px] data-[state=inactive]:bg-transparent data-[state=inactive]:text-black dark:data-[state=inactive]:bg-transparent dark:data-[state=inactive]:text-white"
                                    >
                                        By Body System
                                    </TabsTrigger>
                                </TabsList>
                            ) : <ChevronLeft size={30} onClick={() => setFOpen(false)} className='cursor-pointer h-5 w-5' />}
                        </div>
                        <TabsContent value="discipline" className="mt-4 max-[442px]:mt-12">
                            <div className='w-full max-sm:h-[365px] sm:h-[425px] xl:h-[400px] overflow-y-auto no-scrollbar  overflow-hidden'>
                                {/* Decks Grid */}
                                <div className="grid grid-cols-2 max-[442px]:grid-cols-1 gap-x-[33px] gap-y-[25px] w-full">
                                    {!Fopen &&
                                        <>  {deckList.map((deck, index) => (
                                            <Card
                                                key={index}

                                                onClick={() => {
                                                    // setFlashCardGenerate(true)
                                                    setFOpen(true)
                                                    handleFlashcardList(deck.name)
                                                }}
                                                className={`dark:hover:border-[#36AF8D] hover:border-[#36AF8D] px-5 py-[21px] xl:py-[18px] xl:px-[36px] dark:shadow-[inset_0_0_8px_#B8B8B82B]
                                                     border border-[#B8B8B8] shadow-md dark:bg-[#181A1D] bg-[#F3F4F9] transition-colors  ${deck.cards === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"} `}
                                            >
                                                <CardHeader className="p-0 space-y-7 space-x-[22px]">
                                                    <div className="flex items-center justify-between font-causten-semibold">
                                                        <div className='gap-2 justify-start items-start flex flex-col w-full'>

                                                            <Tooltip >
                                                                <TooltipTrigger asChild className='p-0'>
                                                                    <h3 className="dark:text-white text-black font-semibold truncate max-sm:text-sm tracking-wider
                                                                     text-xl xl:text-[23px] w-4/6 text-start text-nowrap">
                                                                        {deck.name}
                                                                    </h3>

                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p> {deck.name}</p>
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <p className="dark:text-[#C6C6C6] text-black max-sm:text-xs text-[15px] xl:text-[17px]">
                                                                {deck.cards} cards
                                                            </p>
                                                        </div>
                                                        <div className="  flex items-center justify-center">
                                                            <Image
                                                                src={deck.img}
                                                                width={15}
                                                                height={15}
                                                                alt="Flashcard icon"
                                                                className="w-9 h-9 xl:h-[51px] object-contain max-sm:w-5 max-sm:h-5 "
                                                            />
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                            </Card>
                                        ))}
                                        </>
                                    }
                                    {Fopen &&
                                        <div className='h-full  col-span-full space-y-7'>
                                            {FData.length === 0 ? (

                                                <div className="flex items-center justify-center p-8 h-[32vh] max-sm:h-[20vh]">
                                                    <div className="flex flex-col items-center space-y-3">
                                                        <div className={`w-6 h-6 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary`} />

                                                        <p className="text-sm text-muted-foreground">Loading content...</p>
                                                    </div>
                                                </div>

                                            ) : FData.map((item: { flashcard_id: string, title: string, isBookmarked: boolean }, index: number) => (
                                                <Dialog key={index}>
                                                    <DialogTrigger className='w-full' >
                                                        <div className="w-full shadow dark:border-none
                 rounded-[27.209px] border-[1.701px] border-[#C5C5C5] bg-[#F3F4F9] dark:bg-[#181A1D]
                 px-7 py-3 max-sm:px-5 max-sm:py-3 hover:scale-105 transition-transform duration-200 ease-in-out"
                                                            onClick={() => {
                                                                setOpen(true)
                                                                setFlipped(false)
                                                            }}
                                                        >
                                                            {/* <Flashcard
                                                                id={item.flashcard_id}
                                                                bookmark={item?.isBookmarked}
                                                                // handleBookmark={handleBookmark}
                                                                // handleBookmarkDelete={handleBookmarkDelete}
                                                                heading={item?.title || "Un Known"}
                                                                readMore={data?.description || "un Known"}
                                                                handleGEtFlashCard={async () => {
                                                                    setLoading(true)
                                                                    startTimer()
                                                                    const res = await handleGEtFlashCard(item?.flashcard_id || undefined)

                                                                    if (res) {
                                                                        setData(res)

                                                                    } else {
                                                                        setData({})
                                                                        stopTimer()
                                                                    }

                                                                    setLoading(false)
                                                                }}
                                                            /> */}


                                                            <div className="  w-full  flex items-center cursor-pointer rounded-md gap-5

                                                                                                     mb-2 px-[26px] py-[20px] max-sm:px-5 max-sm:py-3  "
                                                                onClick={async () => {
                                                                    setLoading(true)
                                                                    startTimer()
                                                                    const res = await handleGEtFlashCard(item?.flashcard_id || undefined)

                                                                    if (res) {
                                                                        setData(res)

                                                                    } else {
                                                                        setData({})
                                                                        stopTimer()
                                                                    }

                                                                    setLoading(false)
                                                                }}
                                                            >


                                                                <Image
                                                                    src={"/newIcons/flashCards.svg"}
                                                                    alt={item?.title || "Flashcard Image"}
                                                                    height={50}
                                                                    width={50}
                                                                />
                                                                <p className='text-[20px] font-causten-semibold tracking-wide font-thin  uppercase text-left'>{item?.title ?? ""}</p>
                                                            </div>
                                                        </div>
                                                    </DialogTrigger>

                                                    <DialogContent
                                                        className=" [&>button]:hidden h-[357px] max-sm:max-w-[323px] shadow-none max-w-[688px] bg-transparent dark:bg-transparent
                                                            max-sm:min-h-[60px] max-sm:h-[167px] min-h-[20vh] mx-auto  p-0 border-none"
                                                        onInteractOutside={(e) => {
                                                            e.preventDefault() // Prevent closing on outside click
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
                                                            <div className="absolute  w-full top-0 right-0 left-0 backface-hidden   rounded-[27.209px] border-[1.701px]    shadow-xl
                                         from-[#B6B6B6] to-[#F3F4F9] dark:from-[#26282C] dark:to-[#181A1D] p-7 max-sm:p-5 dark:border-none  border-[#C5C5C5] bg-gradient-to-b

                                        ">


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
                                                                            const res = handleBookmark(item.flashcard_id, item?.title || "Un Known")
                                                                            if (res) {
                                                                                setFData((prev) =>
                                                                                    prev.map((items) =>
                                                                                        items.flashcard_id === item.flashcard_id
                                                                                            ? { ...items, isBookmarked: true }
                                                                                            : items
                                                                                    )
                                                                                );
                                                                            }



                                                                        }}
                                                                        handleBookmarkDelete={() => {
                                                                            const res = handleBookmarkDelete(item?.flashcard_id, item?.title || "Un Known")
                                                                            if (res) {
                                                                                setFData((prev) =>
                                                                                    prev.map((item) =>
                                                                                        item.flashcard_id === item.flashcard_id
                                                                                            ? { ...item, isBookmarked: false }
                                                                                            : item
                                                                                    )
                                                                                );
                                                                            }

                                                                        }}
                                                                        id={item?.flashcard_id}
                                                                        heading={item?.title || "Un Known"}
                                                                        readMore={data?.text || "un Known"}
                                                                    />
                                                                )}
                                                            </div>

                                                            {/* Back Side */}
                                                            <div className="absolute w-full  top-0 right-0 left-0 backface-hidden rotate-y-180  shadow-xl  rounded-[27.209px] border-[1.701px]
                                        border-[#C5C5C5] bg-gradient-to-b dark:border-none  from-[#B6B6B6] to-[#F3F4F9] dark:from-[#26282C] dark:to-[#181A1D] p-7 max-sm:p-5  ">

                                                                <FlashcardBack
                                                                    flipFn={() => {
                                                                        setFlipped(false)

                                                                        flashcardAgainClick({ userId: userId, flashcardId: data?.flashcard_id, timeSpent: timer })
                                                                    }

                                                                    }
                                                                    description={data?.description || "un Known"}
                                                                    title={data?.title || "Un Known"}
                                                                    // id={data?.flashcard_id}
                                                                    review={(val: "Good" | "Hard" | "Easy" | null) => {



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


                                            )
                                            )}
                                        </div>


                                    }
                                </div>
                            </div>

                        </TabsContent>

                        <TabsContent value="body-system" className="mt-4 max-[442px]:mt-12">
                            {/* Decks Grid for Body System */}
                            <div className='w-full  max-sm:h-[365px] sm:h-[425px] xl:h-[400px] overflow-y-auto no-scrollbar  overflow-hidden'>
                                {/* Decks Grid */}
                                <div className="grid grid-cols-2 max-[442px]:grid-cols-1 gap-x-[33px] gap-y-[25px] w-full">
                                    {!Fopen &&
                                        <>  {deckList_bodySystem.map((deck, index) => (
                                            <Card
                                                key={index}
                                                onClick={() => {
                                                    // setFlashCardGenerate(true)
                                                    setFOpen(true)
                                                    handleFlashcardListBodySystem(deck.name)
                                                }}
                                                className={`dark:hover:border-[#36AF8D] hover:border-[#36AF8D] px-5 py-[21px] xl:py-[18px] xl:px-[36px] dark:shadow-[inset_0_0_8px_#B8B8B82B]  border border-[#B8B8B8] shadow-md dark:bg-[#181A1D] bg-[#F3F4F9] transition-colors cursor-pointer   ${deck.cards === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"} `}
                                            >
                                                <CardHeader className="p-0 space-y-7 space-x-[22px]">
                                                    <div className="flex items-center justify-between font-causten-semibold">
                                                        <div className='gap-2 justify-start items-start flex flex-col w-full'>

                                                            <Tooltip >
                                                                <TooltipTrigger asChild className='p-0'>
                                                                    <h3 className="dark:text-white text-black font-semibold tracking-wider truncate max-sm:text-sm text-xl xl:text-[23px] w-4/6 text-start text-nowrap">
                                                                        {deck.name}
                                                                    </h3>

                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p> {deck.name}</p>
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <p className="dark:text-[#C6C6C6] text-black max-sm:text-xs text-[15px] xl:text-[17px]">
                                                                {deck.cards} cards
                                                            </p>
                                                        </div>
                                                        <div className="  flex items-center justify-center">
                                                            <Image
                                                                src={"/newIcons/flashCards.svg"}
                                                                width={15}
                                                                height={15}
                                                                alt="Flashcard icon"
                                                                className="w-9 h-9 xl:h-[51px] object-contain max-sm:w-5 max-sm:h-5 "
                                                            />
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                            </Card>
                                        ))}
                                        </>
                                    }
                                    {Fopen &&
                                        <div className='h-full  col-span-full space-y-4'>
                                            {FData.length === 0 ? (

                                                <div className="flex items-center justify-center p-8 h-[32vh] max-sm:h-[20vh]">
                                                    <div className="flex flex-col items-center space-y-3">
                                                        <div className={`w-6 h-6 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary`} />

                                                        <p className="text-sm text-muted-foreground">Loading content...</p>
                                                    </div>
                                                </div>

                                            ) : FData.map((item: { flashcard_id: string, title: string, isBookmarked: boolean }, index: number) => (
                                                <Dialog key={index}>
                                                    <DialogTrigger className='w-full' >
                                                        <div className="w-full shadow dark:border-none 
                 rounded-[27.209px] border-[1.701px] border-[#C5C5C5] bg-[#F3F4F9] dark:bg-[#181A1D]
                 px-7 py-3 max-sm:px-5 max-sm:py-3 hover:scale-105 transition-transform duration-200 ease-in-out"
                                                            onClick={() => {
                                                                setOpen(true)
                                                                setFlipped(false)
                                                            }}
                                                        >
                                                            {/* <Flashcard
                                                                bookmark={item?.isBookmarked}
                                                                heading={item?.title || "Un Known"}
                                                                readMore={data?.description || "un Known"}
                                                                // handleBookmark={handleBookmark}
                                                                // handleBookmarkDelete={handleBookmarkDelete}
                                                                id={item?.flashcard_id}
                                                                handleGEtFlashCard={async () => {
                                                                    setLoading(true)
                                                                    startTimer()
                                                                    const res = await handleGEtFlashCard(item?.flashcard_id || undefined)

                                                                    if (res) {
                                                                        setData(res)

                                                                    } else {
                                                                        setData({})
                                                                        stopTimer()
                                                                    }

                                                                    setLoading(false)
                                                                }}
                                                            /> */}

                                                            <div className="  w-full  flex items-center cursor-pointer rounded-md gap-5

                                                                                                     mb-2 px-[26px] py-[20px] max-sm:px-5 max-sm:py-3  "
                                                                onClick={async () => {
                                                                    setLoading(true)
                                                                    startTimer()
                                                                    const res = await handleGEtFlashCard(item?.flashcard_id || undefined)

                                                                    if (res) {
                                                                        setData(res)

                                                                    } else {
                                                                        setData({})
                                                                        stopTimer()
                                                                    }

                                                                    setLoading(false)
                                                                }}
                                                            >


                                                                <Image
                                                                    src={"/newIcons/flashCards.svg"}
                                                                    alt={item?.title || "Flashcard Image"}
                                                                    height={50}
                                                                    width={50}
                                                                />
                                                                <p className='text-[20px]  font-causten-semibold tracking-wide font-thin uppercase text-left'>{item?.title ?? ""}</p>
                                                            </div>
                                                        </div>
                                                    </DialogTrigger>

                                                    <DialogContent
                                                        className=" [&>button]:hidden h-[357px] dark:border-none max-sm:max-w-[323px] shadow-none max-w-[688px] bg-transparent dark:bg-transparent
                                                            max-sm:min-h-[60px] max-sm:h-[167px] min-h-[20vh] mx-auto  p-0 border-none"
                                                        onInteractOutside={(e) => {
                                                            e.preventDefault() // Prevent closing on outside click
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
                                                                            const res = handleBookmark(item.flashcard_id, item?.title || "Un Known")
                                                                            if (res) {

                                                                                setFData((prev) =>
                                                                                    prev.map((items) =>
                                                                                        items.flashcard_id === item.flashcard_id
                                                                                            ? { ...items, isBookmarked: true }
                                                                                            : items
                                                                                    )
                                                                                );

                                                                            }

                                                                        }}
                                                                        handleBookmarkDelete={() => {
                                                                            const res = handleBookmarkDelete(item?.flashcard_id, item?.title || "Un Known")

                                                                            if (res) {
                                                                                setFData((prev) =>
                                                                                    prev.map((items) =>
                                                                                        items.flashcard_id === item?.flashcard_id
                                                                                            ? { ...items, isBookmarked: false }
                                                                                            : items
                                                                                    )
                                                                                );
                                                                            }

                                                                        }}
                                                                        id={item?.flashcard_id}
                                                                        heading={item?.title || "Un Known"}
                                                                        readMore={data?.description || "un Known"}
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
                                                                    description={data?.text || "un Known"}
                                                                    title={data?.title || "Un Known"}

                                                                    review={(val: "Good" | "Hard" | "Easy" | null) => {



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


                                            )
                                            )}
                                        </div>


                                    }
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>


                </div>
            </CardElementFlashcard>

        </>
    );
};

export default MyDecks;