import React, { } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import starGroup from "@/public/starGroups.svg"

const FailureAnimation: React.FC = () => {


    const particles = Array.from({ length: 8 });

    return (
        <div className="relative w-full h-full flex items-center justify-center flex-col">
            <AnimatePresence >
                <div className="flex justify-center  mb-6 relative  w-full">


                    <div className="flex justify-center mb-6">
                        <div className="bg-red rounded-full p-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-14 w-14 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>

                </div>
                <p className='text-center mt-14 text-2xl'>Missed it - but hey, real<br />
                    medicine&apos;s messy too.
                </p>

                <p className='text-center mt-10 text-2xl'>Tomorrow&apos;s a new case!
                </p>
            </AnimatePresence>



        </div>
    );
};

export default FailureAnimation;
