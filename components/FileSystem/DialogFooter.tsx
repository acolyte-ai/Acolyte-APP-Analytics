import { useCallback } from "react";
import { Button } from "../ui/button";
import useUserId from "@/hooks/useUserId";
import { useSettings } from "@/context/store";


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

interface Props {
    setshouldFileSystemUplate: (value) => void
    setShowDuplicateDialog: (value) => void
    setDuplicateFileInfo: (value) => void
    setcurrentDocument: (value) => void
    setFileSystem: (value) => void
    saveFile: () => void | undefined;
    currentFolder: string | null;
    duplicateFileInfo: any;
    updateFileSystem: (items: FileSystemItem[]) => void;
    updateItemSyncTrainStatus?: (itemId: string, isSynced: boolean, isTrained: boolean) => void;
}

export default function DialogFooter({ setshouldFileSystemUplate, updateFileSystem, setShowDuplicateDialog,
    setDuplicateFileInfo, setcurrentDocument, currentFolder, duplicateFileInfo, saveFile,
}: Props) {
    const { fileSystem } = useSettings();

    const generateUniqueName = useCallback(
        (baseName, type, extension = "") => {
            // Check if the base name already exists
            const nameExists = fileSystem.some(
                (item: any) =>
                    item.parentId === currentFolder &&
                    item.type === type &&
                    item.name === (type === "file" ? `${baseName}${extension}` : baseName)
            );

            // If no duplicate exists, return the original name
            if (!nameExists) {
                return type === "file" ? `${baseName}${extension}` : baseName;
            }

            // Find the highest existing number
            const regex = new RegExp(
                `${baseName} \\((\\d+)\\)${type === "file" ? extension : ""}`
            );
            let highestNum = 0;

            fileSystem.forEach((item: any) => {
                if (item.parentId === currentFolder && item.type === type) {
                    const match = item.name.match(regex);
                    if (match && parseInt(match[1]) > highestNum) {
                        highestNum = parseInt(match[1]);
                    }
                }
            });

            // Return name with incremented number
            return type === "file"
                ? `${baseName} (${highestNum + 1})${extension}`
                : `${baseName} (${highestNum + 1})`;
        },
        [fileSystem, currentFolder]
    );


    const handleReplaceDuplicate = useCallback(async () => {
        if (!duplicateFileInfo || !currentFolder) return;

        // Remove the existing file with the same name
        const filteredFiles = fileSystem.filter(
            (item: any) =>
                !(
                    item.parentId === currentFolder &&
                    item.type === "file" &&
                    item.name === duplicateFileInfo.fileName
                )
        );

        // Add the new file
        const newFile: FileSystemItem = {
            id: duplicateFileInfo.fileId,
            name: duplicateFileInfo.fileName,
            type: "file",
            fileType: duplicateFileInfo.extension === ".pdf" ? "pdf" : "note",
            parentId: currentFolder,
            isSynced: false,
            isTrained: false
        };

        setcurrentDocument({
            id: duplicateFileInfo.fileId,
            title: duplicateFileInfo.fileName,
            parentId: currentFolder
        });

        const updatedFileSystem = [...filteredFiles, newFile];
        await updateFileSystem(updatedFileSystem);
        setshouldFileSystemUplate(true);
        if (saveFile) {
            saveFile();
        }

        // Close the dialog
        setShowDuplicateDialog(false);
        setDuplicateFileInfo(null);
    }, [duplicateFileInfo, currentFolder, fileSystem, updateFileSystem, saveFile]);




    const handleCreateNewDuplicate = useCallback(async () => {
        if (!duplicateFileInfo || !currentFolder) return;

        // Get base name without extension
        const baseName = duplicateFileInfo.fileName.replace(
            duplicateFileInfo.extension,
            ""
        );

        // Generate unique name
        const newFileName = generateUniqueName(
            baseName,
            "file",
            duplicateFileInfo.extension
        );

        // Add the new file with a suffix
        const newFile: FileSystemItem = {
            id: duplicateFileInfo.fileId,
            name: newFileName,
            type: "file",
            fileType: duplicateFileInfo.extension === ".pdf" ? "pdf" : "note",
            parentId: currentFolder,
            isSynced: false,
            isTrained: false
        };

        setcurrentDocument({ id: duplicateFileInfo.fileId, title: newFileName, parentId: currentFolder });

        const updatedFileSystem = [...fileSystem, newFile];
        await updateFileSystem(updatedFileSystem);
        setshouldFileSystemUplate(true);
        if (saveFile) {
            saveFile();
        }

        // Close the dialog
        setShowDuplicateDialog(false);
        setDuplicateFileInfo(null);
    }, [duplicateFileInfo, currentFolder, fileSystem, updateFileSystem, saveFile, generateUniqueName]);

    {/* Dialog Footer */ }
    return (
        < div className="p-4 bg-gray-50 flex justify-end space-x-2" >
            <Button
                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
                onClick={handleCreateNewDuplicate}
            >
                Create new
            </Button>
            <Button
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                onClick={handleReplaceDuplicate}
            >
                Replace
            </Button>
        </div >

    )
}