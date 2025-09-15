import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"

import bigOwl from "@/public/bigOwl.svg";
import homeBright from "@/public/newIcons/home.svg"
import pdfbright from "@/public/newIcons/pdfOptions.svg"
import noteBright from "@/public/newIcons/notes.svg"
import PracticeModule from "@/public/newIcons/practiceModule.svg"
import acolyteAi from "@/public/newIcons/acolyteAI.svg"
import flashcard from "@/public/newIcons/flashCards.svg"
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import burger from "@/public/hamIcon.svg"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSettings } from "@/context/store";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button"

// Loading Screen Component
const LoadingScreen = ({ loadingText }: { loadingText: string }) => (
    <div className="fixed inset-0 z-50 bg-[#181A1D]/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
        <div className="text-center mb-4 flex flex-col items-center w-full animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 relative mb-4">
                {/* Purple arc (A shape) */}
                <div className="absolute inset-0 border-t-4 border-l-4 border-[#5A3999] rounded-full animate-spin drop-shadow-lg"></div>
                {/* Green arc (C shape) - opposite direction */}
                <div className="absolute inset-0 border-b-4 border-r-4 border-[#38A169] rounded-full animate-spin-reverse drop-shadow-lg"></div>
                {/* Inner glow effect */}
                <div className="absolute inset-2 bg-gradient-to-r from-[#5A3999]/20 to-[#38A169]/20 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-4">
                <p className="text-gray-300 font-causten-semibold text-lg animate-pulse">
                    {loadingText}
                </p>
                {/* Progress dots */}
                <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    </div>
);

