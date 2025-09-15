
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import useUserId from "@/hooks/useUserId";
import { useSettings } from "@/context/store";
import { ChevronRight } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";

interface FileSystemItem {
    id: string;
    name: string;
    type: "file" | "folder";
    fileType?: "pdf" | "note";
    parentId: string | null;
    timestamp?: any;
    isSynced: boolean;
    isTrained: boolean;
}

export default function TopBar({ setCurrentPath, setCurrentFolder, currentFolder,
    currentPath, file, fileType, setDuplicateFileInfo,
    setShowDuplicateDialog, updateFileSystem, setshouldFileSystemUplate, setcurrentDocument, saveFile, updateItemSyncTrainStatus }) {

    const userId = useUserId();
    const { fileSystem } = useSettings();

    const handleAddFileToCurrentFolder = useCallback(async () => {
        console.log(currentFolder, file?.documentId);
        if (!file?.documentId || !currentFolder) return;

        const extension = fileType === "pdf" ? ".pdf" : ".notes";
        const fileName = file.fileName.endsWith(extension)
            ? file.fileName
            : `${file.fileName}${extension}`;

        // Check if a file with the same name already exists in the current folder
        const fileExists = fileSystem.some(
            (item: any) =>
                item.parentId === currentFolder &&
                item.type === "file" &&
                item.name === fileName
        );

        if (fileExists) {
            // Show popup dialog
            setDuplicateFileInfo({
                fileName,
                fileId: file.documentId,
                extension,
            });
            setShowDuplicateDialog(true);
            return;
        }

        const newFile: FileSystemItem = {
            id: file.documentId,
            name: fileName,
            type: "file",
            fileType: fileType === "pdf" ? "pdf" : "note",
            parentId: currentFolder,
            timestamp: new Date().toISOString(), // Adds a timestamp in ISO format
            isSynced: false,
            isTrained: false
        };

        setcurrentDocument({
            id: file.documentId, title: fileName, parentId: currentFolder
        });

        const updatedFileSystem = [...fileSystem, newFile];
        updateFileSystem(updatedFileSystem);
        setshouldFileSystemUplate(true);
        if (saveFile) {
            updateFileSystem(updatedFileSystem);
            saveFile();
        }
    }, [file, currentFolder, fileType, fileSystem, updateFileSystem, saveFile]);

    const handleBackClick = useCallback(() => {
        setCurrentFolder(null);
        setCurrentPath([]);
    }, [setCurrentPath]);

    {/* Top bar with "Back" and possibly "Add" */ }
    return (

        <div className={`p-0 flex items-center py-1 mb-2 justify-between `}>



            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink onClick={handleBackClick} className="text-xl font-semibold text-[#228367] dark:text-white cursor-pointer hover:underline  underline-offset-2 px-4 py-2 rounded-md" >Subjects</BreadcrumbLink>
                    </BreadcrumbItem>

                    {currentPath.length > 0 &&
                        <>
                            <BreadcrumbSeparator className="text-xl font-semibold text-[#228367] dark:text-white" />
                            <BreadcrumbItem>
                                <BreadcrumbLink onClick={handleBackClick} className="text-xl font-semibold text-[#228367] dark:text-white cursor-pointer hover:underline underline-offset-2 px-4 py-2 rounded-md" > {currentPath.length > 0 ? `${currentPath[0]}` : ""}</BreadcrumbLink>
                            </BreadcrumbItem>
                        </>

                    }


                </BreadcrumbList>
            </Breadcrumb>




            <div className="flex items-center" style={{ zIndex: 100 }}>
                {currentFolder && file && (
                    <Button
                        variant="secondary"
                        className="bg-emerald-600 dark:bg-emerald-600"
                        size="default"
                        onClick={handleAddFileToCurrentFolder}
                    >
                        <div className=" text-black dark:text-white">Done</div>
                    </Button>
                )}
            </div>
        </div>
    )
}