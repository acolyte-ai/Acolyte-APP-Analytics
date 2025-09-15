"use client";


import { useSettings } from "@/context/store";
import { markPdfAsTrained } from "@/db/pdf/fileSystem";
import useUserId from "@/hooks/useUserId";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

export default function CheckIndices() {
    const userId = useUserId();
    const {
        isTrainingProgress,
        setisTrainingProgress,
        pages,
        currentDocumentId,
        fileSystem,
        setFileSystem,
        setisTrainCompleted,
    } = useSettings();

    // Use ref to track polling status
    const pollingRef = useRef(null);

    // Special logic for large documents (more than 100 pages)
    const isLargeDocument = pages > 100;

    // Calculate wait time based on document size using the specified benchmarks
    const calculateWaitTime = (pageCount) => {
        if (pageCount <= 100) {
            // Scale linearly from 0 to 60 seconds for 0-100 pages
            return (pageCount / 100) * 60 * 1000;
        } else if (pageCount <= 1000) {
            // Scale linearly from 60 to 420 seconds for 100-1000 pages
            return (60 + (pageCount - 100) / 900 * 360) * 1000;
        } else if (pageCount <= 4000) {
            // Scale linearly from 420 to 1200 seconds for 1000-4000 pages
            return (420 + (pageCount - 1000) / 3000 * 780) * 1000;
        } else {
            // Cap at 1200 seconds (20 minutes) for pages > 4000
            return 1200 * 1000;
        }
    };

    // Calculate initial check time based on document size
    const initialCheckTime = calculateWaitTime(pages);

    // Fixed polling interval for large documents, adaptive for smaller ones
    const [pollingInterval, setPollingInterval] = useState(isLargeDocument ? 30000 : 2000);
    const maxPollingInterval = isLargeDocument ? 30000 : 8000; // Maximum polling interval
    const pollingIncrement = isLargeDocument ? 0 : 1000; // No increment for large docs (fixed interval)

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Function to check indices with improved error handling
    const checkIndices = async () => {
        if (!userId || !currentDocumentId) return false;

        https://wyx3n7ow39.execute-api.ap-south-1.amazonaws.com/dev/v1/processing?job_key=51a3bd2a-d071-7095-d6ba-fe7b62c5710a_538d1080-9344-47f3-ada2-9b5a1744dbf3.pdf

        try {
            // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dev/checkIndices`, {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dev/v1/processing?job_key=${userId}_${currentDocumentId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    path: `${userId}/indices/${currentDocumentId}/`,
                }),
            });

            if (!response.ok) {

                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();

            if (data.exists) {
                // Training complete - mark as trained immediately
                await markPdfAsTrained(fileSystem, setFileSystem, currentDocumentId);
                setisTrainingProgress(false);
                setisTrainCompleted(true)
                toast.success("your document has been successfully trained")
                return true; // Successfully completed
            }

            return false; // Not complete yet

        } catch (error) {
            console.error("Error checking indices:", error);
            // toast.error("unable to train your file!")
            // setisTrainCompleted(false)
            return false;
        }
    };

    // Create a controlled polling mechanism
    const startPolling = async () => {
        // Clear any existing polling
        if (pollingRef.current) {
            clearTimeout(pollingRef.current);
        }

        const poll = async () => {
            const isComplete = await checkIndices();

            if (isComplete) {
                // Stop polling if complete
                clearTimeout(pollingRef.current);

                pollingRef.current = null;
            } else if (isTrainingProgress) {
                // Only increase polling interval if not dealing with a large document
                if (!isLargeDocument) {
                    setPollingInterval(prev => Math.min(prev + pollingIncrement, maxPollingInterval));
                }

                // Schedule next poll
                pollingRef.current = setTimeout(poll, pollingInterval);

            }
        };

        // Start polling
        poll();
    };

    // Run initial check on component mount or when document changes
    useEffect(() => {
        if (!userId || !currentDocumentId) return;

        // Check immediately on refresh in case it's already complete
        checkIndices();

        return () => {
            // Clean up any polling on unmount
            if (pollingRef.current) {
                clearTimeout(pollingRef.current);
            }
        };
    }, [currentDocumentId, userId]);

    // Set up polling based on training progress
    useEffect(() => {
        if (!isTrainingProgress || !userId || !currentDocumentId) {
            // Clear any polling if not in training mode
            if (pollingRef.current) {
                clearTimeout(pollingRef.current);
                pollingRef.current = null;
            }
            return;
        }

        // Reset polling interval when training starts
        setPollingInterval(isLargeDocument ? 30000 : 2000);

        // Log the wait time for debugging
        console.log(`Initial wait time for ${pages} pages: ${initialCheckTime / 1000} seconds (${initialCheckTime / 60000} minutes)`);

        // Start with initial waiting period before polling
        const initialTimer = setTimeout(() => {
            startPolling();
        }, initialCheckTime);

        return () => {
            clearTimeout(initialTimer);
            if (pollingRef.current) {
                clearTimeout(pollingRef.current);
            }
        };
    }, [isTrainingProgress, currentDocumentId, userId, pages, initialCheckTime, isLargeDocument]);

    return null; // Component doesn't render anything
}