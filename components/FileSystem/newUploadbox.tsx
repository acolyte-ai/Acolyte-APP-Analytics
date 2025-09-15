import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ScrollArea, } from "@/components/ui/scroll-area";
import Image from "next/image"

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSettings } from "@/context/store";


// const subjects = [
//     { img: Anatomy, title: "Anatomy" },
//     { img: physiology, title: "Physiology" },
//     { img: oncology, title: "Oncology" },
//     { img: Pathology, title: "Pathology" },
//     { img: cardiology, title: "Cardiology" },
//     { img: Pediatrics, title: "Pediatrics" },
//     { img: obstetrics, title: "Obstetrics & GyG" },
//     { img: Orthopedics, title: "Orthopedics" },
//     { img: dermatology, title: "Dermatology" },
//     { img: oncology, title: "Oncology" },
//     { img: emergency, title: "Emergency Medicine" },
//     { img: psychiatry, title: "Psychiatry" },
//     { img: pharma, title: "Pharmacology" },
//     { img: Microbiology, title: "Micro Biology" },
//     { img: chemistry, title: "Biochemistry" },
//     { img: xray, title: "Radiology" }
// ];


const subjects = [
    { img: Anatomy, title: "Anatomy" },
    { img: physiology, title: "Physiology" },
    { img: chemistry, title: "Biochemistry" },
    { img: Microbiology, title: "Micro Biology" },
    { img: Pathology, title: "Pathology" },
    { img: pharma, title: "Pharmacology" },
    { img: cardiology, title: "Cardiology" },
    { img: Pediatrics, title: "Pediatrics" },
    { img: obstetrics, title: "Obstetrics & GyG" },
    { img: Orthopedics, title: "Orthopedics" },
    { img: dermatology, title: "Dermatology" },
    { img: oncology, title: "Oncology" },
    { img: emergency, title: "Emergency Medicine" },
    { img: psychiatry, title: "Psychiatry" },
    { img: xray, title: "Radiology" }
]




const bodySystem = [
    // { img: cardiology, title: "Cardiology" },
    // { img: Pediatrics, title: "Pediatrics" },
    // { img: obstetrics, title: "Obstetrics & GyG" },
    // { img: Orthopedics, title: "Orthopedics" },
    // { img: dermatology, title: "Dermatology" },
    // { img: oncology, title: "Oncology" },
    // { img: emergency, title: "Emergency Medicine" },
    // { img: psychiatry, title: "Psychiatry" },
    // { img: xray, title: "Radiology" }
]


