import React from 'react';
import { Mail, Phone, MapPin, User } from 'lucide-react'; // Assuming you're using lucide icons

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { CardStudent } from '../UI/studentCardUI';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContactData } from '@/components/Dashboards/student-profile/profileTypes';

//2xl:grid-cols-2
//2xl:hidden
const ContactInfo = ({ data }: { data: ContactData }) => {
    return (

        <CardStudent className='dark:bg-[#181A1D]  bg-[#F3F4F9]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md
         h-[229px] max-lg:h-[190px]  max-lg:py-[18px] max-lg:px-[25px] lg:px-5 lg:py-[26px]  ' title='Contact Information' description=''>
            <ScrollArea className='w-full h-full'>
                <div className=" w-full font-pt-sans grid grid-cols-1 gap-5 ">
                    <div className="flex  gap-3 items-center">
                        <div className="min-w-5 flex items-center justify-center">
                            <Mail className="dark:text-[#2B4C3F]  text-[#36AF8D] w-[22px] h-[22px] max-lg:w-6 max-lg:h-6 xl:w-7 xl:h-7" />
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className="dark:text-[#CBCBCB] text-black text-base  lg:text-[17px]  overflow-hidden text-ellipsis whitespace-nowrap">{data?.email ?? "--"}</p>

                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{data?.email ?? "--"}</p>
                            </TooltipContent>
                        </Tooltip>

                    </div>
                    <div className="flex gap-3  items-center">
                        <div className="min-w-5 flex items-center justify-center">
                            <Phone className="dark:text-[#2B4C3F]  text-[#36AF8D] w-[22px] h-[22px]  max-lg:w-6 max-lg:h-6 xl:w-7 xl:h-7" />
                        </div>
                        <p className="dark:text-[#CBCBCB] text-black text-base  lg:text-[17px]  overflow-hidden text-ellipsis whitespace-nowrap">{data?.phoneno ?? "--"}</p>
                    </div>

                    <div className="flex gap-3 items-center">
                        <div className="min-w-5 flex items-center justify-center">
                            <MapPin className="dark:text-[#2B4C3F]  text-[#36AF8D] w-[22px] h-[22px]  max-lg:w-6 max-lg:h-6 xl:w-7 xl:h-7" />
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className="dark:text-[#CBCBCB] text-black text-base  lg:text-[17px]  overflow-hidden text-ellipsis whitespace-nowrap">{data?.location ?? "--"}</p>

                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{data?.location}</p>
                            </TooltipContent>
                        </Tooltip>

                    </div>

                    <div className="flex gap-3  items-center">
                        <div className="min-w-5 flex items-center justify-center">
                            <User className="dark:text-[#2B4C3F]  text-[#36AF8D] w-[22px] h-[22px] max-lg:w-6 max-lg:h-6 xl:w-7 xl:h-7" />
                        </div>
                        <p className="dark:text-[#CBCBCB] text-black text-base  lg:text-[17px] overflow-hidden text-ellipsis whitespace-nowrap">{data?.studentID ?? "--"}</p>
                    </div>
                </div>
            </ScrollArea>
        </CardStudent>

    );

};

export default ContactInfo;