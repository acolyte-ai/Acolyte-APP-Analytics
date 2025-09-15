
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    MoveLeft,
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { CardElementFlashcard } from '../UI/element-flashcard-card';
import axios from 'axios';
import useUserId from '@/hooks/useUserId';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Flashcard from '../UI/flashcardFrontUI';
import FlashcardBack from '../UI/flascardBackUI';
import { GET_FLASHCARD, SUBMIT_REVIEW } from '../api/url';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { IconDatabaseOff } from '@tabler/icons-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getTimeAgoSimple } from '@/lib/utils';
import { object } from 'zod';

export default function RecentCard({ recent }: { recent: { subject: string, lastSeen: string, userId: string }[] }) {
    const [loading, setLoading] = useState<boolean>(false)
    const [recentList, setRecentList] = useState<{ name: string, time: string, img: string }[]>([])
    const [FData, setFData] = useState<{ flashcard_id: string, title: string }[]>([]);
    const [fOpen, setFOpen] = useState<boolean>(false)
    const [flipped, setFlipped] = useState(false);
    const dialogueRef = useRef<HTMLButtonElement>(null)
    const [data, setData] = useState<{
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
    }>()
    const userId = useUserId()
    const [timer, setTimer] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [open, setOpen] = useState(false);
    const [timerRunning, setIsTimerRunning] = useState(false)

    // const subjectIconMap = {
    //     'Physiology': '/newIcons/lungs.svg',
    //     'Pathology': '/newIcons/germs.svg',
    //     'Anatomy': '/newIcons/human.svg',
    //     'Biology': '/newIcons/biology.svg',
    //     'Pharmacology': '/newIcons/pills.svg',
    //     'Pediatrics': "/newIcons/pediatrician.svg",
    //     'Obstetrics': "/newIcons/oncology.svg",
    //     'Orthopedic': '/newIcons/bones.svg',
    //     'Oncology': '/newIcons/germs.svg',
    //     'Radiology': '/newIcons/x-ray.svg',
    //     'Dermatology': '/newIcons/hair.svg',
    //     'default': '/newIcons/kidney.svg'
    // }


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

    useEffect(() => {
        // ✅ Check if subjects exists and has data
        if (recent && recent.length > 0 && userId) {
            init()
        }
    }, [recent, userId]) // ✅ Add subjects as dependency



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

    function init() {
        setLoading(true)

        try {
            const recents = [
                // First add the real recent subjects
                ...recent.map(item => ({
                    name: item.subject,
                    time: item.lastSeen,
                    img: subjectIconMap[item.subject as keyof typeof subjectIconMap]
                })),

                // Then add the rest of the subjects not in recentSubjects
                ...Object.entries(subjectIconMap)
                    .filter(([subject]) => !recent.some(r => r.subject === subject))
                    .map(([subject, icon]) => ({
                        name: subject,
                        time: null, // or new Date().toISOString() if needed
                        img: icon
                    }))
            ];

            setRecentList(recents)
            setLoading(false)
        } catch (error) {
            console.error('Error transforming subjects:', error)
        } finally {
            setLoading(false)
        }
    }

    const SimpleEmptyState = () => {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center h-[344px] ">
                <Clock className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-base font-medium dark:text-white text-black mb-2">
                    No Recent Activity
                </h3>
                <p className="text-sm dark:text-gray-400 text-gray-600">
                    Your recent activities will appear here
                </p>
            </div>
        );
    };

    const SimpleFlashcardEmpty = () => {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center h-[344px] relative">
                <Button variant={"ghost"} className='absolute top-2 left-0' onClick={() => {
                    init()
                    setFOpen(false)
                }}><MoveLeft size={16} className='scale-150' /></Button>
                <IconDatabaseOff className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-base font-medium dark:text-white text-black mb-2">
                    No Recent Activity
                </h3>
                <p className="text-sm dark:text-gray-400 text-gray-600">
                    Your recent activities will appear here
                </p>
            </div>
        );
    };


    const handleFlashCardList = async (id: string) => {
        setLoading(true)
        try {
            const response = await axios.get(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + "/dev/v1/flashcard/user/recent?userId=" + userId + "&subject=" + id)
            setFData(response.data?.recentFlashcards || [])
            setLoading(false)
        } catch (error) {
            console.error('Error transforming subjects:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleGEtFlashCard = async (id: string | undefined) => {
        console.log('Creating new deck...');
        try {
            // setLoading(true);
            startTimer()

            const response = await axios.get(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + GET_FLASHCARD + `flashcard_id=${id}&userId=${userId}`);
            setData(response.data.flashcard)

            // setLoading(false)

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            console.log(err.message || 'Failed to fetch dashboard data');
            // setLoading(false);
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


    const handleBookmark = async (id: string, heading: string) => {
        try {
            const response = await axios.post(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + "/dev/v1/flashcard/bookmark", {
                "flashcard_id": id,
                "userId": userId
            });

            // setBookmark(true);

            // // ✅ Fix 3: Convert Date to string and add safety check
            // setBookmarkData((prev) => {
            //     if (!Array.isArray(prev)) return [];

            //     return [...prev, {
            //         bookmarkedDate: new Date().toISOString(), // Convert to string
            //         flashcard_id: id,
            //         subject: heading,
            //         title: "Flexural"
            //     }];
            // });

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

            // setBookmark(false);

            // // ✅ Fix 4: Add safety check for filter
            // setBookmarkData((prev) => {
            //     if (!Array.isArray(prev)) return [];
            //     return prev.filter(item => item.flashcard_id !== id);
            // });

            toast.success("deleted bookmark " + heading, {
                position: "bottom-right",
            });
        } catch (error) {
            console.log("error::", error?.message);
        }
    };



    return (
        <CardElementFlashcard loading={loading} backgroundHidden={false} classes={"h-full relative"} title={"Recent"} >

            <div className=' rounded-[7px]  py-[26px] px-[20px] h-full
                 xl:py-[17px] xl:px-[33px] '>
                {(FData.length > 0 && fOpen) && <Button variant={"ghost"} className='absolute -top-12 right-2 z-10' onClick={() => {

                    setFOpen(false)
                }}><ChevronLeft size={16} className='scale-150' /></Button>}
                <div className='xl:h-[350px] h-[326px] w-full overflow-y-auto no-scrollbar'>
                    <div className="2xl:space-y-[20px] xl:space-y-[20px]">

                        {
                            (!recent || recent.length === 0) ? <SimpleEmptyState /> : <>
                                {!fOpen && recentList.map((item, index) => (
                                    <div key={index} className={`space-y-[18px] ${item.time === null ? "pointer-events-none opacity-50" : ""}`} onClick={() => {
                                        setFOpen(true)
                                        handleFlashCardList(item?.name ?? "")
                                    }}>
                                        {item.name &&

                                            <div className="flex items-center justify-between font-causten-semibold rounded cursor-pointer py-2">
                                                <div className="flex items-center gap-3">
                                                    <Image src={item.img} height={30} width={30} className='w-[28px] h-[28px] xl:w-[24px] xl:h-[24px]' alt={item.name} />
                                                    <span className="dark:text-white text-black text-lg xl:text-[19px]">{item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[16px] dark:text-[#C6C6C6] text-black xl:text-[17px]">{item.time == null ? "--" : getTimeAgoSimple(new Date(item.time))} </span>
                                                    {item.time !== null && <ChevronRight className="w-4 h-4 dark:text-[#C6C6C6] text-black" />}
                                                </div>
                                            </div>}


                                        {!item.name &&
                                            <div className="flex items-center justify-between font-causten-semibold bg-red  rounded  cursor-pointer">
                                                <div className="flex items-center gap-3 w-[22px] h-[28px] xl:w-[18px] xl:h-[24px]">
                                                    {/* <Image src={item.img} height={30} width={30} className='w-[22px] h-[22px] xl:w-[18px] xl:h-[18px]' alt={item.name} /> */}
                                                    {/* <span className="dark:text-white text-black text-base 2xl:text-[17px]">{item.name}</span> */}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* <span className="text-[15px] dark:text-[#C6C6C6] text-black 2xl:text-[16px]">{Math.floor((new Date().getTime() - new Date(item.time).getTime()) / (1000 * 60 * 60 * 24))} days ago</span> */}
                                                    {/* <ChevronRight className="w-4 h-4 dark:text-[#C6C6C6] text-black" /> */}
                                                </div>
                                            </div>}
                                        {/* Add separator after each item except the last one */}
                                        {index < recentList.length - 1 && (
                                            <Separator className=" dark:bg-muted bg-black" />
                                        )}
                                    </div>
                                ))}
                                {fOpen &&
                                    <div className='h-full font-causten-semibold col-span-full '>
                                        {FData.length === 0 ? (

                                            <SimpleFlashcardEmpty />

                                        ) :

                                            FData.map((item: { flashcard_id: string, title: string }, index: number) => (
                                                <div key={index} className="space-y-[18px]">
                                                    <Dialog>
                                                        <DialogTrigger className='w-full' onClick={() => {
                                                            setFlipped(false)
                                                            handleGEtFlashCard(item?.flashcard_id || undefined)

                                                        }}>
                                                            <div className="flex items-center justify-between font-causten-semibold rounded cursor-pointer py-2">
                                                                <div className="flex items-center gap-3">
                                                                    <Image src={"/newIcons/flashCards.svg"} height={30} width={30} className='w-[28px] h-[28px] xl:w-[24px] xl:h-[24px]' alt={item?.title || "Flashcard Image"} />
                                                                    <span className="dark:text-white text-black text-lg xl:text-[19px]">{item?.title ?? ""}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <ChevronRight className="w-4 h-4 dark:text-[#C6C6C6] text-black" />
                                                                </div>
                                                            </div>
                                                        </DialogTrigger>

                                                    <DialogContent
                                                        className=" [&>button]:hidden h-[357px] max-sm:max-w-[323px]  max-w-[688px] bg-transparent dark:bg-transparent
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
                                         from-[#B6B6B6] to-[#F3F4F9] dark:from-[#26282C] dark:to-[#181A1D] p-7 max-sm:p-5  border-[#C5C5C5] bg-gradient-to-b">
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
                                                                        id={item?.flashcard_id}
                                                                        handleBookmark={handleBookmark}
                                                                        handleBookmarkDelete={handleBookmarkDelete}
                                                                        heading={item?.title || "Un Known"}
                                                                        readMore={data?.text || "un Known"}
                                                                    />
                                                                )}
                                                            </div>

                                                            {/* Back Side */}
                                                            <div className="absolute w-full  top-0 right-0 left-0 backface-hidden rotate-y-180  shadow-xl  rounded-[27.209px] border-[1.701px]
                                        border-[#C5C5C5] bg-gradient-to-b   from-[#B6B6B6] to-[#F3F4F9] dark:from-[#26282C] dark:to-[#181A1D] p-7 max-sm:p-5  ">
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

                                                                    }}

                                                                />
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                    </Dialog>
                                                    {/* Add separator after each item except the last one */}
                                                    {index < FData.length - 1 && (
                                                        <Separator className=" dark:bg-muted bg-black" />
                                                    )}
                                                </div>


                                            )
                                            )

                                        }
                                    </div>


                                }
                            </>
                        }

                    </div>
                </div>
            </div >

        </CardElementFlashcard >
    )
}