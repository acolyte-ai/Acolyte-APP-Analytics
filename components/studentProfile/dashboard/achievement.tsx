import Image from "next/image";
import { CardStudent } from "../UI/studentCardUI";
import { Achievements } from "@/components/Dashboards/student-profile/profileTypes";

// Remove the unused imports - they were causing path confusion

const achievements = [
    { title: "Streak Master", icon: "/fire.svg" },
    { title: "Anatomy Ace", icon: "/yellowBrain.svg" },
    { title: "Quiz Topper", icon: "/yellowBadge.svg" },
    { title: "Peer Helper", icon: "/yellowGroup.svg" },
    { title: "Quiz Topper", icon: "/yellowBadge.svg" },
    { title: "Peer Helper", icon: "/yellowGroup.svg" },
];

export default function Achievement({ data }: { data: Achievements[] }) {
    return (
        <CardStudent className='h-full  bg-[#EBEBF5] dark:bg-[#0F1012] ' title='Achievement' description=''>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3  gap-[14px] max-sm:gap-4 xl:gap-[17px]
                    font-pt-sans">
                {(data && data.length > 0) ?
                    data.map((achieve, index) => (
                        <div
                            key={index}
                            className="dark:bg-[#181A1D] bg-[#F3F4F9]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md
                                           rounded-lg sm:rounded-xl gap-[8px] max-sm:gap-[14px] xl:gap-[14px]
                      flex flex-col items-center justify-center
                      text-center text-white py-[22px] max-sm:px-4 max-sm:py-[27px]
                      dark:hover:bg-[#2a2a2a] hover:bg-[#F3F4F9]/70 transition h-[94px] max-sm:h-[136px] xl:h-[113px]
                      "
                        >
                            <div className="
                          dark:bg-[#21221A] bg-[#F7DEBA]
                          py-[10px] w-[42px] h-[42px] max-sm:py-3 max-sm:px-[15px] xl:h-[52px]
                          flex items-center justify-center
                          rounded-[6px] sm:rounded-[7px] md:rounded-[8px] lg:rounded-[9px]">
                                <div className="relative">
                                    <Image
                                        src={achieve.icon}
                                        alt={achieve.title}
                                        width={30}
                                        height={30}
                                        className="object-contain h-[17px] w-[23px] max-sm:h-7 max-sm:w-5  xl:h-7 xl:w-5 "
                                    />
                                </div>
                            </div>
                            <span className="dark:text-[#D7D7D7] text-black text-[12px] max-sm:text-[15px] xl:text-[15px]">
                                {achieve.title}
                            </span>
                        </div>
                    )) :
                    achievements.map((achieve, index) => (
                        <div
                            key={index}
                            className="dark:bg-[#181A1D] bg-[#F3F4F9]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md
                                           rounded-lg sm:rounded-xl gap-[8px] max-sm:gap-[14px] xl:gap-[14px]
                      flex flex-col items-center justify-center
                      text-center text-white py-[22px] max-sm:px-4 max-sm:py-[27px]
                      dark:hover:bg-[#2a2a2a]  hover:bg-[#F3F4F9]/70 transition h-[94px] max-sm:h-[136px] xl:h-[113px]
                      "
                        >
                            <div className="
                          dark:bg-[#21221A] bg-[#F7DEBA]
                          py-[10px] w-[42px] h-[42px] max-sm:py-3 max-sm:px-[15px] xl:h-[52px]
                          flex items-center justify-center
                          rounded-[6px] sm:rounded-[7px] md:rounded-[8px] lg:rounded-[9px]">
                                <div className="relative">
                                    <Image
                                        src={achieve.icon}
                                        alt={achieve.title}
                                        width={30}
                                        height={30}
                                        className="object-contain h-[17px] w-[23px] max-sm:h-7 max-sm:w-5 grayscale  xl:h-7 xl:w-5 "
                                    />
                                </div>
                            </div>
                            <span className="dark:text-[#D7D7D7] text-black text-[12px] max-sm:text-[15px] xl:text-[15px]">
                                {achieve.title}
                            </span>
                        </div>
                    ))
                }
            </div>
        </CardStudent>
    );
}