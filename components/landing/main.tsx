"use client"
import { useEffect, useState, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import PersonalityTestHeader from "./UI/UI-personalityMonitor";
import PersonalityQuestion from "./UI/UI-radioButtons";

import questions from "./questions.json"
import { MoveRight } from "lucide-react";

export default function LandingPage() {
    const [count, setCount] = useState(0)
    const [start, setStart] = useState(0)
    const [end, setEnd] = useState(5)
    const [currentActiveQuestion, setCurrentActiveQuestion] = useState(1) // Track which question is currently active
    const scrollAreaRef = useRef(null);

    // Initialize React Hook Form
    const methods = useForm({
        defaultValues: {
            // Initialize all questions with empty values
            ...questions.reduce((acc, question) => {
                acc[`question_${question.id}`] = "";
                return acc;
            }, {})
        }
    });

    const { handleSubmit, watch, formState: { errors } } = methods;

    // Watch form values to check if current questions are answered
    const watchedValues = watch();

    // Get current questions being displayed
    const currentQuestions = questions.slice(start, end);

    // Check if all current questions are answered
    const areCurrentQuestionsAnswered = currentQuestions.every(question =>
        watchedValues[`question_${question.id}`] &&
        watchedValues[`question_${question.id}`] !== ""
    );

    // Calculate progress and current question values
    const totalQuestions = questions.length;
    const currentQuestionNumber = end;
    const answeredQuestions = Object.values(watchedValues).filter(value => value !== "").length;
    const answeredProgressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);

    // Auto-advance function
    const handleAutoAdvance = (answeredQuestionId: number) => {
        console.log(`Question ${answeredQuestionId} answered, moving to next...`);

        // Find the next unanswered question in the current page
        const nextQuestionInPage = currentQuestions.find(q =>
            q.id > answeredQuestionId &&
            (!watchedValues[`question_${q.id}`] || watchedValues[`question_${q.id}`] === "")
        );

        if (nextQuestionInPage) {
            // Move to next question in current page
            setCurrentActiveQuestion(nextQuestionInPage.id);

            // Scroll to the next question
            setTimeout(() => {
                const nextQuestionElement = document.getElementById(`#${nextQuestionInPage.id}`);
                if (nextQuestionElement) {
                    nextQuestionElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 100);
        } else {
            // All questions in current page are answered, auto-advance to next page
            if (areCurrentQuestionsAnswered && end < questions.length) {
                setTimeout(() => {
                    handleNext();
                }, 800); // Delay before moving to next page
            }
        }
    };

    const handleNext = () => {
        if (end < questions.length) {
            setCount(count + 1);
            setStart(start + 5);
            setEnd(Math.min(end + 5, questions.length));
            setCurrentActiveQuestion(start + 5 + 1); // Set first question of next page as active
        }
    };

    const handlePrevious = () => {
        if (start > 0) {
            setCount(count - 1);
            setStart(Math.max(start - 5, 0));
            setEnd(start);
            setCurrentActiveQuestion(Math.max(start - 5, 0) + 1); // Set first question of previous page as active
        }
    };

    const onSubmit = (data) => {
        console.log("Form Data:", data);
        // Process the form data here
    };

    // Check if all questions in the test are answered (for submit button)
    const areAllQuestionsAnswered = questions.every(question =>
        watchedValues[`question_${question.id}`] &&
        watchedValues[`question_${question.id}`] !== ""
    );

    // Set the first question as active when component mounts or page changes
    useEffect(() => {
        if (currentQuestions.length > 0) {
            const firstUnansweredQuestion = currentQuestions.find(q =>
                !watchedValues[`question_${q.id}`] || watchedValues[`question_${q.id}`] === ""
            );
            if (firstUnansweredQuestion) {
                setCurrentActiveQuestion(firstUnansweredQuestion.id);
            }
        }
    }, [start, end, currentQuestions]);

    // Debug logs
    console.log('Current Active Question:', currentActiveQuestion);
    console.log('Current Questions:', currentQuestions.map(q => q.id));
    console.log('Answered Status:', currentQuestions.map(q => ({
        id: q.id,
        answered: !!watchedValues[`question_${q.id}`]
    })));

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="h-auto w-full">
                <PersonalityTestHeader
                    progress={answeredProgressPercentage}
                    currentQuestion={currentQuestionNumber}
                    totalQuestions={totalQuestions}
                    handlePrevious={handlePrevious}
                    start={start}
                />
                <ScrollArea ref={scrollAreaRef} className="h-full w-full">
                    {
                        currentQuestions.map((item, index) =>
                            <PersonalityQuestion
                                key={item.id}
                                data={item}
                                currentQuestion={currentActiveQuestion - 1} // Convert to 0-based index
                                onAutoAdvance={handleAutoAdvance}
                            />
                        )
                    }
                </ScrollArea>
                <div className="w-full pb-[37px] flex items-center justify-center gap-4 font-[Inter]">


                    {end >= questions.length ? (
                        <Button
                            type="submit"
                            disabled={!areAllQuestionsAnswered}
                            className={`shadow-inner shadow-[#F0D1A2] rounded-full px-20 font-bold text-[20px] py-3 ${areAllQuestionsAnswered
                                ? 'bg-[#CF8A25] dark:bg-[#CF8A25] hover:bg-[#B8751F]'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Submit Test
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleNext}
                            disabled={!areCurrentQuestionsAnswered}
                            className={`shadow-inner space-x-5 shadow-[#F0D1A2]  rounded-full px-20 font-bold text-[20px] py-3 ${areCurrentQuestionsAnswered
                                ? 'bg-[#CF8A25] dark:bg-[#CF8A25] hover:bg-[#B8751F]'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <p>Next</p> <MoveRight className='scale-150' />
                        </Button>
                    )}
                </div>

                {/* Optional: Show progress message */}
                {!areCurrentQuestionsAnswered && (
                    <div className="text-center text-gray-500 text-sm mb-4">
                        Please answer all questions on this page to continue
                    </div>
                )}
            </form>
        </FormProvider>
    )
}