import { useEffect, useRef, useState } from "react";
import Flashcard from "../UI/flashcardFrontUI";
import FlashcardBack from "../UI/flascardBackUI";
import { FlashcardData } from "../services/flashcardTypes";
import axios from "axios";
import { toast } from "sonner";
import useUserId from "@/hooks/useUserId";
import { SUBMIT_REVIEW } from "../api/url";


interface FlashCardUIProps {
    flashcardData: {
        "heading": string,
        "description": string,
        "body_system": string,
        "flashcard_id": string
        "title": string,
        "subject": string,
        "bookName": string,
    };
    onClose: () => void;
    loading?: boolean;
    generatedCard?: () => void
    showFlashcard?: () => void
}

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

export default function FlashCardUI({ flashcardData, onClose, showFlashcard }: FlashCardUIProps) {
    const [flipped, setFlipped] = useState(false);
    const [timer, setTimer] = useState(0);
    const [timerRunning, setIsTimerRunning] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const userId = useUserId()


    useEffect(() => {
        if (userId) {
            startTimer()
        }
    }, [userId])

    console.log("falshCardData:::", flashcardData)
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
    }

    // Use direct backdrop click handling
    const handleBackdropClick = () => {
        onClose();

    };

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
            toast.info("you have clicked again!", {
                position: "bottom-right",
            })
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


            await axios.post(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + SUBMIT_REVIEW, {
                "flashcard_id": flashcardData.flashcard_id,
                "quality": val,
                "timeSpent": timer,
                "userId": userId
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (showFlashcard)
                showFlashcard()
            toast.success("your review has been successfully submitted", {
                position: "bottom-right",
            })

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            console.log(err.message || 'Failed to fetch dashboard data');
            toast.error("please try again your review was not saved!")

        }
    };


    const handleBookmark = async (id: string, heading: string) => {
        try {
            const response = await axios.post(process.env.NEXT_PUBLIC_FLASHCARD_BASE_URL + "/dev/v1/flashcard/bookmark", {
                "flashcard_id": flashcardData?.flashcard_id,
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
                "flashcard_id": flashcardData?.flashcard_id,
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
        <div className=" h-[357px] max-sm:max-w-[323px] w-full max-w-[688px] max-sm:min-h-[60px] max-sm:h-[167px] min-h-[20vh] "
            onClick={handleBackdropClick}
        >

            <div
                className={`relative max-w-full flex items-center justify-center mx-auto
                                            transition-transform duration-700 transform-style-preserve-3d ${flipped ? "rotate-y-180" : ""
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Front Side */}
                <div className="absolute  w-full top-0 right-0 left-0 backface-hidden   rounded-[27.209px] border-[1.701px] dark:border-none   shadow-xl
                                         from-[#B6B6B6] to-[#F3F4F9] dark:from-[#26282C] dark:to-[#181A1D] p-7 max-sm:p-5  border-[#C5C5C5] bg-gradient-to-b">
                    <Flashcard
                        flipFn={() => {
                            setFlipped(true)
                            stopTimer()
                        }}
                        bookmark={false}
                        handleBookmark={handleBookmark}
                        handleBookmarkDelete={handleBookmarkDelete}
                        id={flashcardData?.flashcard_id}
                        heading={flashcardData?.title ?? flashcardData?.heading ?? ""} readMore={"No hints available"} />
                </div>

                {/* Back Side */}
                <div className="absolute w-full  top-0 right-0 left-0 backface-hidden rotate-y-180  shadow-xl  rounded-[27.209px] border-[1.701px] dark:border-none
                                        border-[#C5C5C5] bg-gradient-to-b   from-[#B6B6B6] to-[#F3F4F9] dark:from-[#26282C] dark:to-[#181A1D] p-7 max-sm:p-5  ">
                    <FlashcardBack
                        flipFn={() => {
                            setFlipped(false)
                            startTimer()
                            flashcardAgainClick({ userId: userId, flashcardId: flashcardData?.flashcard_id, timeSpent: timer })
                        }

                        }
                        description={flashcardData?.description}
                        title={flashcardData?.title ?? flashcardData?.heading ?? ""}
                        // id={data?.flashcard_id}
                        review={(val: "Good" | "Hard" | "Easy" | null) => {
                            handleSubmitFlashCard(flashcardData?.flashcard_id, val)
                            handleBackdropClick()
                            setFlipped(false)

                        }}
                    />
                </div>
            </div>
        </div>






    )
}

//dark:from-[#26292D] dark:to-[#181A1D] dark:border-[#2E323C]