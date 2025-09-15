import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import SuccessAnimation from '../quiz-stages/animationSuccess';
import { Card, CardContent } from '@/components/ui/card';
import useUserId from '@/hooks/useUserId';
import { useRouter } from "next/navigation"
import Image from 'next/image';
import insta from "@/public/instagram.svg"
import whiteInsta from "@/public/whiteInsta.svg"
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
    next: () => void;
}

const DiagnosisResult: React.FC<Props> = ({ next }) => {
    const [showAnimation, setShowAnimation] = useState(true);
    const userId = useUserId();
    const router = useRouter();
    useEffect(() => {
        const timer = setTimeout(() => setShowAnimation(false), 6000); // 0.5 seconds
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className=" flex items-center justify-center h-full w-full  p-4 font-pt-sans bg-[url(/bg-blue.svg)] bg-center">
            {
                showAnimation ? <SuccessAnimation /> :


                    (
                        <ScrollArea className='h-full w-full' >
                            <div className=" py-8 px-2  max-w-sm w-full text-center flex flex-col items-center justify-center  text-white">
                                <h2 className="text-2xl tracking-wider font-semibold mb-8">Diagnosis of the day</h2>

                                <div className="flex justify-center mb-6">
                                    <div className="bg-emerald-500 rounded-full p-4">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-8 w-8 text-white font-bold"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>

                                <h1 className="text-4xl font-[900] mb-1 ">Spot on!</h1>
                                <small className='text-gray-400 mb-6 text-base'>That&apos;s a textbook diagnosis, Doc.</small>

                                <div className="bg-teal-800/50 text-emerald-300 flex rounded-xl px-6 py-1.5 items-center justify-center w-fit mb-14 text-xl font-medium">
                                    <p className='text-white'>Streak 5 </p> <span className="text-emerald-400">+10 XP</span>
                                </div>



                                <p className="text-xl leading-6 mb-6 ">
                                    Stay on top of the leaderboard <br />and win exciting Prizes !
                                </p>

                                <p className="text-lg mb-6">
                                    You&apos;re currently <span className="text-emerald-400">#11</span>
                                </p>

                                <Button className="bg-emerald-500 hover:bg-green-500 font-bold w-full text-black text-lg mb-12  py-4 px-6 rounded-lg shadow-md transition-all duration-300"
                                    onClick={() => {


                                        // if logged in go to /dashboard/leaderboard page // private
                                        if (userId) {
                                            router.push("/dashboard/leaderboard")
                                        } else {
                                            router.push("/auth/secure-spot")
                                        }



                                        // if not logged
                                    }}
                                >
                                    See leaderboard
                                </Button>

                                <Card className="bg-[#143A3A] border-none w-full overflow-hidden mb-8">
                                    <CardContent className="p-4  flex flex-col items-center space-y-3 w-full">
                                        <div className="flex items-center space-x-3 self-start">
                                            {/* Instagram logo with gradient */}
                                            <Image
                                                src={insta}
                                                alt="img"
                                                width={15}
                                                height={15}
                                                className="w-5 h-5 object-contain"
                                            />

                                            <h2 className="text-white text-lg font-semibold text-nowrap tracking-wider" >Join Our Instagram Community</h2>
                                        </div>

                                        <p className="text-gray-400 tracking-wide text-xs text-start font-thin">
                                            Follow us on Instagram to see weekly results announcements and be part of our media community.
                                        </p>

                                        <Button className="w-full bg-gradient-to-tr from-[#FFCB00] via-[#FF0113] to-[#DB00A8]
                                                  text-white font-medium py-3 rounded-md transition-opacity shadow-sm">
                                            <Image
                                                src={whiteInsta}
                                                alt="img"
                                                width={15}
                                                height={15}
                                                className="w-5 h-5 object-contain "
                                            />
                                            Follow @acolyte_in
                                        </Button>

                                        <p className="text-gray-100 tracking-wide font-extralight text-[10px] mt-2 text-start w-full">
                                            Prize winners are announced every week on our Instagram page!
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </ScrollArea>
                    )
            }


        </div>
    );
};

export default DiagnosisResult;
