"use client"
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollArea } from '@/components/ui/scroll-area';
import VibrantButtonUI from '../UI/buttonUI';
import axios from 'axios';

interface TestCreationProgressProps {
    questionBankId: string; // Add this prop to track the job
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
}

export function TestCreationProgress({
    questionBankId,
    onGetBackLater,
    onNotifyWhenReady,
    testDetails,
    nextStep
}: TestCreationProgressProps) {

    // State variables
    const [progress, setProgress] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(180); // Default 3 minutes
    const [jobStatus, setJobStatus] = useState('pending');
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step1, setStep1] = useState(false);
    const [step2, setStep2] = useState(false);
    const [step3, setStep3] = useState(false);
    const [step4, setStep4] = useState(false);
    const [step5, setStep5] = useState(false);

    // Refs for cleanup
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Base URL - replace with your actual API base URL
    const BASE_URL = process.env.NEXT_PUBLIC_EXAM_BASE_URL + '/';

    // Create axios instance with common configuration
    const apiClient = axios.create({
        baseURL: BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // API Functions
    const getJobStatus = async (questionBankId: string) => {
        try {
            const response = await apiClient.get(`/api/job-status/${questionBankId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting job status:', error);
            throw error;
        }
    };

    const cancelJob = async (questionBankId: string) => {
        try {
            const response = await apiClient.delete(`/api/cancel-job/${questionBankId}`);
            return response.data;
        } catch (error) {
            console.error('Error cancelling job:', error);
            throw error;
        }
    };

    // Progress calculation based on job status
    const calculateProgress = useCallback((status: any) => {
        if (!status) return 0;

        // If API provides direct progress percentage
        if (status.progress !== undefined) {
            return Math.min(Math.max(status.progress, 0), 100);
        }

        // Calculate progress based on status
        switch (status.status?.toLowerCase()) {
            case 'pending':
            case 'queued':
                return 0;
            case 'started':
            case 'processing':
                return 25;
            case 'extracting':
            case 'analyzing':
                return 50;
            case 'generating':
            case 'creating':
                return 75;
            case 'completed':
            case 'success':
            case 'finished':
                return 100;
            case 'failed':
            case 'error':
            case 'cancelled':
                return 0;
            default:
                return 0;
        }
    }, []);

    // Estimate time remaining based on progress
    const calculateTimeRemaining = useCallback((currentProgress: number) => {
        if (currentProgress >= 100) return 0;
        if (currentProgress <= 0) return 180; // 3 minutes default

        // Simple estimation: assume linear progress
        const totalEstimatedTime = 180; // 3 minutes
        const remainingPercentage = (100 - currentProgress) / 100;
        return Math.ceil(totalEstimatedTime * remainingPercentage);
    }, []);

    // Job status polling function
    const pollJobStatus = useCallback(async () => {
        if (!questionBankId || !isPolling) return;

        try {
            console.log(`Polling job status for: ${questionBankId}`);
            const statusResponse = await getJobStatus(questionBankId);

            setJobStatus(statusResponse.status || 'unknown');
            setError(null);

            // Calculate progress
            const newProgress = calculateProgress(statusResponse);
            setProgress(newProgress);

            // Calculate time remaining
            const newTimeRemaining = calculateTimeRemaining(newProgress);
            setTimeRemaining(newTimeRemaining);

            // Check if job is completed
            const completedStatuses = ['completed', 'success', 'finished'];
            const failedStatuses = ['failed', 'error', 'cancelled'];

            if (completedStatuses.includes(statusResponse.status?.toLowerCase())) {
                setProgress(100);
                setTimeRemaining(0);
                stopPolling();

                // Auto-advance to next step after completion
                setTimeout(() => {
                    nextStep();
                }, 1000);
            } else if (failedStatuses.includes(statusResponse.status?.toLowerCase())) {
                setError(`Job failed with status: ${statusResponse.status}`);
                stopPolling();
            }

        } catch (error) {
            console.error('Error polling job status:', error);
            setError('Failed to check job status. Retrying...');
            // Don't stop polling on single request failures
        }
    }, [questionBankId, isPolling, calculateProgress, calculateTimeRemaining, nextStep]);

    // Start polling
    const startPolling = useCallback(() => {
        if (pollingIntervalRef.current) return; // Already polling

        setIsPolling(true);
        setError(null);

        // Initial poll
        pollJobStatus();

        // Set up 30-second interval
        pollingIntervalRef.current = setInterval(pollJobStatus, 30000);

        console.log(`Started polling for job: ${questionBankId}`);
    }, [pollJobStatus, questionBankId]);

    // Stop polling
    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setIsPolling(false);
        console.log(`Stopped polling for job: ${questionBankId}`);
    }, [questionBankId]);

    // Start countdown timer
    const startTimer = useCallback(() => {
        if (timerIntervalRef.current) return;

        timerIntervalRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // Stop timer
    const stopTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    }, []);

    // Handle job cancellation
    const handleCancelJob = async () => {
        try {
            await cancelJob(questionBankId);
            stopPolling();
            setJobStatus('cancelled');
            setError('Job cancelled successfully');
        } catch (error) {
            console.error('Failed to cancel job:', error);
            setError('Failed to cancel job');
        }
    };

    // Start polling when component mounts or questionBankId changes
    useEffect(() => {
        if (questionBankId) {
            startPolling();
            startTimer();
        }

        return () => {
            stopPolling();
            stopTimer();
        };
    }, [questionBankId, startPolling, startTimer, stopPolling, stopTimer]);

    // Update step states based on progress
    useEffect(() => {
        if (progress >= 20) setStep1(true);
        if (progress >= 40) setStep2(true);
        if (progress >= 60) setStep3(true);
        if (progress >= 80) setStep4(true);
        if (progress >= 100) setStep5(true);
    }, [progress]);

    // Handle component unmount
    useEffect(() => {
        return () => {
            stopPolling();
            stopTimer();
        };
    }, [stopPolling, stopTimer]);

    return (
        <div className="w-full min-h-[560px] max-w-[400px] bg-[#F3F4F9] dark:bg-[#181A1D] dark:shadow-[inset_0_0_8px_#B8B8B82B]  border 2xl:py-[19px] 2xl:px-[34px] py-[20px] px-[35px] max-md:my-5 border-[#B8B8B8] dark:border-none
         rounded-xl shadow-lg dark:text-white text-black">
            <ScrollArea className='h-full w-full'>
                <h2 className="font-medium text-center 2xl:mb-[19px] 2xl:text-[21px] text-[22px] mb-[14px]">
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
                    <div className="flex justify-between font-medium 2xl:mb-[19px] mb-6 max-md:mb-3 text-[12px] 2xl:text-[11px] px-3 max-md:px-0 w-full">
                        <span>{progress}% completed</span>
                        <span>~{timeRemaining} seconds remaining</span>
                    </div>
                    <Progress
                        value={progress}
                        className="h-1.5 [&>div]:bg-[#3ADE9E] dark:[&>div]:bg-[#3ADE9E]"
                    />
                </div>

                {/* Status indicator */}
                <div className="mb-4 text-center">
                    <p className="text-sm text-[#9099A1]">
                        Status: {jobStatus} {isPolling && '(Checking...)'}
                    </p>
                </div>

                {/* Buttons */}
                <div className="gap-[19px] max-md:gap-3 mb-[12px] 2xl:mb-[19px] w-full grid grid-cols-2">
                    <VibrantButtonUI
                        active={false}
                        size="sm"
                        onClick={() => {
                            handleCancelJob();
                            onGetBackLater();
                        }}
                        font="dark:border-none border border-[#B8B8B8]"
                    >
                        <p className='text-[12px] 2xl:text-[12px]'>Cancel & Get back later</p>
                    </VibrantButtonUI>
                    <VibrantButtonUI
                        active={false}
                        size="sm"
                        font="dark:border-none border border-[#B8B8B8]"
                        onClick={() => {
                            onNotifyWhenReady();
                            nextStep();
                        }}
                    >
                        <p className='text-[12px] 2xl:text-[12px]'>Notify when ready</p>
                    </VibrantButtonUI>
                </div>

                {/* Steps */}
                <div className="flex flex-col justify-end h-full mt-8">
                    <div className="flex flex-col items-center">
                        <div className="2xl:space-y-8 space-y-7">

                            {/* Step 1 */}
                            {step1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex gap-[23px] 2xl:gap-[31px]"
                                >
                                    <div className="relative">
                                        <CheckCircle className="h-6 w-6 2xl:h-8 2xl:w-8 text-emerald-500" />
                                        <div className="absolute top-9 left-3 w-0.5 2xl:h-8 h-6 bg-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium 2xl:text-[14px] text-[15px] font-pt-sans">Creating a {testDetails.testType}</h3>
                                        <p className="2xl:text-[11px] text-[12px] font-medium font-pt-sans text-[#9099A1]">Let&apos;s review the plan</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2 */}
                            {step2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex gap-[23px] 2xl:gap-[31px]"
                                >
                                    <div className="relative">
                                        <CheckCircle className="h-6 w-6 2xl:h-8 2xl:w-8 text-emerald-500" />
                                        <div className="absolute top-9 left-3 w-0.5 2xl:h-8 h-6 bg-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="2xl:text-[14px] text-[15px] font-medium font-pt-sans">Content source</h3>
                                        <p className="2xl:text-[11px] text-[12px] text-[#9099A1] font-medium font-pt-sans">{testDetails.contentSource}</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3 */}
                            {step3 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex gap-[23px] 2xl:gap-[31px]"
                                >
                                    <div className="relative">
                                        <CheckCircle className="h-6 w-6 2xl:h-8 2xl:w-8 text-emerald-500" />
                                        <div className="absolute top-9 left-3 w-0.5 2xl:h-8 h-6 bg-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium font-pt-sans 2xl:text-[14px] text-[15px]">Questions</h3>
                                        <p className="2xl:text-[11px] text-[12px] text-[#9099A1] font-medium font-pt-sans">{testDetails.questionCount} questions</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4 */}
                            {step4 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex gap-[23px] 2xl:gap-[31px]"
                                >
                                    <div className="relative">
                                        <CheckCircle className="h-6 w-6 2xl:h-8 2xl:w-8 text-emerald-500" />
                                        <div className="absolute top-9 left-3 w-0.5 2xl:h-8 h-6 bg-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium font-pt-sans 2xl:text-[14px] text-[15px]">Setting time</h3>
                                        <p className="2xl:text-[11px] text-[12px] text-[#9099A1] font-medium font-pt-sans">{testDetails.timeLimit} mins</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 5 */}
                            {step5 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex gap-[23px] 2xl:gap-[31px]"
                                >
                                    <div>
                                        <CheckCircle className="h-6 w-6 2xl:h-8 2xl:w-8 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium font-pt-sans 2xl:text-[14px] text-[15px]">All done</h3>
                                        <p className="2xl:text-[11px] text-[12px] text-[#9099A1] font-medium font-pt-sans">Your test is fully created</p>
                                    </div>
                                </motion.div>
                            )}

                        </div>
                    </div>
                </div>

            </ScrollArea>
        </div>
    );
}

export default TestCreationProgress;