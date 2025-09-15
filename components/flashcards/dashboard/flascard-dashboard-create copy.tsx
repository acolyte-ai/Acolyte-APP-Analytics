"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, CheckCircle, ChevronRight, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import flashCard from "@/public/newIcons/flashCards.svg"
import CreateFlashcardSkeleton from '../../skeletons/skeleton-flashcard/skeleton-create';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog"
import axios from 'axios';
import { CREATE_FLASHCARD, DUE_CARDS } from '../api/url';
import { useSettings } from '@/context/store';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import useUserId from '@/hooks/useUserId';
import UploadFilePopUp from '@/components/FileSystem/newUploadbox';
import { v4 as uuidv4 } from "uuid";
import { pdfCache } from '@/components/pdf/utils/pdfCache';
import { addPdf } from '@/db/pdf/pdfFiles';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const FlashcardInterface = ({ count, estimatedTime }: { count: number, estimatedTime: number }) => {
    const [progress, setProgress] = useState(65);
    const [loading, setLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const userId = useUserId()
    const [dueFlashcards, setDueFlashcards] = useState<{
        "subject": string,
        "isBookmarked": boolean,
        "interval": number,
        "bodySystem": string,
        "reviewCount": number,
        "dueDate": string,
        "difficultyLevel": string,
        "difficulty": number,
        "topics": string,
        "totalReviews": number,
        "lastReviewedAt": string | null,
        "isCorrect": boolean,
        "userId": string,
        "againClicks": number,
        "easeFactor": number,
        "lapsesCount": number,
        "bookName": string,
        "createdAt": string,
        "text": string,
        "flashcard_id": string,
        "correctReviews": number,
        "docId": string,
        "description": string,
        "pageNo": number,
        "title": string
    }[]>([])
    const [duecards, setDuecards] = useState<{
        "subject": string,
        "isBookmarked": boolean,
        "interval": number,
        "bodySystem": string,
        "reviewCount": number,
        "dueDate": string,
        "difficultyLevel": string,
        "difficulty": number,
        "topics": string,
        "totalReviews": number,
        "lastReviewedAt": string | null,
        "isCorrect": boolean,
        "userId": string,
        "againClicks": number,
        "easeFactor": number,
        "lapsesCount": number,
        "bookName": string,
        "createdAt": string,
        "text": string,
        "flashcard_id": string,
        "correctReviews": number,
        "docId": string,
        "description": string,
        "pageNo": number,
        "title": string
    }[]>([])

    const [data, setData] = useState<{
        "userId": string,
        "docId": string,
        "pageNo": number,
        "title": string,
        "text": string,
        "description": string
    }>()

    const { fileSystem, setFileSystem, setOpenUploadFiles } = useSettings();

    const handleViewCards = async () => {
        console.log('Creating new deck...');
        try {
            // setLoading(true);

            const response = await axios.get(DUE_CARDS + userId);


            const groupedBySubject = response.data.dueFlashcards.reduce((acc, card) => {
                if (!acc[card.subject]) {
                    acc[card.subject] = [];
                }
                acc[card.subject].push(card);
                return acc;
            }, {});
            console.log("groupedBySubject:::=>", groupedBySubject)
            setDuecards(groupedBySubject)

            // Calculate stats for each subject
            const subjectStats = Object.entries(groupedBySubject).map(([subject, cards]) => {
                const totalCards = cards?.length;
                const correctCards = cards.filter(card => card.isCorrect).length;
                const accuracy = totalCards > 0 ? Math.round((correctCards / totalCards) * 100) : 0;
                const estimatedTime = totalCards * 2; // 2 minutes per card
                const bookmarkedCount = cards.filter(card => card.isBookmarked).length;

                return {
                    subject,
                    totalCards,
                    correctCards,
                    accuracy,
                    estimatedTime,
                    bookmarkedCount,
                    cards
                };
            });

            const counter = response.data.dueFlashcards.length;
            const estimatedTimeer = Math.round(count * 2); // 2 minutes per card
            const progressBar = 40; // You can calculate this based on your logic

            setDueFlashcards(subjectStats)
            setIsDialogOpen(true);
            // setLoading(false)
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            console.log(err.message || 'Failed to fetch dashboard data');
            setLoading(false);
        }
    };


    useEffect(() => {
        setLoading(true)
        init()
    }, [])

    function init() {
        setProgress(70)
        setLoading(false)
    }

    const getAccuracyPercentage = () => {
        return data.totalReviews > 0 ? Math.round((data.correctReviews / data.totalReviews) * 100) : 0;
    };

    const createSlug = (name) => {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, 'and');
    };

    const formatFileSize = (size) => {
        if (size < 1024) return size + " bytes";
        if (size < 1048576) return (size / 1024).toFixed(2) + " KB";
        return (size / 1048576).toFixed(2) + " MB";
    };

    const handleFileInput = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const selectedFiles = Array.from(e.target.files);

        // Check if files are valid PDFs
        const pdfFiles = selectedFiles.filter((file) => file.type === "application/pdf");

        if (pdfFiles.length !== selectedFiles.length) {
            alert("Only PDF files are allowed.");
            return;
        }

        if (pdfFiles.length > 0) {
            // For now, handle single file. You can extend this for multiple files
            const file = pdfFiles[0];
            const fileWithMetadata = {
                id: uuidv4(),
                name: file.name,
                size: formatFileSize(file.size),
                file: file, // Store the actual File object
                uploadTime: "Just now",
                status: "pending"
            };

            setSelectedFile(fileWithMetadata);
            setOpenUploadFiles(true);
        }

        // Reset the input value so the same file can be selected again
        e.target.value = '';
    };


    const readFileAsArrayBufferWithProgress = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(progress);
                }
            };

            reader.onload = (event) => {
                setUploadProgress(100);
                resolve({
                    arrayBuffer: event.target.result,
                    size: file.size,
                });
            };

            reader.onerror = () => {
                console.error("Error reading file:", reader.error);
                reject(reader.error);
            };

            reader.readAsArrayBuffer(file);
        });
    };

    const handleSaveFile = async (file, selectedFolder) => {
        try {
            console.log(`Saving file "${file.name}" to folder "${selectedFolder}"`);
            setUploadProgress(0);

            // Generate unique ID for the file
            const fileId = file.id || uuidv4();

            // Find or create the folder in the file system
            let folderId = `folder-${createSlug(selectedFolder)}`;
            let folder = fileSystem?.find(item => item.id === folderId);

            if (!folder) {
                // Create folder if it doesn't exist
                folder = {
                    id: folderId,
                    name: selectedFolder,
                    type: 'folder',
                    parentId: null,
                    timestamp: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                };

                console.log("Creating new folder:", folder);

                // Add folder to file system
                setFileSystem(prev => [...(prev || []), folder]);
            }

            // Process the actual file (convert to ArrayBuffer)
            console.log("Processing file...");
            const { arrayBuffer } = await readFileAsArrayBufferWithProgress(file.file);

            // Store in PDF cache
            console.log("Storing in cache...");
            await pdfCache.storePdf(fileId, arrayBuffer);

            // Create file entry for the file system
            const fileEntry = {
                id: fileId,
                name: file.name,
                type: 'file',
                fileType: 'pdf',
                parentId: folderId, // Store in the selected folder
                size: file.size,
                timestamp: new Date().toISOString(),
                uploadTime: new Date().toLocaleString(),
                status: 'complete',
                inCache: true,
                cacheTimestamp: Date.now()
            };

            console.log("Adding file to file system:", fileEntry);

            // Add file to file system
            setFileSystem(prev => [...(prev || []), fileEntry]);

            // Store in IndexedDB
            console.log("Storing in database...");
            await addPdf({
                documentId: fileId,
                name: file.name,
                size: file.size,
                uploadTime: new Date().toLocaleString(),
                status: "complete",
                inCache: true,
                cacheTimestamp: Date.now(),
                folderId: folderId,
                folderName: selectedFolder
            });

            console.log("File saved successfully!");

            // Reset selected file and progress
            setSelectedFile(null);
            setUploadProgress(0);

        } catch (error) {
            console.error("Error saving file:", error);
            setUploadProgress(0);
            throw error; // Re-throw so the dialog can handle the error
        }
    };


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
        <>
            {loading && <CreateFlashcardSkeleton />}
            <div className="">
                <div className=" mx-auto space-y-[30px]">

                    {/* Create Flashcard Section */}
                    <Card className="border-none bg-transparent dark:bg-transparent shadow-none ">
                        <CardHeader className='p-0 pb-[15px]'>
                            <CardTitle className="text-[22px] xl:text-[24px] font-bold text-[#184C3D] dark:text-white">
                                Create Flashcard
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-9 xl:space-y-[33px] py-[26px]  xl:p-[33px] flex justify-center items-center flex-col
                         rounded-[7px]  px-5 dark:bg-[#181A1D] bg-[#F3F4F9]  w-full dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 xl:w-[75px] xl:h-[85px] border rounded-lg flex items-center justify-center">
                                    <Image
                                        src={flashCard}
                                        alt="Flashcard icon"
                                        className="w-full h-full rounded object-cover dark:grayscale grayscale-none"
                                    />
                                </div>
                            </div>

                            <label htmlFor="fileInput">
                                <Button asChild className="min-w-44 font-[futureHeadlineBold] px-[22px] xl:px-[24px] bg-[#36AF8D] dark:bg-[#36AF8D] hover:bg-green-700 text-white dark:text-black font-semibold cursor-pointer">
                                    <span>Create New Flashcard</span>
                                </Button>
                                <input
                                    type="file"
                                    id="fileInput"
                                    multiple
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={handleFileInput}
                                />
                            </label>

                            {/* {
                                openFolder && <SubjectFolders
                                    isExpanded={openFolder}
                                    setIsExpanded={setOpenFFolder}
                                />


                            } */}

                            <UploadFilePopUp
                                selectedFile={selectedFile}
                                onSaveFile={handleSaveFile}
                            />

                        </CardContent>
                    </Card>

                    {/* Cards Due Today Section */}
                    <Card className="border-none bg-transparent dark:bg-transparent ">
                        <CardContent className="dark:bg-[#181A1D] bg-[#F3F4F9] py-8 px-5 xl:py-[10px] xl:px-[33px]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md rounded-[7px]">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={handleViewCards}
                            >
                                <div className="flex items-center flex-col gap-[13px] w-full font-pt-sans">
                                    <div className='flex justify-between w-full'>
                                        <h3 className="font-medium text-xl">Cards due today</h3>

                                        <div className="text-[#36AF8D] flex items-center text-xl font-bold">
                                            {count}    <ChevronRight className="text-gray-500 w-5 h-5" />
                                        </div>
                                    </div>

                                    {/*
                                    <Progress
                                        value={progress}
                                        className="h-2 bg-[#3D4249] dark:bg-[#3D4249] text-[#36AF8D]  dark:text-[#36AF8D]"
                                        indicatorClassName="bg-[#36AF8D]"
                                    /> */}

                                    <div className="relative w-full h-2 dark:bg-[#3D4249] bg-[#a3aebe] rounded overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-[#36AF8D] transition-all duration-300"
                                            style={{ width: "40%" }}
                                        ></div>
                                    </div>

                                    <div className="flex items-center justify-between w-full font-medium text-lg xl:text-xl">
                                        <span className="text-[#989898]">Estimated time</span>
                                        <span className="text-[#36AF8D] ">{estimatedTime} mins</span>
                                    </div>
                                </div>

                            </div>
                        </CardContent>
                    </Card>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="max-w-4xl h-[80vh] overflow-hidden bg-transparent dark:bg-transparent border-none dark:border-none">
                            <DialogHeader className='text-[22px] font-medium text-white font-[futureHeadlineBold]'>Cards due today</DialogHeader>
                            <ScrollArea className='h-full w-full'>

                                <div className="grid grid-cols-2 max-md:grid-cols-1 w-full  gap-10 mt-6">
                                    {duecards.map((data, index) => (
                                        <Card key={index} className="w-full rounded-3xl  shadow-xl border relative  font-pt-sans overflow-hidden h-[382px] max-md:h-[250px]
                                        bg-gradient-to-br from-[#E0CCF9] to-[#D1B4F6] dark:from-[#26282C] dark:to-[#181A1D] p-8 transition-all duration-300">


                                            <CardContent className="flex flex-col p-0 h-full justify-between w-full">

                                                <div className=" w-full flex items-center justify-between mb-4">
                                                    <div className="dark:text-white text-gray-500  gradient-t dark:from-[#25272B] dark:to-[#191B1E] border
                                                     dark:border-[#191B21] border-[#E0CCF9] from-slate-300 to-slate-400
                                                                       text-[15px] max-sm:text-[10px] max-sm:text-sm font-medium px-4 py-2
                                                                        max-sm:py-[3px] max-sm:px-[7px] rounded-full shadow-md ">
                                                        Subject : {data.subject}
                                                    </div>
                                                    <div className="flex items-center ">
                                                        {profiles.map((profile, index) => (
                                                            <Avatar
                                                                key={profile.id}
                                                                className={`w-[30px] h-[30px] max-sm:w-[19px] max-sm:h-[19px] border-2
                                                                     dark:border-[#202329] border-[#E0CCF9] ${index > 0 ? '-ml-4 max-sm:-ml-1' : ''}`}
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
                                                    </div>
                                                </div>

                                                <p className='text-white font-bold text-[24.505px] leading-[29.538px] font-[futureHeadlineBold] tracking-wide'>{data.title}</p>
                                                {/* Main content */}
                                                <div className="space-y-2">

                                                    <p className="text-[#36AF8D] font-medium text-[19.31px] font-pt-sans ">{data.bodySystem}</p>

                                                    <p className="text-[#6D7688] font-pt-sans font-medium text-[19.31px] ">Pdf : {data.bookName}</p>
                                                    <p className="text-[#6D7688] font-pt-sans font-medium text-[19.31px] ">Due : {new Date(data.dueDate).toDateString()}</p>
                                                </div>

                                                <div className=" absolute -right-10 -top-14 max-sm:-right-5 max-sm:-top-7  ">
                                                    <Image
                                                        src={dna}
                                                        alt="dna"
                                                        height={30}
                                                        width={30}
                                                        className="h-72 w-72 max-sm:h-40 max-sm:w-40  darK:opacity-0 opacity-30"
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>




                                    ))}
                                </div>








                            </ScrollArea>



                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>

    );
};


export default FlashcardInterface;