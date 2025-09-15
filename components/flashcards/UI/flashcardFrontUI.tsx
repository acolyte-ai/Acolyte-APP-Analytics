import React, { useEffect, useState } from 'react';
import { RiVoiceprintFill } from "react-icons/ri";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from "next/image"
import dna from "@/public/dna.svg"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Bookmark } from 'lucide-react';
import axios from 'axios';
import useUserId from '@/hooks/useUserId';
import { toast } from 'sonner';
interface Props {
    flipFn?: () => void;
    heading: string;
    readMore: string;
    handleGEtFlashCard?: () => void;
    handleBookmark?: (id: string, heading: string) => void;
    handleBookmarkDelete?: (id: string, heading: string) => void;
    id?: string;
    bookmark?: boolean;
}

export default function Flashcard({ flipFn, heading, readMore, handleGEtFlashCard, id, handleBookmarkDelete, handleBookmark, bookmark }: Props) {
    const [more, setMore] = useState(false)
    const [bookmarked, setBookmark] = useState(false)
    const userId = useUserId()

    useEffect(() => {
        setBookmark(bookmark ?? false)
    }, [bookmark])

    const profiles = [
        {
            id: 1,
            name: "John Doe",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
            fallback: "JD"
        },
        {
            id: 2,
            name: "Jane Smith",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
            fallback: "JS"
        },
        {
            id: 3,
            name: "Mike Johnson",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
            fallback: "MJ"
        }
    ];

    return (
        <div className="relative w-full  p-0 grid grid-cols-2  font-pt-sans place-items-center overflow-hidden" onClick={() => handleGEtFlashCard ? handleGEtFlashCard() : ""}>
            {/* Top Left - Flashcard label */}
            {!more && <div className="col-span-2 w-full flex items-center justify-between">
                <div className="dark:text-white text-[#515151] bg-[#F3F4F9] bg-gradient-to-t dark:from-[#26282C] dark:to-[#181A1D] border dark:border-[#191B21] border-[#B8B8B8]
                       text-[22px] max-sm:text-[10px] max-sm:text-sm font-medium px-4 py-2 max-sm:py-[3px] max-sm:px-[7px] rounded-full shadow-md ">
                    Flashcard
                </div>
                {/* <div className="flex items-center ">
                    {profiles.map((profile, index) => (
                        <Avatar
                            key={profile.id}
                            className={`w-12 h-12 max-sm:w-[19px] max-sm:h-[19px] border-2 dark:border-[#202329] border-[#E0CCF9] ${index > 0 ? '-ml-4 max-sm:-ml-1' : ''}`}
                        >
                            <AvatarImage
                                src={profile.avatar}
                                alt={profile.name}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-gray-500 text-white font-semibold">
                                {profile.fallback}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                </div> */}
            </div>}

            {/* Title */}


            <div className={`w-full overflow-y-auto ${more ? "h-[180px]" : "h-[140px]"}  max-sm:h-[38px] no-scrollbar
              mt-8 max-sm:mt-[11px] mb-4 col-span-2  overflow-hidden flex items-start flex-col
              justify-start cursor-pointer`} onClick={flipFn}>
                <div className="w-full h-auto overflow-y-scroll no-scrollbar">
                    <Tooltip>
                        <TooltipTrigger asChild>

                            <p className="text-[45px] xl:text-[54px] max-sm:text-2xl truncate
                             font-bold dark:text-white text-black uppercase text-nowrap mb-6
                              overflow-hidden whitespace-nowrap max-sm:max-w-[300px]  max-w-[500px]">
                                {heading}
                            </p>

                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                            <p className="break-words">{heading}</p>
                        </TooltipContent>
                    </Tooltip>

                    {more && <p className='text-[#6D7688] text-[28px]  font-medium font-pt-sans max-sm:text-[13px] mt-0  cursor-pointer'>
                        {readMore}
                    </p>}

                </div>
            </div>




            {/* Bottom Right - Audio icon */}
            <div className={`${more ? "col-span-2 w-full flex items-center justify-end" : "col-span-2 w-full flex items-center justify-between"} `}>
                {/* {more && <div className="flex items-center ">
                    {profiles.map((profile, index) => (
                        <Avatar
                            key={profile.id}
                            className={`w-12 h-12  max-sm:w-[19px] max-sm:h-[19px] border-2 border-[#202329] ${index > 0 ? '-ml-4 max-sm:-ml-1' : ''}`}
                        >
                            <AvatarImage
                                src={profile.avatar}
                                alt={profile.name}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-gray-500 text-white font-semibold">
                                {profile.fallback}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                </div>} */}
                {

                    !more &&

                    <div className="col-span-1 w-auto flex items-center justify-start" onClick={() => {
                        setMore(true)

                    }

                    }>
                        <p className=' text-[#6D7688] max-sm:text-[13px]  text-[28px] font-medium font-pt-sans' >Read more...</p>
                    </div>
                }
                <div className='flex space-x-4' >
                    <button className={`w-[76px] h-[76px] max-sm:h-[35px] cursor-pointer max-sm:w-[35px] max-sm:p-[10px] px-[19px] mb-2
                     py-[22px] dark:bg-gradient-to-r dark:from-[#262A32] dark:to-[#1E2228] bg-white  border dark:border-[#15181d] border-[#E0CCF9]
                     rounded-full flex items-center justify-center shadow-lg pointer-events-auto relative  ${handleBookmark && handleBookmarkDelete ? "" : ""}`} onClick={() => {
                            if (handleBookmark && handleBookmarkDelete) {
                                if (!bookmarked) {
                                    handleBookmark(id, heading)
                                    setBookmark(true)
                                } else {
                                    handleBookmarkDelete(id, heading)
                                    setBookmark(false)
                                }
                            }


                        }}

                    >
                        <Bookmark className={` text-[#36AF8D] dark:brightness-100 brightness-75 ${bookmarked ? "fill-[#36AF8D]" : "dark:fill-[#25272B] fill-white"} `} size={30} />
                    </button>

                    <button className="w-[76px] h-[76px] max-sm:h-[35px] max-sm:w-[35px] max-sm:p-[10px] px-[19px] py-[22px] bg-white  dark:bg-gradient-to-r dark:from-[#262A32] dark:to-[#1E2228] border dark:border-[#15181d] border-[#E0CCF9] rounded-full flex items-center justify-center shadow-lg">
                        <RiVoiceprintFill className="dark:text-[#36AF8D] text-[#36AF8D] dark:brightness-100 brightness-75 " size={30} />
                    </button>
                </div>


            </div>

            <div className=" absolute -right-10 -top-14  max-sm:-right-5 max-sm:-top-7">
                <Image
                    src={dna}
                    alt="dna"
                    height={30}
                    width={30}
                    className="h-72 w-72 max-sm:h-40 max-sm:w-40 darK:opacity-0 opacity-30 "
                />
            </div>
        </div >
    );
};

//  dark:bg-gradient-to-r dark:from-[#25272B] dark:to-[#191B1E]  dark:text-zinc-100  dark:bg-white/10 dark:text-white