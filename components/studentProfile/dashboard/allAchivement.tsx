import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExpandIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import fire from "@/public/yellowFire.svg";
import brain from "@/public/yellowBrain.svg";
import badge from "@/public/yellowBadge.svg";
import peer from "@/public/yellowGroup.svg";
import expand from "@/public/expandAchievements.svg"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Achievements } from "@/components/Dashboards/student-profile/profileTypes";


type Achievement = {
    id: number;
    label: string;
    icon: string; // Path to image/icon
};


export default function AchievementDialog({ data }: { data: Achievements[] }) {


    return (
        <Dialog>
            <DialogTrigger asChild className="p-0  mt-0">
                <Button variant={"ghost"} size={"icon"} className="bg-[#F3F4F9] m-0 mt-0 dark:bg-[#1C2626] w-[18px] h-[18px]">
                    <Image src={expand} alt={"expand"} width={30}
                        height={30} className=" object-contain h-full w-full dark:contrast-100 contrast-50" />

                </Button>
            </DialogTrigger>

            {/* <DialogContent className=" border-0 bg-transparent
            dark:bg-transparent text-white h-[400px] w-[885px] ">
                <DialogHeader className="flex items-start justify-start w-full text-[18px]">
                    <DialogTitle className=" font-bold bg-transparent">Achievement</DialogTitle>

                </DialogHeader>
                <div className="h-full  w-[885px] font-pt-sans dark:bg-[#181A1D] bg-[#F3F4F9] px-[22px] py-[47px]  rounded-[9px] ">


                    <ScrollArea className="w-full ">
                        <div className="flex flex-wrap gap-[34px]">
                            {achievements.map((item) => (
                                <div key={item.id}
                                    className="dark:bg-[#181A1D] bg-[#F3F4F9] flex-col flex
                                     items-center justify-center text-center text-white hover:bg-[#2a2a2a] transition"
                                >
                                    <div className="mb-2 bg-[#21221A]  flex items-center justify-center rounded-[9px] w-[46px] h-[42px]">
                                        <Image src={item.icon} alt={item.label} width={20}
                                            height={20} className=" object-contain h-6 w-[17px]" />
                                    </div>

                                    <span className="text-white text-base">{item.label}</span>
                                </div>
                            ))}
                        </div>

                    </ScrollArea>
                </div>
            </DialogContent> */}


            <DialogContent className="border-0 bg-transparent dark:bg-transparent text-white mx-auto md:max-w-[885px] max-w-[350px] sm:max-w-[600px]  fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <DialogHeader className="flex items-center justify-between w-full text-[18px] mb-4">
                    <DialogTitle className="font-bold bg-transparent w-full">Achievement</DialogTitle>
                    {/* <DialogClose className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose> */}
                </DialogHeader>

                <div className="h-[400px] w-full font-pt-sans dark:bg-[#181A1D] bg-[#F3F4F9] px-[22px] py-[47px] rounded-[9px]">
                    <ScrollArea className="w-full h-full overflow-hidden">
                        <div className="grid xl:grid-cols-5 gap-6 max-sm:grid-cols-2 sm:grid-cols-4 justify-items-center place-items-center">
                            {data.map((item, index) => (
                                <div key={index}
                                    className="flex flex-col items-center justify-center text-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                                >
                                    <Tooltip>
                                        <TooltipTrigger asChild>

                                            <div className="mb-3 bg-[#21221A] flex items-center justify-center rounded-[9px] w-[46px] h-[42px] shadow-lg">
                                                <Image
                                                    src={item.icon}
                                                    alt={item.title}
                                                    width={20}
                                                    height={20}
                                                    className="object-contain h-6 w-[17px]"
                                                />
                                            </div>





                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>      {item.title}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <span className="text-white dark:text-white text-sm font-medium max-w-[80px] leading-tight truncate">
                                        {item.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
