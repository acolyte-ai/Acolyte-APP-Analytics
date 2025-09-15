"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function StudyStreakCard() {
    return (
        <Card className="dark:bg-[#181A1D] bg-[#F3F4F9] px-[29px] py-5  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border p-0
         border-[#B8B8B8] shadow-md  text-white w-full rounded-[7px]">
            <CardContent className="p-4 flex items-center gap-10 max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-4">
                {/* Flame Icon */}
                <div className="dark:bg-[#21221A] bg-[#F7DEBA] p-3 rounded-md  h-full max-[700px]:self-center">
                    <Image
                        src="/yellowFire.svg" // Make sure the image is placed correctly
                        alt="Flame Icon"
                        width={24}
                        height={24}
                        className="w-[70px] h-full"
                    />
                </div>

                {/* Text Content */}
                <div className="font-pt-sans max-[700px]:text-center">
                    <p className="text-[26px] max-sm:text-[14px] text-black dark:text-white ">
                        You&apos;ve maintained your{" "}
                        <span className="text-[#CF8A25] font-semibold">
                            12-day study streak!
                        </span>
                    </p>
                    <p className="text-[22px] max-sm:text-[12px] text-[#8C8C8C] mt-5 max-[700px]:mt-3">
                        Ultimate medical prep user broge has an 8-day streak — show them it&apos;s done.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
