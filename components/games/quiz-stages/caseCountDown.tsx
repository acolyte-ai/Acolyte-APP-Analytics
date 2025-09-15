import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image"
import halfHeart from "@/public/heartBroken.svg"
import heart from "@/public/greenheart.svg"
import thermo from "@/public/thermometergreen.svg"

interface Props {
    next: () => void
}

const CaseCountdown: React.FC<Props> = ({ next }) => {
    const [minutes, setMinutes] = useState(1);
    const [seconds, setSeconds] = useState(20);

    useEffect(() => {
        const timer = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
            }
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(timer);
                    // TODO: Handle time up action here
                } else {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [minutes, seconds]);


    const formatTime = (time: number) => (time < 10 ? `0${time}` : time);

    return (
        <div className="flex flex-col items-center justify-center h-full  p-10 font-pt-sans bg-[url(/bg-blue.svg)] bg-center">
            <h2 className="text-2xl font-bold -mt-4 mb-6">Stay sharp–case opens in:</h2>
            <div className="text-7xl font-bold text-emerald-400 mb-8">
                {formatTime(minutes)}:{formatTime(seconds)}
            </div>

            <div className="bg-[#143A3A] p-6 rounded-2xl w-full max-w-md text-left mb-10">
                <p className="mb-4 text-xl font-semibold">
                    42 year old male with sudden chest pain and shortness of breath arrives at ER.
                </p>

                <div className="mb-4 w-full grid grid-cols-2 gap-y-2">
                    <p className="text-emerald-400 font-semibold text-lg mb-2 col-span-2  w-full
                    ">PATIENT</p>
                    <div className="flex items-center gap-1 col-span-1">
                        <Image
                            src={halfHeart}
                            alt="img"
                            width={15}
                            height={15}
                            className="w-5 h-5 object-contain"
                        />
                        <p>Gender : Male</p>
                    </div>

                    <div className="flex items-center gap-1 col-span-1">
                        <Image
                            src={thermo}
                            alt="img"
                            width={15}
                            height={15}
                            className="w-5 h-5 object-contain"
                        />
                        <p>Age : 42 years</p>
                    </div>

                    <div className="flex items-center gap-1 col-span-2">
                        <Image
                            src={heart}
                            alt="img"
                            width={15}
                            height={15}
                            className="w-5 h-5 object-contain"
                        />
                        <p>Smoker, hypertension</p>
                    </div>
                </div>

                {/* <div>
                    <p className="text-emerald-400 font-semibold text-lg mb-4">CLINICAL EVIDENCE</p>
                    <div className="grid grid-cols-2 gap-2">
                        <p>BP : 160/95 mmHg</p>
                        <p>RR : 24 min</p>
                        <p>HR : 110 bpm</p>
                        <p>SpO₂ : 94%</p>
                    </div>
                </div> */}
            </div>

            <Button className="bg-emerald-400 dark:bg-emerald-400 hover:bg-green-500 font-bold w-full text-black text-lg mb-5  py-6 px-6 rounded-lg shadow-md transition-all duration-300"
                onClick={next}
            >
                Open the Case
            </Button>

            <p className="text-lg text-white text-center">
                You’ll have 60 seconds once you tap start.
            </p>
        </div>
    );
};

export default CaseCountdown;
