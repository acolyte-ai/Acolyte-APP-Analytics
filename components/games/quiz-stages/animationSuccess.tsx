'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import starGroup from "@/public/starGroups.svg";

const SuccessAnimation: React.FC = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timeouts = [
            setTimeout(() => setStep(1), 500),   // Show checkIcon
            setTimeout(() => setStep(2), 1500),  // Show checkIcon + starGroup
            setTimeout(() => setStep(3), 2500),  // Show all
        ];
        return () => timeouts.forEach(clearTimeout);
    }, []);

    const bounceTransition = {
        type: "spring",
        stiffness: 300,
        damping: 15,
        bounce: 0.4,
    };

    const checkIcon = (
        <motion.div
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={bounceTransition}
            className="bg-emerald-500 rounded-full p-4 z-10"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white font-bold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" />
            </svg>
        </motion.div>
    );

    const starGroupImage = (
        <motion.div
            key="stars"
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={bounceTransition}
            className="absolute -top-20 w-[250px] flex justify-center"
        >
            <Image
                src={starGroup}
                height={25}
                width={25}
                alt="Star Group"
                className="object-contain h-[250px] w-full"
            />
        </motion.div>
    );

    return (
        <div className="relative  flex items-center justify-center flex-col">
            <div className="relative h-full w-full flex justify-center items-center mb-6">
                <AnimatePresence>
                    {(step === 2 || step === 3) && starGroupImage}
                </AnimatePresence>

                <AnimatePresence>
                    {(step >= 1) && checkIcon}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {step === 3 && (
                    <motion.p
                        key="message"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={bounceTransition}
                        className="text-center mt-36 text-2xl"
                    >
                        You&apos;ve made your Diagnosis
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SuccessAnimation;
