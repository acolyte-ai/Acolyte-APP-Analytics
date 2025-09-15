
import Image from "next/image"
import userIcon from "@/public/person.svg"
import { CardStudent } from "../studentProfile/UI/studentCardUI"


export default function ProfileInfo({ name }: { name: string }) {
    return (
        <CardStudent className='dark:bg-[#181A1D] bg-[#F3F4F9]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md w-full' title="" description="">
            <div className="flex flex-col sm:flex-row w-full max-md:gap-5 py-4 px-[18px] justify-between items-start  xl:h-[113px] sm:items-baseline">
                {/* Left section - Profile info */}
                <div className="flex  flex-row items-start sm:items-center
                              w-full gap-6 max-md:gap-[15px]">
                    {/* Profile image */}
                    <div className="flex-shrink-0 ">
                        <Image
                            src={userIcon}
                            alt="Profile"
                            height={60}
                            width={60}
                            className="rounded-full w-[58px] h-[58px] max-md:w-[70px] max-md:h-[70px]"

                        />
                    </div>

                    {/* Profile details */}
                    <div className="flex flex-col  justify-start items-start w-full
                            gap-[5px] max-md:gap-[6px]
                        ">
                        {/* Name and badge */}
                        <div className="flex items-center justify-start

                                  flex-col
                                  sm:flex-row
                                  gap-6 max-md:gap-2
                                ">
                            <h2 className="text-[23px] md:text-[25px] xl:text-[30px]
                                                             font-causten-semibold tracking-wider dark:text-white text-[#184C3D]">
                                Welcome,   {name || "John Doe"}
                            </h2>


                        </div>

                        {/* Academic info */}
                        <div className="flex flex-wrap max-sm:hidden font-causten-medium max-md:w-full text-[#919191]
                                  items-end gap-3 text-[14px] md:text-[16px] xl:text-[18px]">
                            You're One step away from mastering something new
                        </div>


                    </div>


                </div>

            </div>
        </CardStudent>

    )
}