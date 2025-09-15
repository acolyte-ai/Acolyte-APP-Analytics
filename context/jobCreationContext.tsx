// JobPollingContext.tsx - Create this context to manage persistent polling
"use client"
import React, { createContext, useContext, useRef, useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useSettings } from './store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface JobPollingContextType {
    startPolling: (questionBankId: string, onComplete?: () => void) => void;
    stopPolling: (questionBankId: string) => void;
    getJobStatus: (questionBankId: string) => JobStatusInfo | null;
    isPolling: (questionBankId: string) => boolean;
    jobStatus: string
}

interface JobStatusInfo {
    status: string;
    progress: number;
    questionsGenerated: number;
    timeRemaining: number;
    error: string | null;
}

const JobPollingContext = createContext<JobPollingContextType | undefined>(undefined);

export const useJobPolling = () => {
    const context = useContext(JobPollingContext);
    if (!context) {
        throw new Error('useJobPolling must be used within a JobPollingProvider');
    }
    return context;
};

interface PollingJob {
    intervalId: NodeJS.Timeout;
    questionBankId: string;
    onComplete?: () => void;
    status: JobStatusInfo;
}

export const JobPollingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const activeJobs = useRef<Map<string, PollingJob>>(new Map());
    const [, forceUpdate] = useState({});
    const [jobStatus, setJobStatus] = useState("")
    const [switchAction, setSwitchOn] = useState(false)
    const { setNotifyTest, notificationEnable, setNotificationEnable } = useSettings();
    const router = useRouter()

    const BASE_URL = process.env.NEXT_PUBLIC_EXAM_BASE_URL + '/';
    const apiClient = axios.create({
        baseURL: BASE_URL,
        headers: { 'Content-Type': 'application/json' },
    });

    const calculateProgress = useCallback((statusResponse: any) => {
        if (!statusResponse) return 0;

        const apiQuestionsGenerated = statusResponse.questionsGenerated || statusResponse.questions_generated || 0;

        if (statusResponse.progress !== undefined) {
            return Math.min(Math.max(statusResponse.progress, 0), 100);
        }

        const totalQuestions = parseInt(localStorage.getItem("aco-exam-question") || "10");
        let baseProgress = Math.min((apiQuestionsGenerated / totalQuestions) * 80, 80);

        switch (statusResponse.status?.toLowerCase()) {
            case 'pending':
            case 'queued':
                return Math.max(baseProgress, 5);
            case 'started':
            case 'processing':
                return Math.max(baseProgress, 10);
            case 'extracting':
            case 'analyzing':
                return Math.max(baseProgress, 20);
            case 'generating':
            case 'creating':
                return Math.max(baseProgress, 30);
            case 'finalizing':
                return Math.max(baseProgress, 85);
            case 'completed':
            case 'success':
            case 'finished':
                return 100;
            default:
                return baseProgress;
        }
    }, []);

    const calculateTimeRemaining = useCallback((questionsGenerated: number, currentProgress: number) => {
        const totalQuestions = parseInt(localStorage.getItem("aco-exam-question") || "10");
        if (currentProgress >= 100) return 0;
        if (questionsGenerated <= 0) return 600;

        const timePerQuestion = 30;
        const remainingQuestions = totalQuestions - questionsGenerated;
        const estimatedTimeForQuestions = remainingQuestions * timePerQuestion;
        const bufferTime = currentProgress < 85 ? 60 : 0;

        return Math.max(estimatedTimeForQuestions + bufferTime, 0);
    }, []);

    const pollSingleJob = useCallback(async (questionBankId: string) => {
        const job = activeJobs.current.get(questionBankId);
        if (!job) return;

        try {
            const response = await apiClient.get(`/api/job-status/${questionBankId}`);
            const statusResponse = response.data;

            // const newProgress = calculateProgress(statusResponse);
            const apiQuestionsGenerated = statusResponse.questionsGenerated || statusResponse.questions_generated || 0;
            // const newTimeRemaining = calculateTimeRemaining(apiQuestionsGenerated, newProgress);

            // Update job status
            job.status = {
                status: statusResponse.status || 'unknown',
                progress: statusResponse.progress,
                questionsGenerated: apiQuestionsGenerated,
                timeRemaining: statusResponse.estimated_time_remaining,
                error: null,
            };
            setJobStatus(statusResponse.status)
            console.log("notification enabled:1:::", notificationEnable, statusResponse)

            // Check if job is completed successfully
            const completedStatuses = ['completed', 'success', 'finished'];
            const failedStatuses = ['failed', 'error', 'cancelled'];

            if (statusResponse.status !== "completed") { setSwitchOn(false) }

            if (completedStatuses.includes(statusResponse.status?.toLowerCase()) && !switchAction) {
                job.status.progress = 100;
                job.status.timeRemaining = 0;

                toast.success("Your test is ready!", {
                    position: "bottom-right",
                    duration: Infinity,
                    dismissible: true,
                    closeButton: true,
                    action: {
                        label: "Take test",
                        onClick: () => router.push("/assesment/dailyTest/" + questionBankId),
                    },
                    description: "Please click the link to take test",
                    style: {
                        fontSize: '16px', // Fixed syntax error and increased base font size

                        '--toast-icon-size': '24px', // Makes the tick icon bigger
                    } as React.CSSProperties,
                    actionButtonStyle: {
                        fontSize: '14px', // Button text size
                        padding: '8px 16px', // Makes button bigger
                        minHeight: '36px', // Button height
                    }
                })

                console.log("notification enabled:2:::", notificationEnable,)
                setNotifyTest(true)

                // Call completion callback
                if (job.onComplete) {
                    job.onComplete();
                }
                setSwitchOn(true)

                // Stop polling this job
                clearInterval(job.intervalId);
                activeJobs.current.delete(questionBankId);
            }
            // Handle failed jobs
            else if (failedStatuses.includes(statusResponse.status?.toLowerCase())) {
                job.status.error = statusResponse.error || 'Job failed';
                job.status.timeRemaining = 0;

                toast.error("Test generation failed", {
                    position: "bottom-right",
                    duration: 5000,
                    dismissible: true,
                    closeButton: true,
                    style: {
                        fontSize: '16px', // Fixed syntax error and increased base font size

                        '--toast-icon-size': '24px', // Makes the tick icon bigger
                    } as React.CSSProperties,
                    actionButtonStyle: {
                        fontSize: '14px', // Button text size
                        padding: '8px 16px', // Makes button bigger
                        minHeight: '36px', // Button height
                    },
                    description: statusResponse.error || "Something went wrong while generating your test. Please try again."
                });

                console.log(`Job ${questionBankId} failed with status: ${statusResponse.status}`);

                // Stop polling this job
                clearInterval(job.intervalId);
                activeJobs.current.delete(questionBankId);
            }

            // Force re-render of components using this data
            forceUpdate({});

        } catch (error) {
            console.error(`Error polling job ${questionBankId}:`, error);
            if (job) {
                job.status.error = 'Failed to check job status';

                // Stop polling on API errors too
                clearInterval(job.intervalId);
                activeJobs.current.delete(questionBankId);

                toast.error("Connection error", {
                    position: "bottom-right",
                    duration: 5000,
                    dismissible: true,
                    closeButton: true,
                    style: {
                        fontSize: '16px', // Fixed syntax error and increased base font size

                        '--toast-icon-size': '24px', // Makes the tick icon bigger
                    } as React.CSSProperties,
                    actionButtonStyle: {
                        fontSize: '14px', // Button text size
                        padding: '8px 16px', // Makes button bigger
                        minHeight: '36px', // Button height
                    },
                    description: "Unable to check test generation status. Please refresh the page."
                });
            }
        }
    }, [calculateProgress, calculateTimeRemaining, apiClient, notificationEnable, setNotifyTest, router]);

    const startPolling = useCallback((questionBankId: string, onComplete?: () => void) => {
        // Don't start if already polling
        if (activeJobs.current.has(questionBankId)) {
            return;
        }

        // Initial status
        const initialStatus: JobStatusInfo = {
            status: 'pending',
            progress: 0,
            questionsGenerated: 0,
            timeRemaining: 600,
            error: null,
        };

        // Start polling interval
        const intervalId = setInterval(() => {
            pollSingleJob(questionBankId);
        }, 3000);

        // Store job info
        activeJobs.current.set(questionBankId, {
            intervalId,
            questionBankId,
            onComplete,
            status: initialStatus,
        });

        // Initial poll
        pollSingleJob(questionBankId);

        console.log(`Started persistent polling for job: ${questionBankId}`);
    }, [pollSingleJob]);

    const stopPolling = useCallback((questionBankId: string) => {
        const job = activeJobs.current.get(questionBankId);
        if (job) {
            clearInterval(job.intervalId);
            activeJobs.current.delete(questionBankId);
            console.log(`Stopped polling for job: ${questionBankId}`);
        }
    }, []);

    const getJobStatus = useCallback((questionBankId: string): JobStatusInfo | null => {
        const job = activeJobs.current.get(questionBankId);
        return job ? job.status : null;
    }, []);

    const isPolling = useCallback((questionBankId: string): boolean => {
        return activeJobs.current.has(questionBankId);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            activeJobs.current.forEach((job) => {
                clearInterval(job.intervalId);
            });
            activeJobs.current.clear();
        };
    }, []);

    const value: JobPollingContextType = {
        startPolling,
        stopPolling,
        getJobStatus,
        jobStatus,
        isPolling,
    };

    return (
        <JobPollingContext.Provider value={value}>
            {children}
        </JobPollingContext.Provider>
    );
};