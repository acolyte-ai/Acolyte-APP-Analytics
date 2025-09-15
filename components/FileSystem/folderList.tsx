import React from 'react';
import Image from "next/image";
import folderIcon from "@/public/foldersIcon/humanFolder.svg"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import physiology from "@/public/foldersIcon/lungs.svg"
import Pathology from "@/public/foldersIcon/pathology.svg"
import chemistry from "@/public/foldersIcon/bioChemistry.svg"
import Anatomy from "@/public/foldersIcon/Anatomy.svg"
import Microbiology from "@/public/foldersIcon/microbiology.svg"
import Orthopedics from "@/public/foldersIcon/ortho.svg"
import Pediatrics from "@/public/foldersIcon/pediatrics.svg"
import cardiology from "@/public/foldersIcon/cardio.svg"
import oncology from "@/public/foldersIcon/oncology.svg"
import pharma from "@/public/foldersIcon/pharma.svg"
import dermatology from "@/public/foldersIcon/derma.svg"
import emergency from "@/public/foldersIcon/emergency.svg"
import psychiatry from "@/public/foldersIcon/psychiatrics.svg"
import obstetrics from "@/public/foldersIcon/cyg.svg"
import xray from "@/public/foldersIcon/x-ray.svg"

interface CourseProgressProps {
    title: string;
    subtitle: string;
    daysAgo: number;
    progress: {
        completed: number;
        total: number;
    };
    editItem: string;
    id: string;
    renameItem: (input: string, value: string) => void;
    changeEditItem: (val: null | string) => void;
    type: string;
    formatedDate: () => string;
    openFile: () => void;
    fileType: string;
}

const CourseProgress: React.FC<CourseProgressProps> = ({
    title,
    subtitle,
    daysAgo,
    progress,
    editItem,
    parentId,
    id,
    renameItem,
    changeEditItem,
    type,
    formatedDate,
    openFile,
    fileType
}) => {
    // Calculate progress percentage
    const progressPercentage = (progress.completed / progress.total) * 100;

    function folderIconFunction(subject: string) {
        const folderIconMap = {
            "folder-anatomy": Anatomy,
            "folder-physiology": physiology,
            "folder-biochemistry": chemistry,
            "folder-micro-biology": Microbiology,
            "folder-pathology": Pathology,
            "folder-pharmacology": pharma,
            "folder-cardiology": cardiology,
            "folder-pediatrics": Pediatrics,
            "folder-obstetrics-and-gyg": obstetrics,
            "folder-orthopedics": Orthopedics,
            "folder-dermatology": dermatology,
            "folder-oncology": oncology,
            "folder-emergency-medicine": emergency,
            "folder-psychiatry": psychiatry,
            "folder-radiology": xray
        };

        return folderIconMap[subject] || null;
    }


    return (
        <div className=" py-5 w-full ">
            {/* */}
            <div className="grid grid-cols-12  grid-rows-2 max-2xl:gap-x-2 gap-x-6 gap-y-[7px]
            ">
                {/* Folder icon */}
                <div className="w-full h-16 max-md:h-12 flex items-center col-span-2 rounded-lg
                justify-center  row-span-3 px-4 py-3 max-md:py-1.5 max-md:px-2 dark:bg-[#1D2527] bg-[#AADACD] "
                    onClick={openFile}>
                    {/* <div className='bg-[#1D2527] rounded-lg py-[7px] px-[9px] max-lg:p-2 w-[52px] h-[54px] flex justify-center items-center '>
                        <Image
                            src={folderIcon}
                            alt={title}
                            className="w-6 h-5  object-cover"
                            priority={true}
                            height={50}
                            width={50}
                        />
                    </div> */}

                    {/* <div className='
                    flex items-center justify-center '> */}
                    <Image
                        src={folderIconFunction(parentId)}
                        alt={title}
                        className="w-10 h-10 object-contain"
                        priority={true}
                        height={20}
                        width={20}
                    />
                    {/* </div> */}

                </div>

                <div className=" text-center w-full col-span-6 tracking-wide row-span-2 items-center justify-start flex" >
                    {editItem === id ? (
                        <div className="w-full transition-all duration-300 ease-in-out">
                            <input
                                type="text"
                                defaultValue={editItem ? "" : title.replace(/\.(pdf|notes)$/, "")}
                                onBlur={(e) => renameItem(id, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        renameItem(id, e.currentTarget.value);
                                    } else if (e.key === "Escape") {
                                        changeEditItem(null);
                                    }
                                }}
                                autoFocus
                                className="text-[18px] font-causten-semibold text-center bg-transparent border-none outline-none
                shadow-none focus:ring-2 focus:ring-orange focus:outline-none
                focus-visible:ring-2 focus-visible:ring-orange
                focus-visible:outline-none h-[1rem] leading-none w-full
                text-gray-700 dark:text-white rounded-lg"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            />
                        </div>
                    ) : (
                        <>
                            {/* <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate max-w-full">
                                        {(fileType === "note" || fileType === "pdf")
                                            ? title.replace(/\.pdf$/, ".note")
                                            : title}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatedDate()}
                                    </p> */}



                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <h2 className="dark:text-white text-black text-[18px] tracking-wider font-causten-semibold truncate"> {(fileType === "note")
                                            ? title.replace(/\.pdf$/, "." + fileType)
                                            : title}</h2>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p> {(fileType === "note")
                                            ? title.replace(/\.pdf$/, "." + fileType)
                                            : title}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </>
                    )}
                </div>


                {/* <span className="dark:text-[#9D9D9D] ttext-black col-span-4 flex items-end
              text-xs w-full justify-end">{daysAgo} days ago</span> */}

                {/* <span className="col-span-2  flex justify-start items-center w-auto h-auto "> */}
                {/* <p className='dark:text-[#747474] text-white dark:bg-[#1D2527] bg-[#36AF8D] px-[7px] py-[1px]
                     text-[10px] truncate rounded-md font-pt-sans font-medium'>{subtitle}</p> */}
                {/* </span> */}

                {/* <div className='flex justify-start w-full col-span-4 items-center h-full'>
                    <div className=" relative h-1 bg-[#2A2D32] rounded-full overflow-hidden
                w-full  max-lg:col-span-4 px-5 ">
                        <div
                            className="absolute top-0  left-0 h-full bg-[#36AF8D] rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div> */}


                {/* <div className="text-xs tracking-wide font-pt-sans w-full  flex items-center justify-end
                 text-[#258055] col-span-4  text-right  ">
                    <span className="h-1 w-1 bg-[#258055] text-right rounded-full mr-3"></span>
                    <span className='text-nowrap text-right truncate  '>{progress.completed}/{progress.total} completed</span>
                </div> */}
            </div>
        </div>

    );
};

export default CourseProgress;
