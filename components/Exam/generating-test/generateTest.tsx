"use client"
import React, { useEffect, useState, useRef } from 'react';
import { Progress } from "@/components/ui/progress";
import { CheckCircle, CircleCheck } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollArea } from '@/components/ui/scroll-area';
import VibrantButtonUI from '../UI/buttonUI';
import axios from 'axios';
import { useSettings } from '@/context/store';
import { useJobPolling } from '@/context/jobCreationContext'; // Import the context

interface TestCreationProgressProps {
    questionBankId: string;
    onGetBackLater: () => void;
    onNotifyWhenReady: () => void;
    nextStep: () => void;
    testDetails: {
        testType: string;
        contentSource: string;
        questionCount: number;
        timeLimit: number;
        isCompleted: boolean;
    };
    closeBox: () => void
}

export function TestCreationProgress({
    questionBankId,
    onGetBackLater,
    // onNotifyWhenReady,
    testDetails,
    nextStep,
    closeBox
}: TestCreationProgressProps) {

    // Use the polling context
    const { startPolling, stopPolling, getJobStatus, jobStatus, isPolling } = useJobPolling();
    const { setNotificationEnable } = useSettings()

    // State variables - now get data from context
    const [step1, setStep1] = useState(false);
    const [step2, setStep2] = useState(false);
    const [step3, setStep3] = useState(false);
    const [step4, setStep4] = useState(false);
    const [step5, setStep5] = useState(false);
    const { selectedFile } = useSettings();

    // Timer for UI updates
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Get current job status from context
    const jobStatusInfo = getJobStatus(questionBankId);
    const progress = jobStatusInfo?.progress || 0;
    const timeRemaining = jobStatusInfo?.timeRemaining || 0;
    const error = jobStatusInfo?.error;
    const questionsGenerated = jobStatusInfo?.questionsGenerated || 0;

    // Base URL for API calls
    const BASE_URL = process.env.NEXT_PUBLIC_EXAM_BASE_URL + '/';
    const apiClient = axios.create({
        baseURL: BASE_URL,
        headers: { 'Content-Type': 'application/json' },
    });

    // Handle job cancellation
    const handleCancelJob = async () => {
        try {
            await apiClient.delete(`/api/cancel-job/${questionBankId}`);
            stopPolling(questionBankId);
        } catch (error) {
            console.error('Failed to cancel job:', error);
        }
    };

    // Start polling when component mounts
    useEffect(() => {
        if (questionBankId && !isPolling(questionBankId)) {
            startPolling(questionBankId, () => {
                // This callback runs when job is completed
                setTimeout(() => {
                    nextStep();
                }, 1000);
            });
        }

        // Start a timer for UI updates (countdown) - only if job is not completed
        if (progress < 100) {
            timerRef.current = setInterval(() => {
                // Force re-render to update UI (for countdown)
                setStep1(prev => prev);
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [questionBankId, startPolling, isPolling, nextStep]);

    console.log("clear interval check jon status", jobStatus)

    // Clear timer when job is completed or failed
    useEffect(() => {
        const completedStatuses = ['completed', 'success', 'finished'];
        const failedStatuses = ['failed', 'error', 'cancelled'];

        if (completedStatuses.includes(jobStatus?.toLowerCase()) ||
            failedStatuses.includes(jobStatus?.toLowerCase()) ||
            progress >= 100) {

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [jobStatus, progress]);

    // Update step states based on progress
    useEffect(() => {
        if (progress >= 10) setStep1(true);
        if (progress >= 25) setStep2(true);
        if (progress >= 50) setStep3(true);
        if (progress >= 75) setStep4(true);
        if (progress >= 100) setStep5(true);
    }, [progress]);

    // Define steps for the silhouette approach
    const steps = [
        {
            id: 1,
            completed: step1,
            title: `Creating a ${testDetails.testType}`,
            subtitle: "Let's review the plan",
            hasConnector: true
        },
        {
            id: 2,
            completed: step2,
            title: "Content source",
            subtitle: testDetails.contentSource,
            hasConnector: true
        },
        {
            id: 3,
            completed: step3,
            title: "Generating Questions",
            subtitle: `${localStorage.getItem("aco-exam-question")} questions`,
            hasConnector: true
        },
        {
            id: 4,
            completed: step4,
            title: "Setting time",
            subtitle: `${testDetails.timeLimit} mins`,
            hasConnector: true
        },
        {
            id: 5,
            completed: step5,
            title: "All done",
            subtitle: "Your test is fully created",
            hasConnector: false
        }
    ];

    return (
        <div className="w-full min-h-[560px] max-w-[400px]  rounded-[7.493px] bg-white dark:bg-[#181A1D] dark:shadow-[inset_0_0_8px_#B8B8B82B]  2xl:py-[19px] 2xl:px-[34px] py-[20px] px-[35px] max-md:my-5  border border-[#B5B5B5] dark:border-none  shadow-lg dark:text-white text-black">
            <ScrollArea className='h-full w-full'>
                <h2 className="font-medium text-center dark:text-white text-[#36AF8D] 2xl:mb-[19px] 2xl:text-[21px] text-[22px] mb-[14px]">
                    Hold up! We&apos;re creating your test
                </h2>

                {/* Error display */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Progress bar */}
                <div className="mb-4 max-md:mb-3 w-full 2xl:mb-[19px]">

                    <Progress
                        value={progress}
                        className="h-1.5 [&>div]:bg-[#36AF8D] dark:[&>div]:bg-[#36AF8D] xl:mb-[13px] mb-6 max-md:mb-3"
                    />

                    <div className="flex justify-between font-medium  tracking-wider text-[12px] xl:text-[12.5px] px-3 max-md:px-0 w-full">
                        <span>{progress}% completed</span>
                        <span className='text-[#B3751B]'>{timeRemaining}  remaining</span>
                    </div>
                </div>

                {/* Status indicator */}
                <div className="mb-4 text-center">
                    {/* <p className="text-sm text-[#9099A1]">
                        Status: {jobStatus} {isPolling(questionBankId) && '(Processing...)'}
                    </p> */}
                    {questionsGenerated > 0 && (
                        <p className="text-xs text-[#9099A1] mt-1">
                            Questions: {questionsGenerated} generated
                        </p>
                    )}
                </div>

                {/* Buttons */}
                <div className="gap-[19px] max-md:gap-3 mb-[12px] 2xl:mb-[19px] w-full grid grid-cols-2">
                    <VibrantButtonUI
                        active={false}
                        size="sm"
                        onClick={() => {
                            handleCancelJob();
                            closeBox();
                            onGetBackLater();
                        }}
                        font="dark:border-none border border-[#B8B8B8] "
                    >
                        <p className='text-[12px] 2xl:text-[12px]'>Cancel</p>
                    </VibrantButtonUI>
                    <VibrantButtonUI
                        active={false}
                        size="sm"
                        font="dark:border-none border border-[#B8B8B8] "
                        onClick={() => {
                            setNotificationEnable(true)
                            closeBox();
                            // Polling continues in background
                        }}
                    >
                        <p className='text-[12px] 2xl:text-[12px]'>Notify when ready</p>
                    </VibrantButtonUI>
                </div>

                {/* Steps - Updated with silhouette approach */}
                <div className="flex flex-col justify-end h-full mt-8">
                    <div className="flex flex-col items-center">
                        <div className="2xl:space-y-8 space-y-7">
                            {steps.map((step) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex gap-[23px] xl:gap-[28px]"
                                >
                                    <div className="relative">
                                        <CircleCheck className={`h-6 w-6 xl:h-8 xl:w-8 ${step.completed ? 'text-[#36AF8D]' : 'text-gray-300'}`} />
                                        {step.hasConnector && (
                                            <div className={`absolute top-10 left-3 w-0.5 xl:h-6 h-5 ${step.completed ? 'bg-[#36AF8D]' : 'bg-gray-300'}`} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold xl:text-[14px] text-[15px] tracking-wide  font-pt-sans ${step.completed ? 'text-black dark:text-white' : 'text-gray-300'}`}>
                                            {step.title}
                                        </h3>
                                        <p className={`xl:text-[13px] text-[12px] font-medium tracking-wide font-pt-sans ${step.completed ? 'dark:text-[#9099A1] text-gray-500' : 'text-gray-300'}`}>
                                            {step.subtitle}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

            </ScrollArea>
        </div>
    );
}