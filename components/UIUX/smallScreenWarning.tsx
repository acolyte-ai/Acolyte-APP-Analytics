"use client"
import React, { useState, useEffect } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Phone, Tablet, Monitor } from 'lucide-react';

const SmallScreenWarning = () => {
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check screen size on component mount and window resize
        const checkScreenSize = () => {
            const smallScreenThreshold = 768; // Typical tablet breakpoint
            const isSmall = window.innerWidth < smallScreenThreshold;
            const warningAccepted = isSmall && localStorage.getItem("aco-ssw") === null
            console.log("sas=>", localStorage.getItem("aco-ssw"), warningAccepted)
            setIsSmallScreen(warningAccepted);
            setIsOpen(warningAccepted);

        };

        // Initial check
        checkScreenSize();

        // Add event listener for resize
        window.addEventListener('resize', checkScreenSize);

        // Clean up event listener
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Close dialog handler
    const handleClose = () => {
        localStorage.setItem("aco-ssw", "true")
        setIsOpen(false);
    };

    return (
        <>
            {isSmallScreen && (
                <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                    <AlertDialogContent className="max-w-md max-sm:max-w-sm z-[3000]">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-lg font-bold text-center">
                                Small Screen Detected
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-center">
                                <div className="flex justify-center space-x-4 my-4">
                                    <Phone className="w-8 h-8 text-red-500" />
                                    <Tablet className="w-10 h-10 text-amber-500" />
                                    <Monitor className="w-12 h-12 text-green-500" />
                                </div>
                                <p className="mt-2">
                                    For the best experience, please use a desktop computer or tablet.
                                </p>
                                <p className="mt-2 text-sm text-gray-500">
                                    Some features may not display correctly on smaller screens.
                                </p>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex justify-center">
                            <AlertDialogAction
                                onClick={handleClose}
                                className="bg-blue-600 hover:bg-blue-700 bg-zinc-800 dark:bg-zinc-800 dark:text-white text-black px-4 py-2 rounded shadow-md"
                            >
                                Continue Anyway
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
};

export default SmallScreenWarning;