const UploadFilePopUp = ({ selectedFile, onSaveFile }) => {
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [selectedSubjectsNew, setSelectedSubjectsNew] = useState([]);
    const [activeTab, setActiveTab] = useState("upload");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTermNew, setSearchTermNew] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { fileSystem, openUploadFiles, setOpenUploadFiles } = useSettings();

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (!openUploadFiles) {
            setSelectedSubjects([]);
            setSelectedSubjectsNew([]);
            setSearchTerm("");
            setSearchTermNew("");
            setActiveTab("upload");
            setIsLoading(false);
        }
    }, [openUploadFiles]);

    // Helper function to create slug from subject name
    const createSlug = (name) => {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, 'and');
    };

    const toggleSubject = (subject) => {
        setSelectedSubjects(prev => {
            // Allow only single selection for folder
            if (prev.includes(subject)) {
                return prev.filter(s => s !== subject);
            } else {
                return [subject]; // Replace with new selection
            }
        });
    };

    const toggleSubjectNew = (subject) => {
        if (!subject.trim()) return;

        setSelectedSubjectsNew(prev => {
            if (prev.includes(subject)) {
                return prev.filter(s => s !== subject);
            } else {
                return [...prev, subject];
            }
        });
        setSearchTermNew("");
    };

    const handleClearSelection = () => {
        setSelectedSubjects([]);
        setSelectedSubjectsNew([]);
        setSearchTerm("");
        setSearchTermNew("");
    };

    const handleCreateFile = async () => {
        if (!selectedFile || selectedSubjects.length === 0) {
            alert("Please select a file and a folder.");
            return;
        }

        setIsLoading(true);

        try {
            // Call the parent component's save function
            await onSaveFile(selectedFile, selectedSubjects[0]);

            // Close dialog and reset state
            setOpenUploadFiles(false);
            setSelectedSubjects([]);
            setSelectedSubjectsNew([]);
            setSearchTerm("");
            setSearchTermNew("");

            // Show success message
            console.log("File saved successfully!");
        } catch (error) {
            console.error("Error saving file:", error);
            alert("Error saving file. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        // Clear search or go back to previous state
        if (searchTerm) {
            setSearchTerm("");
        } else {
            console.log("Back button clicked");
        }
    };

    const handleSearch = () => {
        // Search functionality is handled by the filter in render
        console.log("Searching for:", searchTerm);
    };

    const handleAddCustomSubject = () => {
        if (searchTermNew.trim()) {
            toggleSubjectNew(searchTermNew.trim());
        }
    };

    // Check if create button should be enabled
    const isCreateEnabled = selectedSubjects.length > 0 && selectedFile && !isLoading;

    const getCurrentSubjects = () => {
        return activeTab === "upload" ? subjects : bodySystem;
    };

    const filteredSubjects = getCurrentSubjects().filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <Dialog open={openUploadFiles} onOpenChange={setOpenUploadFiles}>
            <DialogContent className="max-sm:max-w-sm h-[600px] max-w-[650px] 2xl:max-w-[830px] w-full
             dark:bg-[#181A1D]  bg-[#F3F4F9] font-[futureHeadline] text-white rounded-[33px] border-none px-0 py-0 mx-auto">
                <div className="w-full h-full pb-10 py-[22px] px-[23px] max-md:p-3">
                    <div className="w-full h-full">
                        {/* Header */}
                        <div className="flex justify-between items-start flex-col pb-3">
                            <h2 className="font-bold text-lg dark:text-white text-[#228367]">
                                Add to medical subject
                            </h2>
                            <p className="text-sm text-[#8A8A8A] font-medium font-pt-sans">
                                {selectedFile ? `Organize "${selectedFile.name}" in your library` : "Organize this pdf in your library"}
                            </p>
                        </div>

                        {/* <Separator className="mb-3" /> */}

                        {/* Selected file info */}
                        {selectedFile && (
                            <div className="mb-4 p-3  rounded-lg dark:bg-[#282A2E] bg-white ">
                                <p className="text-sm font-medium dark:text-white text-gray-800">
                                    Selected File: {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Size: {selectedFile.size}
                                </p>
                            </div>
                        )}

                        {/* Folder Selection */}
                        <div className="w-full pb-[11px] flex flex-col justify-between ">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative ">
                                {/* <TabsList className="grid w-[300px] grid-cols-2 dark:bg-[#181A1D] bg-[#F3F4F9] p-1 h-auto  space-x-2
                            dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md ">

                                    <TabsTrigger
                                        value="upload"
                                        className="bg-[#36AF8D] text-[14px] text-white hover:bg-[#2D8F73] dark:bg-[#36AF8D] dark:text-black dark:hover:bg-[#2D8F73] xl:text-[14px]
                                                                         py-[5px] px-4 xl:py-[6px] xl:px-[18px] data-[state=active]:bg-[#36AF8D] data-[state=active]:text-white dark:data-[state=active]:bg-[#36AF8D] dark:data-[state=active]:text-black
                                                                          rounded-[5px] text-sm font-medium data-[state=inactive]:bg-transparent data-[state=inactive]:text-black dark:data-[state=inactive]:bg-transparent dark:data-[state=inactive]:text-white"
                                    >
                                        By Discipline
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="recent"
                                        className="bg-[#36AF8D] text-[14px] text-black hover:bg-[#2D8F73] dark:bg-[#36AF8D] dark:text-black dark:hover:bg-[#2D8F73] xl:text-[14px]
                                                                         py-[5px] px-4 xl:py-[6px] xl:px-[18px] data-[state=active]:bg-[#36AF8D] data-[state=active]:text-white dark:data-[state=active]:bg-[#36AF8D] dark:data-[state=active]:text-black
                                                                          rounded-[5px] text-sm font-medium data-[state=inactive]:bg-transparent data-[state=inactive]:text-black dark:data-[state=inactive]:bg-transparent dark:data-[state=inactive]:text-white"
                                    >
                                        By Body System
                                    </TabsTrigger>
                                </TabsList> */}

                                {/* Search */}
                                <div className="md:absolute max-md:w-full md:right-0 md:top-1 y-4 max-md:mb-[18px]">
                                    <div className="flex items-center max-md:justify-between gap-2 dark:bg-muted bg-white px-4 shadow-md max-md:px-[3px] max-md:py-[6px] rounded-full w-full max-md:max-w-[360px] md:max-w-[220px] h-8 max-md:h-[22px]">
                                        <div className="w-full flex gap-2 items-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full"
                                                onClick={handleBack}
                                            >
                                                <ArrowLeft className="w-5 h-5 max-md:w-2 max-md:h-2 dark:text-gray-400 text-black" />
                                            </Button>
                                            <Input
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search..."
                                                className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 max-md:text-xs px-0 max-w-36 items-center text-start placeholder:text-muted-foreground"
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full"
                                            onClick={handleSearch}
                                        >
                                            <Search className="w-5 h-5 max-md:w-2 max-md:h-2 dark:text-gray-400 text-black" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Subject Grid */}
                                <TabsContent value="upload" className="w-full mb-2 py-4 mt-12">
                                    <div className="flex items-center w-full h-[220px]  overflow-y-auto no-scrollbar">
                                        <div className="gap-[31px] w-full max-sm:max-w-xs grid grid-cols-8 max-sm:grid-cols-4">
                                            {filteredSubjects.map((subject, index) => (
                                                <div key={index} className="space-y-2 text-center col-span-1">
                                                    <button
                                                        onClick={() => toggleSubject(subject.title)}
                                                        className={cn(
                                                            "w-full flex items-center justify-center rounded-md border py-2 transition-all",
                                                            selectedSubjects.includes(subject.title)
                                                                ? "dark:bg-[#1D2527] bg-[#AADACD] border-[#047857] border-2 text-white shadow-lg transform scale-105"
                                                                : "dark:bg-[#1D2527] bg-[#AADACD] text-gray-300 hover:border-[#047857] hover:shadow-md"
                                                        )}
                                                    >
                                                        <Image
                                                            src={subject.img}
                                                            alt={subject.title}
                                                            className="xl:w-[50px] max-sm:w-[40px] sm:w-[40px] xl:h-[43px] max-sm:h-[31px] sm:h-[34px] object-cover"
                                                            priority={true}
                                                            height={60}
                                                            width={60}
                                                        />
                                                    </button>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <p className={cn(
                                                                "font-pt-sans text-xs font-medium max-w-[60px] text-center truncate",
                                                                selectedSubjects.includes(subject.title)
                                                                    ? "text-[#047857] font-bold"
                                                                    : "text-black dark:text-white"
                                                            )}>
                                                                {subject.title}
                                                            </p>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{subject.title}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="recent" className="w-full mb-[11px] py-4">
                                    <div className="flex items-center w-full">
                                        <div className="gap-[31px] w-full max-sm:max-w-xs grid grid-cols-8 max-sm:grid-cols-4">
                                            {filteredSubjects.map((subject, index) => (
                                                <div key={index} className="space-y-2 text-center col-span-1">
                                                    <button
                                                        onClick={() => toggleSubject(subject.title)}
                                                        className={cn(
                                                            "w-full flex items-center justify-center rounded-md border py-2 transition-all",
                                                            selectedSubjects.includes(subject.title)
                                                                ? "dark:bg-[#1D2527] bg-[#AADACD] border-[#047857] border-2 text-white shadow-lg transform scale-105"
                                                                : "dark:bg-[#1D2527] bg-[#AADACD] text-gray-300 hover:border-[#047857] hover:shadow-md"
                                                        )}
                                                    >
                                                        <Image
                                                            src={subject.img}
                                                            alt={subject.title}
                                                            className="xl:w-[43px] max-sm:w-[31px] sm:w-[34px] xl:h-[43px] max-sm:h-[31px] sm:h-[34px] object-cover"
                                                            priority={true}
                                                            height={60}
                                                            width={60}
                                                        />
                                                    </button>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <p className={cn(
                                                                "font-pt-sans text-xs font-medium max-w-[60px] text-center truncate",
                                                                selectedSubjects.includes(subject.title)
                                                                    ? "text-[#047857] font-bold"
                                                                    : "text-black dark:text-white"
                                                            )}>
                                                                {subject.title}
                                                            </p>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{subject.title}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {/* <Separator className="" /> */}
                        </div>

                        {/* Selected folder display */}
                        {selectedSubjects.length > 0 ? (
                            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                                    Selected Folder: {selectedSubjects[0]}
                                </p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                    Your file will be saved to this folder
                                </p>
                            </div>
                        ) : <div className="h-16"></div>}

                        {/* Action buttons */}
                        <div className="flex justify-end mt-4 gap-4 w-full">
                            <Button
                                onClick={handleClearSelection}
                                className="bg-[#EEEEEE] dark:bg-[#282A2E] border border-[#AFAFAF]
                                 dark:hover:bg-[#EEEEEE] hover:dark:bg-[#282A2E] max-md:text-xs w-36 h-7 px-[5px] py-2 rounded-md dark:text-white text-black "
                            >
                                Clear selection
                            </Button>
                            <Button
                                onClick={handleCreateFile}
                                disabled={!isCreateEnabled}
                                className={cn(
                                    "max-md:text-xs w-36 h-7 px-[5px] py-2 rounded-md text-white transition-all",
                                    isCreateEnabled
                                        ? "bg-[#36AF8D] hover:bg-[#36AF8D] dark:bg-[#36AF8D] dark:hover:bg-[#36AF8D] cursor-pointer"
                                        : "bg-[#36AF8D] dark:bg-[#36AF8D] cursor-not-allowed opacity-50"
                                )}
                            >
                                Add and  Create
                            </Button>
                        </div>



                        {/* <div className="pb-3 ">
                            <span className="text-sm text-text leading-[24px] dark:text-white text-[#184C3D] font-bold mr-4">Suggested based on content</span>
                            <span className="max-w-[135px] text-center h-[21px] p-1.5 px-3 font-medium font-pt-sans bg-[#19352F] text-[#36AF8D] leading-[24px] rounded-full text-[10px]">
                                cardiology (92% match)
                            </span>
                            <p className="font-pt-sans text-[#8A8A8A] font-medium text-[12px] leading-[26px] tracking-[0] align-middle">Organize this pdf in your library</p>
                            <div className="mt-3 font-pt-sans font-medium text-xs">
                                <label className="inline-flex items-center  space-x-1 dark:text-white text-black">
                                    <input type="checkbox" className="accent-green-600" />
                                    <span>Add to multiple subjects for cross disciplinary content</span>
                                </label>
                            </div>
                        </div>

                        <div className="w-full mb-[11px]">
                            <p className="text-xs dark:text-[#DFDFDF] text-[#184C3D] pb-3  font-medium text-left ">Suggested </p>
                            <div className="grid grid-cols-5 max-md:grid-cols-3 xl:gap-[29px] gap-[23px] max-md:gap-3 items-center  max-sm:max-w-xs w-full">
                                <Button className="hover:bg-[#f4fffd] bg-white text-xs dark:bg-[#121515] h-6 px-7 py-4 max-w-[134px] col-span-1 dark:text-white text-[#6d6d6d] rounded-md">
                                    Physiology
                                </Button>

                                <Button className="hover:bg-[#f4fffd] bg-white text-xs dark:bg-[#121515] h-6 px-7 py-4 max-w-[134px] col-span-1 dark:text-white text-[#6d6d6d] rounded-md">
                                    Microbiology
                                </Button>

                                <Button className="hover:bg-[#f4fffd] bg-white text-xs dark:bg-[#121515] h-6 px-7 py-4 max-w-[134px] col-span-1 dark:text-white text-[#6d6d6d] rounded-md">
                                    Physiology
                                </Button>

                                <div className="flex gap-2 col-span-2 max-md:col-span-3 w-full items-center justify-end max-md:pr-10 ">

                                    <Tabs defaultValue="upload" className="w-full relative ">
                                        <TabsList className="grid w-[180px] grid-cols-2 dark:bg-[#181A1D] bg-[#F3F4F9] h-10  py-[4px] px-[7px]">
                                            <TabsTrigger value="upload" className="font-[futureHeadline] font-bold e w-full text-xs
           data-[state=active]:text-black text-white dark:data-[state=active]:bg-[#36AF8D] dark:data-[state=active]:text-black
             data-[state=active]:border-[#36AF8D] data-[state=active]:font-bold data-[state=active]:bg-[#36AF8D] data-[state=active]:shadow-none
          ">
                                                Text book
                                            </TabsTrigger>
                                            <TabsTrigger value="recent" className="text-xs font-[futureHeadline] font-bold  w-full
           data-[state=active]:text-black text-white dark:data-[state=active]:bg-[#36AF8D]  dark:data-[state=active]:text-black
             data-[state=active]:border-[#36AF8D] data-[state=active]:font-bold data-[state=active]:bg-[#36AF8D] data-[state=active]:shadow-none
          ">
                                                Journal
                                            </TabsTrigger>

                                        </TabsList>

                                        <TabsContent value="upload" className="w-full ">

                                        </TabsContent>
                                        <TabsContent value="recent" className="w-full">


                                        </TabsContent>
                                    </Tabs>

                                </div>

                            </div>

                            <div className="w-full">
                                <p className="text-xs dark:text-[#DFDFDF] text-[#184C3D]  font-medium text-left  pb-3">Semester </p>
                                <div className="flex flex-wrap  gap-5 pb-5   items-center max-sm:max-w-sm w-full">
                                    <Select>
                                        <SelectTrigger className="dark:bg-[#282A2E] hover:bg-[#f4fffd] bg-white h-7 max-w-[134px]
                                     col-span-1 text-xs text-[#AAAAAA] p-[10px] pl-3 rounded-md">
                                            <SelectValue placeholder="1st year" />
                                        </SelectTrigger>
                                        <SelectContent className="dark:bg-[#282A2E] hover:bg-[#f4fffd] bg-white text-[#AAAAAA]">
                                            <SelectItem value="hard">1st year</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <div className="max-w-[150px]  ">
                                        <div className="flex items-center max-md:justify-between gap-[26px]  xl:gap-[33px]
                                     dark:bg-muted px-4 max-md:px-[5px] max-md:py-[6px] bg-white shadow-md
                                     rounded-full  h-8 max-md:h-[22px]">
                                            <div className="w-full flex  items-center gap-[26px]  xl:gap-[33px] ">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-full"
                                                // onClick={handleBack}
                                                >
                                                    <ArrowLeft className="w-5 h-5 max-md:w-2 max-md:h-2 dark:text-gray-400 text-black" />
                                                </Button>

                                                <Input
                                                    value={searchTermNew}
                                                    onChange={(e) => setSearchTermNew(e.target.value)}
                                                    placeholder="Search..."
                                                    className="bg-transparent border-none focus-visible:ring-0
                                            focus-visible:ring-offset-0 max-md:text-xs  px-0  max-w-36 items-center
                                            text-start placeholder:text-muted-foreground"
                                                />
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full"
                                                onClick={() => toggleSubjectNew(searchTermNew)}
                                            >
                                                <Search className="w-5 h-5 max-md:w-2 max-md:h-2 dark:text-gray-400 text-black" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="max-md:grid flex flex-wrap  max-md:grid-cols-2 gap-[26px]  xl:gap-[33px]  items-center ">
                                        {selectedSubjectsNew.map(subject => (
                                            <span
                                                key={subject}
                                                className="flex items-center font-pt-sans
                                            font-medium bg-[#121515] px-5 py-2 rounded-md text-sm text-center"
                                            >
                                                <MdClose
                                                    onClick={() => toggleSubjectNew(subject)}
                                                    className="mr-4 cursor-pointer"
                                                />
                                                {subject}

                                            </span>
                                        ))}
                                    </div>
                                    <Separator className="" />
                                </div>
                            </div> */}

                        {/* <div className="w-full mb-[20px]">
                                <p className="text-xs dark:text-[#DFDFDF] text-[#184C3D] font-medium text-left pb-4">Add to </p>
                                <div className="grid grid-cols-4 max-md:grid-cols-2 w-full max-sm:max-w-sm max-sm:gap-3 gap-[26px]  xl:gap-[33px] font-pt-sans ">
                                    <Button
                                        //   variant="ghost"
                                        className="hover:bg-[#f4fffd] bg-white dark:bg-[#121515] dark:hover:bg-[#121515] dark:text-white min-w-[130px] h-7 hover:border text-xs  hover:border-[#047857] px-[4px] py-[6px] rounded-md text-black"
                                    >
                                        My PDF
                                    </Button>
                                    <Button
                                        //   variant="ghost"
                                        className="hover:bg-[#f4fffd] bg-white dark:bg-[#121515] dark:hover:bg-[#121515] dark:text-white min-w-[130px] h-7 hover:border text-xs  hover:border-[#047857]  px-[4px] py-[6px] rounded-md text-black"
                                    >
                                        My Notes
                                    </Button>
                                    <Button
                                        //   variant="ghost"
                                        className="hover:bg-[#f4fffd] bg-white dark:bg-[#121515] dark:hover:bg-[#121515] dark:text-white  min-w-[130px] h-7 hover:border text-xs  hover:border-[#047857]  px-[4px] py-[6px] rounded-md text-black"
                                    >
                                        Flashcard
                                    </Button>
                                    <Button
                                        //   variant="ghost"
                                        className="hover:bg-[#f4fffd] bg-white dark:bg-[#121515] dark:hover:bg-[#121515] dark:text-white min-w-[130px] h-7 hover:border text-xs  hover:border-[#047857]  px-[4px] py-[6px] rounded-md text-black"
                                    >
                                        Practice Test
                                    </Button>
                                </div> */}


                        {/* </div> */}
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
};

export default UploadFilePopUp;