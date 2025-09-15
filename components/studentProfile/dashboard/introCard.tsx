"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PenSquareIcon } from "lucide-react"
import Image from "next/image"
import userIcon from "@/public/person.svg"
import goldbadge from "@/public/badgeGold.svg"
// import EditProfileForm from "./editProfile"
import { useRouter } from "next/navigation"
import { CardStudent } from "../UI/studentCardUI"
import { ProfileData } from "@/components/Dashboards/student-profile/profileTypes"
// import Falscard from "../assesment/flashCard"


//2xl:gap-[46px]
//

export default function ProfileCard({ data }: { data: ProfileData }) {
    const router = useRouter()
    return (

        <CardStudent className='dark:bg-[#181A1D] bg-[#F3F4F9]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md w-full' title="" description="">
            <div className="flex flex-col sm:flex-row w-full max-md:gap-5 py-[15px] px-[40px] justify-between items-start  xl:h-[113px] sm:items-baseline">
                {/* Left section - Profile info */}
                <div className="flex  flex-row items-start sm:items-center
                      w-full gap-6 max-md:gap-[15px]">
                    {/* Profile image */}
                    <div className="flex-shrink-0 ">
                        <Image
                            src={data?.photo ?? userIcon}
                            alt="Profile"
                            height={60}
                            width={60}
                            className="rounded-full w-[58px] h-[58px] max-md:w-[70px] max-md:h-[70px]"

                        />
                    </div>

                    {/* Profile details */}
                    <div className="flex flex-col  justify-start items-start w-full
                    gap-[10px] max-md:gap-[11px]
                ">
                        {/* Name and badge */}
                        <div className="flex items-center justify-start

                          flex-col
                          sm:flex-row
                          gap-6 max-md:gap-2
                        ">
                            <h2 className="xl:text-[28px] text-[23px] max-md:text-[28px]
                                                     font-medium dark:text-white text-[#184C3D]">
                                {data?.username ?? "--"}
                            </h2>

                            <Badge className="bg-[#F7DEBA] dark:bg-[#2C2C2A]
                            flex items-center px-[10px] py-1 gap-2


                            rounded-md text-[#CF8A25] dark:text-[#CF8A25]">
                                <Image
                                    src={goldbadge}
                                    alt="Badge"
                                    height={12}
                                    width={12}
                                    className="rounded-full object-fill h-4.5 w-4.5"
                                />
                                <p className="text-sm max-md:text-xs
                           whitespace-nowrap font-medium">
                                    {data?.enrolled_for ?? "--"}
                                </p>
                            </Badge>
                        </div>

                        {/* Academic info */}
                        <div className="flex flex-wrap max-sm:hidden font-pt-sans max-md:w-full
                          items-end gap-3">
                            <span className="text-[14px] xl:text-[15px] max-md:text-[15px]
                             font-medium text-[#919191]">
                                {data?.degree ?? "--"}
                            </span>

                            <span className="text-[14px] xl:text-[15px] max-md:text-[15px]
                             font-medium text-[#919191]">
                                &bull; {data?.year ?? "--"}
                            </span>

                            <span className="text-[14px] xl:text-[15px] max-md:text-[15px]
                             font-medium text-[#919191]
                             truncate max-w-full sm:max-w-[200px] md:max-w-full">
                                &bull; {data?.college ?? "--"}
                            </span>
                        </div>


                    </div>


                </div>

                {/* Academic info */}
                <div className="flex flex-wrap sm:hidden font-pt-sans max-md:w-full
                          items-end gap-3">
                    <span className="text-[14px] xl:text-[15px] max-md:text-[15px]
                             font-medium text-[#919191]">
                        {data?.degree ?? "--"}
                    </span>

                    <span className="text-[14px] xl:text-[15px] max-md:text-[15px]
                             font-medium text-[#919191]">
                        &bull; {data?.year ?? "--"}
                    </span>

                    <span className="text-[14px] xl:text-[15px] max-md:text-[15px]
                             font-medium text-[#919191]
                             truncate max-w-full sm:max-w-[200px] md:max-w-full">
                        &bull; {data?.college ?? "--"}
                    </span>
                </div>

                {/* Right section - Edit button */}
                <div className="w-full sm:w-auto flex justify-end max-sm:justify-start h-full items-end">
                    <Button
                        onClick={() => router.push("/student-profile/edit")}
                        className="bg-[#F3F4F9] text-black dark:bg-[#282A2E]  max-md:text-[13px] text-[14px] w-[115px] h-[30px]
                         dark:text-white font-medium dark:border-none border border-[#B8B8B8] shadow-sm py-2 px-4 gap-4
                     flex items-center justify-center dark:hover:bg-[#282A2E]/50 hover:bg-[#F3F4F9]/50 hover:text-black dark:hover:text-white
                  "
                        size={"sm"}>
                        <PenSquareIcon className=" xl:w-[18px] xl:h-[18px]
w-[10px] h-[10px] max-md:w-[13px] max-md:h-[13px]" />
                        Edit Info
                    </Button>
                </div>
            </div>
        </CardStudent>


    )
}