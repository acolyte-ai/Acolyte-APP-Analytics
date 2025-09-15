import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RiCloseFill, RiArrowLeftLine } from 'react-icons/ri';
import SubjectFolders from '@/components/FileSystem/SubjectFolders';
import FileUploadUI from '@/components/Exam/UI/InputFileUI';
import { useSettings } from '@/context/store';
import useUserId from '@/hooks/useUserId';
import { generateFlashcard, storeFlashcard } from '../services/flashcardService';
import { toast } from 'sonner';
import FlashCardUI from '../flashcard/flashCard';
import Image from 'next/image';
import folderIcon from '@/public/newIcons/pdf.svg';
import foldertype from "@/public/folderIcon.svg"

// Loading Animation Component
const LoadingAnimation = () => {
    return (
        <div className="fixed h-[80vh] -mt-20 inset-0 z-50 flex  items-center justify-center  bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 shadow-xl">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Generating Flashcard</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Please wait while we create your flashcard...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Topic Input Component
const TopicInput = ({ onTopicChange, topic }) => {
    return (
        <div className="py-4 max-lg:py-2 h-auto 2xl:mb-[14px] mb-[14px]">
            <input
                type="text"
                value={topic}
                onChange={(e) => onTopicChange(e.target.value)}
                placeholder="Enter topic name..."
                className="w-full px-4 py-4 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white
                 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 flex items-center
                  focus:ring-emerald-700 focus:border-transparent"
            />
        </div>
    );
};

const FlashcardDeckDialoguebox = () => {
    const { openPmDialogBox, setOpenPmDialogBox, selectedFile, setSelectedFile, fileSystem, flashcardWord, setFlashcardWord } = useSettings()
    const [topic, setTopic] = useState(flashcardWord || "")
    const userId = useUserId()
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedFlashcard, setGeneratedFlashcard] = useState(null)
    const [showFlashcard, setShowFlashcard] = useState(false)

    const handleTopicChange = (newTopic) => {
        setTopic(newTopic);
    };

    // Function to get file extension
    const getFileType = (fileName) => {
        if (!fileName) return '';
        const extension = fileName.split('.').pop();
        return extension ? extension.toUpperCase() : '';
    };

    // Function to get subject name
    const getSubjectName = () => {
        if (!selectedFile.id) return '';

        const ids = selectedFile.id;
        const extractId = fileSystem.filter((item) => item.id === ids)[0];
        if (!extractId) return '';

        const files = fileSystem.filter(
            (item) => item.type === "folder" && item.id === extractId.parentId
        )[0];
        if (!files) return '';

        let folderName;

        if (files.parentId !== null) {
            const parentFiles = fileSystem.filter(
                (item) => item.type === "folder" && item.id === extractId.parentId
            )[0].parentId;
            const fys = fileSystem.filter(
                (item) => item.type === "folder" && item.id === parentFiles
            )[0];

            folderName = fys.name;
        } else {
            folderName = files.name;
        }

        return folderName ?? "Anatomy";
    };

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error("Please enter a topic name");
            return;
        }

        if (!userId) {
            toast.error("User authentication required");
            return;
        }

        const ids = selectedFile.id;
        const subject = getSubjectName();

        try {
            setIsGenerating(true);

            // Call the API to generate a flashcard
            const flashcard = await generateFlashcard(
                topic,
                userId,
                ids,
                subject
            );
            console.log("Flashcard generated:", flashcard);

            if (!flashcard) {
                toast.warning("Failed to generate flashcard");
                return;
            }

            const flashCardData = {
                userId: userId,
                flashcardTopic: flashcard?.topic,
                difficulty: flashcard?.difficulty,
                description: flashcard?.description,
                heading: flashcard?.title,
                docId: ids,
                // pageNo: 1,
                title: flashcard?.title,
                text: topic,
                bodySystem: flashcard?.body_system,
                subject: subject,



            };
            console.log("This is flashcards", flashCardData);

            // Call the API to store the flashcard
            const success = await storeFlashcard(flashCardData);

            if (success) {
                toast.success("Flashcard created successfully! 🎉", {
                    position: "bottom-right",
                });
                // Store the generated flashcard data and show it
                setGeneratedFlashcard({
                    ...flashCardData,
                    flashcard_id: success.flashcard?.flashcard_id,
                    front: flashcard?.title || topic,
                    back: flashcard?.description || 'Flashcard content'
                });
                setShowFlashcard(true);
            } else {
                toast.warning("Failed to save flashcard");
            }

        } catch (error) {
            console.error("Error generating flashcard:", error);
            toast.error("An error occurred while generating flashcard");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleBackToCreate = () => {
        setShowFlashcard(false);
        setGeneratedFlashcard(null);
        setTopic('');
    };

    // If showing flashcard, render the flashcard view
    if (showFlashcard && generatedFlashcard) {
        return (
            <div className="w-full p-4 mt-10">
                <div className="mb-6 font-pt-sans">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={handleBackToCreate}
                            className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                        >
                            <RiArrowLeftLine size={20} />
                            Back to Create
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Your Generated Flashcard</h1>
                    {/* <p className="text-sm text-zinc-600 dark:text-zinc-400">Review your flashcard and create more if needed</p> */}
                </div>

                <div className="flex justify-center">
                    <FlashCardUI
                        flashcardData={generatedFlashcard}
                        onClose={() => handleBackToCreate()}
                    />
                </div>

                <div className="flex justify-end mt-10 max-sm:mt-6">
                    <button
                        onClick={handleBackToCreate}
                        className="px-6 max-md:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors max-md:text-xs font-medium"
                    >
                        Create Another Flashcard
                    </button>
                </div>
            </div>
        );
    }

    // Default create flashcard view
    return (
        <div className="w-full p-7 mt-10 dark:bg-[#181A1D] bg-[#F3F4F9] space-x-2 dark:border-none border relative
         border-[#B8B8B8]  rounded-lg font-[futureHeadline]">
            {/* Loading Animation */}
            {isGenerating && <LoadingAnimation />}

            <div className=" ">
                <h1 className="text-2xl  text-zinc-900 font-[futureHeadlineBold] tracking-wide font-thin dark:text-white mb-2">{selectedFile.fileName ? "Selected Document" : "Create Flashcards"} </h1>
                <p className="text-[16px] text-zinc-600 dark:text-zinc-400 font-pt-sans">{selectedFile.fileName ? "Organize this Pdf in your library" : "Choose a file and type your name of the flashcard"}</p>
            </div>

            {
                selectedFile.fileName && <button
                    onClick={() => {
                        setSelectedFile({ fileName: "", id: "", fileType: "", subject: "" })
                        setFlashcardWord("")
                    }}
                    className="absolute top-5 right-5 transition-colors z-10"
                >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            }

            <div className="space-y-[47px] mt-[18px] ">

                <div className=''>
                    {!selectedFile?.fileName ?
                        <div onClick={() => setOpenPmDialogBox(true)}>
                            <FileUploadUI

                            />
                        </div> :
                        <div className="relative w-full  py-[19px] px-[22px] bg-[#282A2E]/5 dark:bg-[#282A2E] dark:hover:bg-[#282B2E]
                         dark:text-white text-black rounded-xl  transition-colors ">
                            {/* Close Button */}
                            <div className="space-y-6 w-full">
                                {/* File Name */}
                                <div className="flex items-start gap-6">
                                    <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                                        <Image
                                            src={folderIcon}
                                            alt={"File Icon"}
                                            className="w-7 h-6 object-contain"
                                            priority={true}
                                            height={50}
                                            width={50}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-lg font-[futureHeadline] font-normal text-[#888888]  tracking-wide">File Name</div>
                                        <div className="text-base  dark:text-white font-[futureHeadlineBold] tracking-wide font-thin text-black mt-1 break-words">{selectedFile.fileName}</div>
                                    </div>
                                </div>

                                {/* File Type */}
                                <div className="flex items-start gap-6">
                                    <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                                        <Image
                                            src={foldertype}
                                            alt={"File Type Icon"}
                                            className="w-7 h-6 object-contain"
                                            priority={true}
                                            height={50}
                                            width={50}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-lg font-[futureHeadline] font-normal text-[#888888]  tracking-wide">File Type</div>
                                        <div className="text-base font-[futureHeadlineBold] tracking-wide font-thin dark:text-white text-black mt-1">{getFileType(selectedFile.fileName)}</div>
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="flex items-start gap-6">
                                    <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                                        <Image
                                            src={folderIcon}
                                            alt={"Subject Icon"}
                                            className="w-7 h-6 object-contain"
                                            priority={true}
                                            height={50}
                                            width={50}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-lg  text-[#888888] font-[futureHeadline] font-normal tracking-wide">Subject</div>
                                        <div className="text-base font-[futureHeadlineBold] font-thin tracking-wide  dark:text-white text-black mt-1">{getSubjectName()}</div>
                                    </div>
                                </div>


                            </div>

                        </div>

                    }
                </div>

                {openPmDialogBox && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center ">
                        <div
                            className="absolute inset-0 dark:bg-black bg-opacity-50 backdrop-blur-sm"
                            onClick={() => setOpenPmDialogBox(false)}
                        />
                        <div className="relative z- max-w-4xl max-h-[90vh] w-full mx-4 rounded-lg  overflow-hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-8  right-[21%] z-20 rounded-full hover:bg-white/20 text-white"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenPmDialogBox(false);
                                }}
                            >
                                <RiCloseFill
                                    size={60}
                                    className="scale-150 dark:text-white text-black text-xl"
                                />
                            </Button>
                            <SubjectFolders
                                isExpanded={false}
                                setIsExpanded={() => setOpenPmDialogBox(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Simple Topic Input */}
                <TopicInput
                    topic={topic}
                    onTopicChange={handleTopicChange}
                />

            </div>

            <div className="flex gap-4 mt-6 justify-end">
                <button
                    className="px-6 py-2 bg-emerald-600 text-[18px] hover:bg-emerald-700 dark:text-black text-white rounded-lg
                     transition-colors font-semiBold disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? 'Generating...' : 'Generate Flashcard'}
                </button>
            </div>

            <style jsx>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default FlashcardDeckDialoguebox;