export default function SideBarSheet() {
    const { isExpanded } = useSettings()
    const [isLoading, setIsLoading] = useState(false)
    const [loadingText, setLoadingText] = useState("")
    const sheetCloseRef = useRef<HTMLButtonElement>(null);

    const [sidebar, setSidebar] = useState<{
        dashboard: boolean,
        "dashboard/pdf": boolean,
        assesment: boolean,
        "dashboard/notes": boolean,
        user: boolean,
        "dashboard/chat": boolean,
        flashcard: boolean,
        "dashboard/community": boolean,
    }>({
        dashboard: false,
        assesment: false,
        "dashboard/pdf": false,
        "dashboard/notes": false,
        user: false,
        "dashboard/chat": false,
        flashcard: false,
        "dashboard/community": false
    })

    useEffect(() => {
        const currentItem = localStorage.getItem("aco-side-bar") || "dashboard";
        setSidebar((prev) => ({
            ...prev,
            dashboard: false,
            assesment: false,
            "dashboard/pdf": false,
            "dashboard/notes": false,
            user: false,
            "dashboard/chat": false,
            flashcard: false,
            "dashboard/community": false,
            [currentItem]: true
        }))
    }, [])

    const handleLinkClick = (sidebarKey: string, displayName: string) => {
        // Close the sheet first
        sheetCloseRef.current?.click();

        setIsLoading(true);
        setLoadingText(`Loading ${displayName}...`);

        // Update sidebar state
        setSidebar((prev) => ({
            ...prev,
            dashboard: false,
            assesment: false,
            "dashboard/pdf": false,
            "dashboard/notes": false,
            user: false,
            "dashboard/chat": false,
            flashcard: false,
            "dashboard/community": false,
            [sidebarKey]: true
        }));

        localStorage.setItem("aco-side-bar", sidebarKey);

        // Simulate loading time (you can adjust this or remove it)
        // setTimeout(() => {
        setIsLoading(false);
        // }, 800);
    };

    const handleLogoClick = () => {
        handleLinkClick("dashboard", "Home");
    };

    return (
        <>
            {isLoading && <LoadingScreen loadingText={loadingText} />}

            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="p-2">
                        <Image src={burger} height={24} width={24} alt="burger" className="w-6 h-6" />
                    </Button>
                </SheetTrigger>
                <SheetClose ref={sheetCloseRef} className="hidden"></SheetClose>
                <SheetContent className="flex flex-col gap-7 py-24 bg-[#181A1D] w-[111px] dark:bg-[#181A1D] items-center justify-center ">

                    <Link href="/dashboard" className="flex justify-start items-center w-fit cursor-pointer" onClick={handleLogoClick}>
                        <Image src={bigOwl} alt="bigowl" height={35} width={35} className="w-7 h-11" />
                    </Link>

                    <SidebarContent className="cursor-pointer bg-[#181A1D] dark:bg-[#181A1D] border-none w-full ">
                        <SidebarMenu className=" w-full place-items-center transition-all duration-500">
                            {/* Dashboard */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SidebarMenuItem className="flex justify-center font-causten-semibold h-[70px] relative items-center dark:hover:bg-zinc-800 hover:bg-emerald-600 w-fit transition-all duration-300 ease-out [&:hover_img]:brightness-125 [&:hover_img]:grayscale-0 [&:hover_p]:text-white hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 group">
                                        <SidebarMenuButton asChild className="pr-0 dark:hover:bg-zinc-800 hover:bg-emerald-600 transition-all duration-300 ease-out rounded-xl">
                                            <Link href="/dashboard" onClick={() => handleLinkClick("dashboard", "Home")}>
                                                <Image
                                                    src={homeBright}
                                                    alt="home"
                                                    height={23}
                                                    width={23}
                                                    className={`h-[21px] max-xl:h-[21px] transition-all duration-300 ease-out group-hover:scale-110 ${!sidebar.dashboard ? "grayscale" : "drop-shadow-lg drop-shadow-emerald-400/50"
                                                        }`}
                                                />
                                                <p className={`text-[19px] mx-[17px] hidden font-causten-semibold transition-all duration-300 ease-out group-hover:translate-x-1 ${sidebar.dashboard
                                                    ? "text-[#36AF8D]"
                                                    : "dark:text-white text-white"
                                                    }`}>
                                                    Home
                                                </p>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Go to Dashboard Home</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* PDF */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SidebarMenuItem className="flex justify-center font-causten-semibold h-[70px] items-center relative dark:hover:bg-zinc-800 hover:bg-emerald-600 w-fit transition-all duration-300 ease-out [&:hover_img]:brightness-125 [&:hover_img]:grayscale-0 [&:hover_p]:text-white hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 group">
                                        <SidebarMenuButton asChild className="pr-0 dark:hover:bg-zinc-800 hover:bg-emerald-600 transition-all duration-300 ease-out rounded-xl">
                                            <Link href="/dashboard/pdf" onClick={() => handleLinkClick("dashboard/pdf", "PDF Viewer")}>
                                                <Image
                                                    src={pdfbright}
                                                    alt="pdf"
                                                    height={23}
                                                    width={23}
                                                    className={`h-[21px] max-xl:h-[21px] transition-all duration-300 ease-out group-hover:scale-110 ${!sidebar["dashboard/pdf"] ? "grayscale" : "drop-shadow-lg drop-shadow-emerald-400/50"
                                                        }`}
                                                />
                                                <p className={`text-[19px] mx-[17px] hidden font-causten-semibold transition-all duration-300 ease-out group-hover:translate-x-1 ${sidebar["dashboard/pdf"]
                                                    ? "text-[#36AF8D]"
                                                    : "dark:text-white text-white"
                                                    }`}>
                                                    PDF
                                                </p>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Manage PDF Documents</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Notes */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SidebarMenuItem className="flex justify-center font-causten-semibold h-[70px] items-center relative dark:hover:bg-zinc-800 hover:bg-emerald-600 w-fit transition-all duration-300 ease-out [&:hover_img]:brightness-125 [&:hover_img]:grayscale-0 [&:hover_p]:text-white hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 group">
                                        <SidebarMenuButton asChild className="pr-0 dark:hover:bg-zinc-800 hover:bg-emerald-600 transition-all duration-300 ease-out rounded-xl">
                                            <Link href="/dashboard/notes" onClick={() => handleLinkClick("dashboard/notes", "Notes")}>
                                                <Image
                                                    src={noteBright}
                                                    alt="notes"
                                                    height={23}
                                                    width={23}
                                                    className={`h-[21px] max-xl:h-[21px] transition-all duration-300 ease-out group-hover:scale-110 ${!sidebar["dashboard/notes"] ? "grayscale" : "drop-shadow-lg drop-shadow-emerald-400/50"
                                                        }`}
                                                />
                                                <p className={`text-[19px] mx-[17px] hidden font-causten-semibold transition-all duration-300 ease-out group-hover:translate-x-1 ${sidebar["dashboard/notes"]
                                                    ? "text-[#36AF8D]"
                                                    : "dark:text-white text-white"
                                                    }`}>
                                                    Notes
                                                </p>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>View and Edit Notes</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Practice Module */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SidebarMenuItem className="flex justify-center font-causten-semibold h-[70px] items-center relative dark:hover:bg-zinc-800 hover:bg-emerald-600 w-fit transition-all duration-300 ease-out [&:hover_img]:brightness-125 [&:hover_img]:grayscale-0 [&:hover_p]:text-white hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 group">
                                        <SidebarMenuButton asChild className="pr-0 dark:hover:bg-zinc-800 hover:bg-emerald-600 transition-all duration-300 ease-out rounded-xl">
                                            <Link href="/assesment" onClick={() => handleLinkClick("assesment", "Practice Test Module")}>
                                                <Image
                                                    src={PracticeModule}
                                                    alt="practice module"
                                                    height={23}
                                                    width={23}
                                                    className={`h-[21px] max-xl:h-[21px] transition-all duration-300 ease-out group-hover:scale-110 ${!sidebar.assesment ? "grayscale" : "drop-shadow-lg drop-shadow-emerald-400/50"
                                                        }`}
                                                />
                                                <p className={`text-[19px] mx-[17px] hidden font-causten-semibold transition-all duration-300 ease-out group-hover:translate-x-1 ${sidebar.assesment
                                                    ? "text-[#36AF8D]"
                                                    : "dark:text-white text-white"
                                                    }`}>
                                                    Practice Module
                                                </p>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Access Practice Exercises</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Flashcard */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SidebarMenuItem className="flex justify-center font-causten-semibold h-[70px] items-center relative dark:hover:bg-zinc-800 hover:bg-emerald-600 w-fit transition-all duration-300 ease-out [&:hover_img]:brightness-125 [&:hover_img]:grayscale-0 [&:hover_p]:text-white hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 group">
                                        <SidebarMenuButton asChild className="pr-0 dark:hover:bg-zinc-800 hover:bg-emerald-600 transition-all duration-300 ease-out rounded-xl">
                                            <Link href="/flashcard" onClick={() => handleLinkClick("flashcard", "Flashcard")}>
                                                <Image
                                                    src={flashcard}
                                                    alt="flashcard"
                                                    height={23}
                                                    width={23}
                                                    className={`h-[21px] max-xl:h-[21px] transition-all duration-300 ease-out group-hover:scale-110 ${!sidebar.flashcard ? "grayscale" : "drop-shadow-lg drop-shadow-emerald-400/50"
                                                        }`}
                                                />
                                                <p className={`text-[19px] mx-[17px] hidden font-causten-semibold transition-all duration-300 ease-out group-hover:translate-x-1 ${sidebar.flashcard
                                                    ? "text-[#36AF8D]"
                                                    : "dark:text-white text-white"
                                                    }`}>
                                                    Flashcard
                                                </p>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Study with Flashcards</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Chat/AI Assistant */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SidebarMenuItem className="flex justify-center font-causten-semibold h-[70px] items-center relative dark:hover:bg-zinc-800 hover:bg-emerald-600 w-fit transition-all duration-300 ease-out [&:hover_img]:brightness-125 [&:hover_img]:grayscale-0 [&:hover_p]:text-white hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 group">
                                        <SidebarMenuButton asChild className="pr-0 dark:hover:bg-zinc-800 hover:bg-emerald-600 transition-all duration-300 ease-out rounded-xl">
                                            <Link href="/dashboard/chat" onClick={() => handleLinkClick("dashboard/chat", "AI Assistant")}>
                                                <Image
                                                    src={acolyteAi}
                                                    alt="ai chat"
                                                    height={23}
                                                    width={23}
                                                    className={`h-[21px] max-xl:h-[21px] transition-all duration-300 ease-out group-hover:scale-110 ${!sidebar["dashboard/chat"] ? "grayscale" : "drop-shadow-lg drop-shadow-emerald-400/50"
                                                        }`}
                                                />
                                                <p className={`text-[19px] mx-[17px] hidden font-causten-semibold transition-all duration-300 ease-out group-hover:translate-x-1 ${sidebar["dashboard/chat"]
                                                    ? "text-[#36AF8D] "
                                                    : "dark:text-white text-white "
                                                    }`}>
                                                    AI Assistant
                                                </p>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Chat with AI Assistant</p>
                                </TooltipContent>
                            </Tooltip>
                        </SidebarMenu>
                    </SidebarContent>
                </SheetContent>
            </Sheet>
        </>
    )
}