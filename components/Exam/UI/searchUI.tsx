"use client"
import Image from "next/image";
import notify from "@/public/newIcons/notification_new.svg"
import person from "@/public/newIcons/myProfile.svg";
import FileNote from "@/public/assets/images/noteplain.svg";
import PdfFile from "@/public/assets/images/pdf-file.svg";
import Subjects from "@/public/assets/images/folder.svg";
import HeaderButtonUI from "./headerButton";
import ToggleButton from "@/components/UIUX/theme_toggle";
import { useEffect, useRef, useState } from "react";
import search from "@/public/newIcons/search.svg";
import { useRouter, usePathname } from "next/navigation";
import { parseCookies } from "nookies";
import { deleteAllTodosFromDB } from "@/db/Todo";
import { clearPdfData } from "@/db/pdf/pdfFiles";
import { clearCanvasData } from "@/db/pdf/pdfAnnotations";
import { useSettings } from "@/context/store";
import Link from "next/link";


interface FileItem {
    id: string;
    name: string;
    parentId?: string;
    documentId?: string;
    uploadTime?: string;
    type?: "pdf" | "note";
    fileType?: string;
    isOpen?: boolean;
    isActive?: boolean;
    files?: FileItem[];
}

interface SearchResult {
    folders: FileItem[];
    files: FileItem[];
}


