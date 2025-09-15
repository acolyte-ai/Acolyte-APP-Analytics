"use client";
import bigOwl from "@/public/bigOwl.svg";
import homeBright from "@/public/newIcons/home.svg"
import pdfbright from "@/public/newIcons/pdfOptions.svg"
import noteBright from "@/public/newIcons/notes.svg"
import userBright from "@/public/newIcons/community.svg"
import PracticeModule from "@/public/newIcons/practiceModule.svg"
import acolyteAi from "@/public/newIcons/acolyteAI.svg"
import flashcard from "@/public/newIcons/flashCards.svg"
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSettings } from "@/context/store";

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
                    <div className="w-2 h-2 bg-[#36AF8D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#36AF8D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#36AF8D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    </div>
);

export default function SideBarTest() {
    const { isExpanded } = useSettings()
    const [isLoading, setIsLoading] = useState(false)
    const [loadingText, setLoadingText] = useState("")

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
        setIsLoading(false);
        // Simulate loading time (you can adjust this or remove it)

    };

    const handleLogoClick = () => {
        handleLinkClick("dashboard", "Home");
    };

    return (
        <>
            {isLoading && <LoadingScreen loadingText={loadingText} />}

            {!isExpanded &&
                <Sidebar className="xl:w-[250px] w-[111px] border-none no-scrollbar bg-[#181A1D] dark:bg-[#181A1D]
              pt-[42px] font-causten-semibold ">

                    <SidebarHeader className="bg-[#181A1D]  dark:bg-[#181A1D] place-items-center xl:place-items-start p-0 px-[32px]  " >
                        <Link href="/dashboard" className="flex justify-start items-center mb-[67px] max-xl:mb-[110px] cursor-pointer" onClick={handleLogoClick}>
                            <Image src={bigOwl} alt="bigowl" height={35} width={35} className="w-7 h-11" />
                            <p className="text-[19px] mx-4 font-[700] bg-gradient-to-l
                            font-causten-semibold  from-[#53EF96] to-[#2CC296] max-xl:hidden text-transparent bg-clip-text">ACOLYTE</p>
                        </Link>
                    </SidebarHeader>

                    <SidebarContent className="cursor-pointer bg-[#181A1D] no-scrollbar dark:bg-[#181A1D] border-none">
                        <SidebarMenu className=" xl:w-full place-items-center no-scrollbar transition-all duration-500">
                            {/* Dashboard */}
                            <SidebarMenuItem className="flex justify-center font-causten-semibold h-[70px] xl:w-full  relative items-center dark:hover:bg-zinc-800 hover:bg-emerald-600  w-full transition-all duration-300 ease-out [&:hover_img]:brightness-125 [&:hover_img]:grayscale-0 [&:hover_p]:text-white hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 group">
                                <SidebarMenuButton asChild className="px-[32px] hover:pl-[40px] dark:hover:bg-zinc-800 hover:bg-emerald-600 transition-all duration-300 ease-out rounded-xl">
                                    <Link href="/dashboard" onClick={() => handleLinkClick("dashboard", "Home")}>
                                        <Image
                                            src={homeBright}
                                            alt="home"
                                            height={23}
                                            width={23}
                                            className={`w-[21px] h-[21px] max-xl:w-[21px] max-xl:h-[21px] transition-all duration-300 ease-out group-hover:scale-110 ${!sidebar.dashboard ? "grayscale" : "drop-shadow-lg drop-shadow-emerald-400/50"
                                                }`}
                                        />
                                        <p className={`text-[19px] ml-[17px] max-xl:hidden font-causten-semibold transition-all duration-300 ease-out group-hover:translate-x-1 ${sidebar.dashboard
                                            ? "text-[#36AF8D]"
                                            : "dark:text-white text-white"
                                            }`}>
                                            Home
                                        </p>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* PDF */}
                            <SidebarMenuItem className="flex justify-center font-causten-semibold h-[70px] items-center xl:w-full  relative dark:hover:bg-zinc-800 hover:bg-emerald-600  w-full transition-all duration-300 ease-out [&:hover_img]:brightness-125 [&:hover_img]:grayscale-0 [&:hover_p]:text-white hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 group">
                                <SidebarMenuButton asChild className="px-[32px] hover:pl-[40px] dark:hover:bg-zinc-800 hover:bg-emerald-600 transition-all duration-300 ease-out rounded-xl">
                                    <Link href="/dashboard/pdf" onClick={() => handleLinkClick("dashboard/pdf", "PDF Viewer")}>
                                        <Image
                                            src={pdfbright}
                                            alt="pdf"
                                            height={23}
                                            width={23}
                                            className={`w-[21px] h-[21px] max-xl:w-[21px] max-xl:h-[21px] transition-all duration-300 ease-out group-hover:scale-110 ${!sidebar["dashboard/pdf"] ? "grayscale" : "drop-shadow-lg drop-shadow-emerald-400/50"
                                                }`}
                                        />
                                        <p className={`text-[19px] ml-[17px] max-xl:hidden font-causten-semibold transition-all duration-300 ease-out group-hover:translate-x-1 ${sidebar["dashboard/pdf"]
                                            ? "text-[#36AF8D]"
                                            : "dark:text-white text-white"
                                            }`}>
                                            PDF
                                        </p>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Notes */}
                            <SidebarMenuItem className="flex justify-center font-causten-semibold h-[70px] items-center  xl:w-full  relative dark:hover:bg-zinc-800 hover:bg-emerald-600  w-full transition-all duration-300 ease-out [&:hover_img]:brightness-125 [&:hover_img]:grayscale-0 [&:hover_p]:text-white hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 group">
                                <SidebarMenuButton asChild className="px-[32px] hover:pl-[40px] dark:hover:bg-zinc-800 hover:bg-emerald-600 transition-all duration-300 ease-out rounded-xl">
                                    <Link href="/dashboard/notes" onClick={() => handleLinkClick("dashboard/notes", "Notes")}>
                                        <Image
                                            src={noteBright}
                                            alt="notes"
                                            height={23}
                                            width={23}
                                            className={`w-[21px] h-[21px] max-xl:w-[21px] max-xl:h-[21px] transition-all duration-300 ease-out group-hover:scale-110 ${!sidebar["dashboard/notes"] ? "grayscale" : "drop-shadow-lg drop-shadow-emerald-400/50"
                                                }`}
                                        />
                                        <p className={`text-[19px] ml-[17px] max-xl:hidden font-causten-semibold transition-all duration-300 ease-out group-hover:translate-x-1 ${sidebar["dashboard/notes"]
                                            ? "text-[#36AF8D]"
                                            : "dark:text-white text-white"
                                            }`}>
                                            Notes
                                        </p>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Practice Module */}
                            <SidebarMenuItem className="flex justify-center font-causten-semibold h-[70px] items-center xl:w-full  relative dark:hover:bg-zinc-800 hover:bg-emerald-600  w-full transition-all duration-300 ease-out [&:hover_img]:brightness-125 [&:hover_img]:grayscale-0 [&:hover_p]:text-white hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 group">
                                <SidebarMenuButton asChild className="px-[32px] hover:pl-[40px] dark:hover:bg-zinc-800 hover:bg-emerald-600 transition-all duration-300 ease-out rounded-xl">
                                    <Link href="/assesment" onClick={() => handleLinkClick("assesment", "Practice Test Module")}>
                                        <Image
                                            src={PracticeModule}
                                            alt="practice module"
                                            height={23}
                                            width={23}
                                            className={`w-[21px] h-[21px] max-xl:w-[21px] max-xl:h-[21px] transition-all duration-300 ease-out group-hover:scale-110 ${!sidebar.assesment ? "grayscale" : "drop-shadow-lg drop-shadow-emerald-400/50"
                                                }`}
                                        />
                                        <p className={`text-[19px] ml-[17px] max-xl:hidden font-causten-semibold transition-all duration-300 ease-out group-hover:translate-x-1 ${sidebar.assesment
                                            ? "text-[#36AF8D]"
                                            : "dark:text-white text-white"
                                            }`}>
                                            Practice Module
                                        </p>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Flashcard */}
                            <SidebarMenuItem className="flex justify-center font-causten-semibold h-[70px] items-center xl:w-full  relative dark:hover:bg-zinc-800 hover:bg-emerald-600  w-full transition-all duration-300 ease-out [&:hover_img]:brightness-125 [&:hover_img]:grayscale-0 [&:hover_p]:text-white hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 group">
                                <SidebarMenuButton asChild className="px-[32px] hover:pl-[40px] dark:hover:bg-zinc-800 hover:bg-emerald-600 transition-all duration-300 ease-out rounded-xl">
                                    <Link href="/flashcard" onClick={() => handleLinkClick("flashcard", "Flashcard")}>
                                        <Image
                                            src={flashcard}
                                            alt="flashcard"
                                            height={23}
                                            width={23}
                                            className={`w-[21px] h-[21px] max-xl:w-[21px] max-xl:h-[21px] transition-all duration-300 ease-out group-hover:scale-110 ${!sidebar.flashcard ? "grayscale" : "drop-shadow-lg drop-shadow-emerald-400/50"
                                                }`}
                                        />
                                        <p className={`text-[19px] ml-[17px] max-xl:hidden font-causten-semibold transition-all duration-300 ease-out group-hover:translate-x-1 ${sidebar.flashcard
                                            ? "text-[#36AF8D]"
                                            : "dark:text-white text-white"
                                            }`}>
                                            Flashcard
                                        </p>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* AI Assistant */}
                            <SidebarMenuItem className="flex justify-center font-causten-semibold h-[70px] items-center  xl:w-full  relative dark:hover:bg-zinc-800 hover:bg-emerald-600  w-full transition-all duration-300 ease-out [&:hover_img]:brightness-125 [&:hover_img]:grayscale-0 [&:hover_p]:text-white hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 group">
                                <SidebarMenuButton asChild className="px-[32px] hover:pl-[40px] dark:hover:bg-zinc-800 hover:bg-emerald-600 transition-all duration-300 ease-out rounded-xl">
                                    <Link href="/dashboard/chat" onClick={() => handleLinkClick("dashboard/chat", "AI Assistant")}>
                                        <Image
                                            src={acolyteAi}
                                            alt="ai chat"
                                            height={23}
                                            width={23}
                                            className={`w-[21px] h-[21px] max-xl:w-[21px] max-xl:h-[21px] transition-all duration-300 ease-out group-hover:scale-110 ${!sidebar["dashboard/chat"] ? "grayscale" : "drop-shadow-lg drop-shadow-emerald-400/50"
                                                }`}
                                        />
                                        <p className={`text-[19px] ml-[17px] max-xl:hidden font-causten-semibold transition-all duration-300 ease-out group-hover:translate-x-1 ${sidebar["dashboard/chat"]
                                            ? "text-[#36AF8D] "
                                            : "dark:text-white text-white "
                                            }`}>
                                            AI Assistant
                                        </p>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar >
            }
        </>
    )
}