export default function SearchUI() {
    const [searchText, setSearchText] = useState("");
    const [allData, setAllData] = useState<FileItem[]>([]);
    const [searchResults, setSearchResults] = useState<SearchResult>({
        folders: [],
        files: [],
    });
    const [loading, setLoading] = useState(true);
    const [showResults, setShowResults] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchBarRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const { fileSystem } = useSettings();
    // States for new functionalities
    const [showCalendar, setShowCalendar] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [showHelpOverlay, setShowHelpOverlay] = useState(false);
    const [cookies, setCookies] = useState({});
    const router = useRouter();
    const pathname = usePathname().split("/")[1];

    console.log("File System Data:", pathname);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (fileSystem) {
                    setAllData(fileSystem);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fileSystem]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchBarRef.current &&
                resultsRef.current &&
                !searchBarRef.current.contains(event.target as Node) &&
                !resultsRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const searchInData = (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setSearchResults({ folders: [], files: [] });
            return;
        }

        const term = searchTerm.toLowerCase();

        const matchedFolders = allData.filter(
            (item: any) => !item.documentId && item.name.toLowerCase().includes(term)
        );

        const matchedFiles = allData.filter(
            (item: any) => item.documentId && item.name.toLowerCase().includes(term)
        );

        setSearchResults({
            folders: matchedFolders,
            files: matchedFiles,
        });
        setShowResults(true);
    };

    const handleSearch = () => {
        searchInData(searchText);
    };

    const handleOpenFile = (file: FileItem) => {
        const path =
            file.fileType === "note"
                ? `/workspace/${file.id}`
                : file.fileType === "pdf"
                    ? `/workspace/${file.id}`
                    : null;
        if (!path) return;



        router.push(path);
    };

    useEffect(() => {
        const debounceSearch = setTimeout(() => {
            searchInData(searchText);
        }, 300);

        return () => clearTimeout(debounceSearch);
    }, [searchText]);

    const handleNotificationClick = () => {
        setShowNotification(!showNotification);
        // Close other modals if open
        setShowCalendar(false);
        setShowHelpOverlay(false);
    };


    useEffect(() => {
        // Read cookies only on the client side
        setCookies(parseCookies());
    }, []);

    const handleLogout = async () => {
        sessionStorage.clear()
        localStorage.clear()

        await deleteAllTodosFromDB();
        await clearPdfData();
        await clearCanvasData();

        router.push("/dashboard"); // Redirect to dashboard
    };


    return (
        <div className="flex justify-between items-center w-full  2xl:py-[34px] 2xl:px-[46px] px-[24px] py-[22px]"   >
            <div className="block justify-center items-center relative  max-w-md w-full " ref={searchBarRef}>
                <form className={`w-full `}
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearch();
                    }}>
                    <label htmlFor="default-search" className="mb-2 text-sm font-medium text-zinc-900 sr-only dark:text-white">Search</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">


                            <Image
                                src={search}
                                height={30}
                                width={30}
                                alt="burger"
                                className={`
                                dark:grayscale dark:brightness-200 grayscale-0 brightness-100
                                 w-[14px] h-[14px]`}
                            />


                        </div>
                        <input type="search" ref={searchInputRef} id="default-search"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search "
                            onFocus={() => setShowResults(true)}
                            autoComplete="off"
                            className="block w-full p-[13px] ps-10 lg:text-sm lg:py-4 tracking-normal text-zinc-900 border border-[#B8B8B8] shadow-md
        rounded-lg bg-[#F3F4F9] focus:ring-0 focus:border-none outline-none dark:bg-[#1A1B1F] text-sm placeholder-black
        dark:border-[#202020] dark:placeholder-[#B7B7B7] dark:text-white dark:focus:ring-0 dark:focus:border-none"  />

                        <div className="absolute top-[40px] pl-8 xs:pl-10 sm:pl-16 w-full text-black dark:text-white text-xs sm:text-[14px]
                        px-2 xs:px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate">
                            Search across all folders and files
                        </div>
                        {/* <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button> */}
                    </div>
                </form>

                {showResults &&
                    (searchResults.folders.length > 0 ||
                        searchResults.files.length > 0) && (
                        <div
                            ref={resultsRef}
                            className="  w-full absolute top-16 left-0 max-h-[600px] overflow-y-auto bg-white dark:bg-[#1A1B1F]
                                         rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 z-40"
                        >
                            {/* Folders Section */}
                            {searchResults.folders.length > 0 && (
                                <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                                    <div className="space-y-2">
                                        {searchResults.folders.map((folder: FileItem) => (
                                            <div
                                                key={folder.id}
                                                className="flex items-center gap-2 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg cursor-pointer"
                                                onClick={() => handleOpenFile(folder)}
                                            >
                                                <Image
                                                    src={
                                                        folder.fileType === "note"
                                                            ? FileNote
                                                            : folder.fileType === "pdf"
                                                                ? PdfFile
                                                                : Subjects
                                                    }
                                                    alt={
                                                        folder.fileType === "folder"
                                                            ? "Folder"
                                                            : folder.fileType === "pdf"
                                                                ? "PDF"
                                                                : "Note"
                                                    }
                                                    width={16}
                                                    height={16}
                                                    className="text-zinc-400"
                                                />

                                                <span className="text-sm text-zinc-700 dark:text-zinc-200">
                                                    {folder.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Files Section */}
                            {searchResults.files.length > 0 && (
                                <div className="p-4">
                                    <div className="space-y-2">
                                        {searchResults.files.map((file: FileItem) => (
                                            <div
                                                key={file.id}
                                                className="flex items-center gap-2 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg cursor-pointer"
                                                onClick={() => handleOpenFile(file)}
                                            >
                                                <Image
                                                    src={file.fileType === "note" ? FileNote : PdfFile}
                                                    alt={file.fileType === "note" ? "Note" : "PDF"}
                                                    width={16}
                                                    height={16}
                                                    className="text-zinc-400"
                                                />
                                                <span className="text-sm text-zinc-700 dark:text-zinc-200">
                                                    {file.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {loading && (
                                <div className="p-4 text-center text-zinc-500">Loading...</div>
                            )}
                        </div>
                    )}
            </div>


            <div className="flex gap-5 2xl:gap-[22px] items-center max-md:hidden">

                <HeaderButtonUI>
                    <Image src={notify} height={40} width={40} alt="notify"
                        onClick={handleNotificationClick}
                        id="notification"
                        className="w-7 h-7 2xl:w-8 2xl:h-8"
                    />
                </HeaderButtonUI>

                {/* <HeaderButtonUI> */}
                {/* <Image src={sun} height={30} width={30} alt="sun" /> */}
                <div className="flex items-end justify-end">
                    <ToggleButton />
                </div>

                {/* </HeaderButtonUI> */}

                <HeaderButtonUI>
                    <Link href="/student-profile" >
                        <div
                            className="flex items-center  hover:bg-sky-800 dark:hover:bg-sky-800
                       rounded-full transition-all duration-200 cursor-pointer"
                            onClick={() => {

                                localStorage.setItem("aco-side-bar", "");
                            }}
                        >
                            {/* <span className="flex items-center justify-center text-lg font-medium text-white bg-blue-500 rounded-full w-8 h-8 bg-sky-400">
                            {cookies?.userName
                                ? cookies.userName.substring(0, 2).toUpperCase()
                                : "U"}
                        </span> */}

                            <Image src={person} height={40} width={40} alt="notify"

                                id="notification"
                                className="w-7 h-7 2xl:w-8 2xl:h-8"
                            />
                        </div>
                    </Link>

                </HeaderButtonUI>



                {/*
                <HeaderButtonUI>

                    <Dialog>
                        <DialogTrigger asChild className="">


                            <Button
                                className="group bg-transparent dark:bg-transparent hover:bg-emerald-950 dark:hover:bg-emerald-950
             flex items-center gap-2 transition-all duration-300 ease-in-out  justify-center pr-0.5 pl-2.5 border-2 border-emerald-700 dark:border-emerald-700
              hover:px-4 rounded-full w-auto"
                                size="icon"
                                onClick={() => {
                                    handleLogout()
                                }}
                            >
                                <LogOut className="w-7 h-7 2xl:w-8 2xl:h-8 text-emerald-700" />

                                <span
                                    className="text-emerald-700 whitespace-nowrap opacity-0 max-w-0 group-hover:max-w-[100px] group-hover:opacity-100
               transition-all duration-300 ease-in-out overflow-hidden"
                                >
                                    Log out
                                </span>
                            </Button>


                        </DialogTrigger>


                        <DialogContent className="h-[300px] w-full mx-auto flex items-center justify-center">
                            <div className="text-center space-y-4">

                                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />


                                <p className="text-2xl font-semibold text-emerald-700">
                                    Logging off
                                    <span className="inline-block animate-bounce ml-1">.</span>
                                    <span className="inline-block animate-bounce ml-1" style={{ animationDelay: '0.1s' }}>.</span>
                                    <span className="inline-block animate-bounce ml-1" style={{ animationDelay: '0.2s' }}>.</span>
                                </p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </HeaderButtonUI>
                */}
            </div>
        </div>

    )
}

