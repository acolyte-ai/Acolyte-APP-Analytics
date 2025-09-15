import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { deletePdfFromCloud } from "@/lib/pdfUtils";
import { deleteUserNote } from "@/lib/noteUtils";
import { deleteAnnotations } from "@/lib/pdfAnnotaionsUtils";
import { getAllPdfs, getPdfById } from "@/db/pdf/pdfFiles";

/**
 * Complete File System Operations Hook
 * Handles all file and folder operations in one comprehensive hook
 */
const useFileSystemOperations = () => {

    // ============================================
    // FILE OPERATIONS
    // ============================================

    // 📁 FILE STORING
    const storePdfInDb = useCallback(async (file, fileId, addPdf, pdfCache, onProgress) => {
        try {
            const { arrayBuffer } = await readFileAsArrayBufferWithProgress(file, onProgress);
            await pdfCache.storePdf(fileId, arrayBuffer);

            await addPdf({
                documentId: fileId,
                name: file.name,
                size: formatFileSize(file.size),
                uploadTime: new Date().toLocaleString(),
                status: "complete",
                inCache: true,
                cacheTimestamp: Date.now(),
            });

            return { success: true, fileId };
        } catch (error) {
            console.error("Error storing PDF in DB:", error);
            throw error;
        }
    }, []);

    const addFileToFileSystem = useCallback((fileData, currentFolder, userId) => {
        const fileToAdd = {
            id: fileData.id || uuidv4(),
            name: fileData.name,
            type: "file",
            fileType: fileData.fileType || "pdf",
            isSynced: false,
            isTrained: false,
            isStartedTraining: false,
            parentId: currentFolder,
            timeStamp: new Date(),
            userId: userId
        };

        return fileToAdd;
    }, []);

    // 📖 FILE READING
    const fetchAllPdfsFromDb = useCallback(async () => {
        try {
            const pdfs = await getAllPdfs();
            return pdfs;
        } catch (error) {
            console.error("Error fetching PDFs from DB:", error);
            return [];
        }
    }, []);

    const getPdfFromDbById = useCallback(async (fileId) => {
        try {
            const doc = await getPdfById(fileId);
            return doc;
        } catch (error) {
            console.error("Error fetching PDF by ID:", error);
            return null;
        }
    }, []);

    const readFileAsArrayBufferWithProgress = useCallback((file, onProgress) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onprogress = (event) => {
                if (event.lengthComputable && onProgress) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    onProgress(progress);
                }
            };

            reader.onload = (event) => {
                if (onProgress) onProgress(100);
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
    }, []);

    // 🔍 FILE VALIDATION
    const validateFileType = useCallback((file) => {
        const isValidType = file.type === "application/pdf";
        const isValidExtension = file.name.toLowerCase().endsWith('.pdf');

        return {
            isValid: isValidType && isValidExtension,
            error: !isValidType ? "Only PDF files are allowed" : null
        };
    }, []);

    const validateFiles = useCallback((files) => {
        const results = [];
        const validFiles = [];

        files.forEach(file => {
            const validation = validateFileType(file);
            results.push({ file, ...validation });
            if (validation.isValid) {
                validFiles.push(file);
            }
        });

        return {
            results,
            validFiles,
            hasInvalidFiles: results.some(r => !r.isValid),
            invalidCount: results.filter(r => !r.isValid).length
        };
    }, [validateFileType]);

    // 🗑️ FILE DELETING
    const deleteFileFromDb = useCallback(async (fileId, userId, fileType) => {
        try {
            if (fileType === "pdf") {
                await deletePdfFromCloud(userId, fileId);
                await deleteAnnotations(userId, fileId);
                await deleteUserNote(fileId, userId);
            } else if (fileType === "note") {
                await deleteUserNote(fileId, userId);
            }

            return { success: true };
        } catch (error) {
            console.error("Error deleting file from DB:", error);
            throw error;
        }
    }, []);

    const deleteMultipleFiles = useCallback(async (fileIds, userId, fileTypes) => {
        const results = [];

        for (let i = 0; i < fileIds.length; i++) {
            try {
                await deleteFileFromDb(fileIds[i], userId, fileTypes[i]);
                results.push({ fileId: fileIds[i], success: true });
            } catch (error) {
                results.push({ fileId: fileIds[i], success: false, error: error.message });
            }
        }

        return {
            results,
            successCount: results.filter(r => r.success).length,
            failureCount: results.filter(r => !r.success).length
        };
    }, [deleteFileFromDb]);

    // ============================================
    // FOLDER OPERATIONS
    // ============================================

    // 📁 FOLDER CREATION
    const createFolderInFileSystem = useCallback((folderName, currentFolder) => {
        const newFolder = {
            id: Date.now().toString(),
            name: folderName,
            type: "folder",
            parentId: currentFolder,
            isSynced: false,
            isTrained: false,
        };

        return newFolder;
    }, []);

    // 🗑️ FOLDER DELETING
    const deleteFolderAndContents = useCallback(async (folderId, fileSystem, userId) => {
        try {
            const itemsToDelete = getItemsInFolder(folderId, fileSystem);

            for (const item of itemsToDelete) {
                if (item.type === "file") {
                    await deleteFileFromDb(item.id, userId, item.fileType);
                }
            }

            const idsToDelete = itemsToDelete.map((item) => item.id);
            return idsToDelete;
        } catch (error) {
            console.error("Error deleting folder and contents:", error);
            throw error;
        }
    }, [deleteFileFromDb]);

    const getItemsInFolder = useCallback((folderId, fileSystemItems) => {
        const result = [fileSystemItems.find((item) => item.id === folderId)];
        const directChildren = fileSystemItems.filter(
            (item) => item.parentId === folderId
        );
        result.push(...directChildren);

        const childFolders = directChildren.filter(
            (item) => item.type === "folder"
        );

        for (const folder of childFolders) {
            const childItems = getItemsInFolder(folder.id, fileSystemItems);
            result.push(...childItems.filter((item) => item.id !== folder.id));
        }

        return result;
    }, []);

    // 📋 FOLDER READING & NAVIGATION
    const getRootFolders = useCallback((fileSystem) => {
        if (!fileSystem) return [];
        return fileSystem.filter(item =>
            item.type === "folder" && item.parentId === null
        );
    }, []);

    const getAllSubfolders = useCallback((fileSystem) => {
        if (!fileSystem) return [];
        return fileSystem.filter(item =>
            item.type === "folder" && item.parentId !== null
        );
    }, []);

    const getSubFoldersOf = useCallback((parentId, fileSystem) => {
        if (!fileSystem) return [];
        return fileSystem.filter(item =>
            item.type === "folder" && item.parentId === parentId
        );
    }, []);

    const getFolderById = useCallback((folderId, fileSystem) => {
        if (!fileSystem) return null;
        return fileSystem.find(item =>
            item.id === folderId && item.type === "folder"
        );
    }, []);

    const getFolderNameById = useCallback((folderId, fileSystem) => {
        const folder = fileSystem?.find(item => item.id === folderId);
        return folder ? folder.name : "Unknown Folder";
    }, []);

    const getCurrentFolderItems = useCallback((currentFolder, fileSystem, fileType = "root") => {
        if (!currentFolder) {
            return fileSystem?.filter((item) => item?.parentId === null);
        }

        return fileSystem.filter((item) =>
            item.parentId === currentFolder &&
            (item.type === "file"
                ? fileType === "root" || item.fileType === fileType
                : true)
        );
    }, []);

    // 🔍 FOLDER UTILITIES
    const searchFolders = useCallback((folders, searchTerm) => {
        if (!searchTerm.trim()) return folders;

        const term = searchTerm.toLowerCase();
        return folders.filter(folder =>
            folder.name.toLowerCase().includes(term)
        );
    }, []);

    const sortFolders = useCallback((folders, sortBy = 'name', sortOrder = 'asc') => {
        const sorted = [...folders].sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'date':
                    aValue = new Date(a.timeStamp || a.createdAt);
                    bValue = new Date(b.timeStamp || b.createdAt);
                    break;
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, []);

    // ============================================
    // PERMISSIONS & VALIDATION
    // ============================================

    const isSubfolder = useCallback((currentFolder, fileSystem) => {
        if (!currentFolder || !fileSystem) return false;
        const folder = fileSystem.find(item => item.id === currentFolder);
        return folder && folder.parentId !== null;
    }, []);

    const isRootFolder = useCallback((currentFolder, fileSystem) => {
        if (!currentFolder || !fileSystem) return false;
        const folder = fileSystem.find(item => item.id === currentFolder);
        return folder && folder.parentId === null;
    }, []);

    const canUploadFiles = useCallback((currentFolder, fileSystem) => {
        return isSubfolder(currentFolder, fileSystem);
    }, [isSubfolder]);

    const canCreateFolders = useCallback((currentFolder, fileSystem) => {
        return isRootFolder(currentFolder, fileSystem);
    }, [isRootFolder]);

    // ============================================
    // SHARED UTILITIES
    // ============================================

    const formatFileSize = useCallback((size) => {
        return size < 1024
            ? size + " bytes"
            : size < 1048576
                ? (size / 1024).toFixed(2) + " KB"
                : (size / 1048576).toFixed(2) + " MB";
    }, []);

    const getFileExtension = useCallback((filename) => {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    }, []);

    const getFileNameWithoutExtension = useCallback((filename) => {
        return filename.replace(/\.[^/.]+$/, "");
    }, []);

    const generateUniqueName = useCallback((baseName, type, extension = "", fileSystem, currentFolder) => {
        const nameExists = fileSystem.some(
            (item) =>
                item.parentId === currentFolder &&
                item.type === type &&
                item.name === (type === "file" ? `${baseName}${extension}` : baseName)
        );

        if (!nameExists) {
            return type === "file" ? `${baseName}${extension}` : baseName;
        }

        const regex = new RegExp(
            `${baseName} \\((\\d+)\\)${type === "file" ? extension : ""}`
        );
        let highestNum = 0;

        fileSystem.forEach((item) => {
            if (item.parentId === currentFolder && item.type === type) {
                const match = item.name.match(regex);
                if (match && parseInt(match[1]) > highestNum) {
                    highestNum = parseInt(match[1]);
                }
            }
        });

        return type === "file"
            ? `${baseName} (${highestNum + 1})${extension}`
            : `${baseName} (${highestNum + 1})`;
    }, []);

    const updateItemSyncTrainStatus = useCallback((fileSystem, itemId, isSynced, isTrained) => {
        return fileSystem.map((item) => {
            if (item.id === itemId) {
                return { ...item, isSynced, isTrained };
            }
            return item;
        });
    }, []);

    const renameItem = useCallback((fileSystem, itemId, newName) => {
        const itemToRename = fileSystem?.find((item) => item.id === itemId);
        if (!itemToRename) return fileSystem;

        let baseName = newName.trim();
        let extension = "";

        if (itemToRename.type === "file") {
            extension = itemToRename.fileType === "pdf" ? ".pdf" : ".notes";
            if (baseName.endsWith(extension)) {
                baseName = baseName.substring(0, baseName.length - extension.length);
            }
        }

        const finalName = generateUniqueName(
            baseName,
            itemToRename.type,
            extension,
            fileSystem,
            itemToRename.parentId
        );

        return fileSystem.map((item) => {
            if (item.id === itemId) {
                return { ...item, name: finalName };
            }
            return item;
        });
    }, [generateUniqueName]);

    // 🔍 SEARCH & FILTER
    const searchFiles = useCallback((files, searchTerm) => {
        if (!searchTerm.trim()) return files;

        const term = searchTerm.toLowerCase();
        return files.filter(file =>
            file.name.toLowerCase().includes(term) ||
            file.fileType.toLowerCase().includes(term)
        );
    }, []);

    const filterFilesByType = useCallback((files, fileType) => {
        if (fileType === "root" || !fileType) return files;
        return files.filter(file => file.fileType === fileType);
    }, []);

    const sortFiles = useCallback((files, sortBy = 'name', sortOrder = 'asc') => {
        const sorted = [...files].sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'size':
                    aValue = a.size || 0;
                    bValue = b.size || 0;
                    break;
                case 'date':
                    aValue = new Date(a.timeStamp || a.uploadTime);
                    bValue = new Date(b.timeStamp || b.uploadTime);
                    break;
                case 'type':
                    aValue = a.fileType;
                    bValue = b.fileType;
                    break;
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, []);

    // 📊 STATISTICS
    const getFileStatistics = useCallback((files) => {
        const stats = {
            total: files.length,
            byType: {},
            totalSize: 0,
            synced: 0,
            trained: 0
        };

        files.forEach(file => {
            stats.byType[file.fileType] = (stats.byType[file.fileType] || 0) + 1;

            if (file.size) {
                const sizeInBytes = typeof file.size === 'string'
                    ? parseInt(file.size) || 0
                    : file.size;
                stats.totalSize += sizeInBytes;
            }

            if (file.isSynced) stats.synced++;
            if (file.isTrained) stats.trained++;
        });

        return stats;
    }, []);

    const getFolderStatistics = useCallback((folders, files) => {
        const stats = {
            totalFolders: folders.length,
            rootFolders: folders.filter(f => f.parentId === null).length,
            subFolders: folders.filter(f => f.parentId !== null).length,
            filesPerFolder: {}
        };

        folders.forEach(folder => {
            const filesInFolder = files.filter(file => file.parentId === folder.id);
            stats.filesPerFolder[folder.id] = {
                folderName: folder.name,
                fileCount: filesInFolder.length,
                files: filesInFolder
            };
        });

        return stats;
    }, []);

    // ============================================
    // COMPLETE OPERATIONS
    // ============================================

    const uploadFileComplete = useCallback(async (file, fileId, currentFolder, userId, addPdf, pdfCache, onProgress) => {
        try {
            const validation = validateFileType(file);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            await storePdfInDb(file, fileId, addPdf, pdfCache, onProgress);

            const fileSystemEntry = addFileToFileSystem(
                { id: fileId, name: file.name, fileType: "pdf" },
                currentFolder,
                userId
            );

            return { success: true, fileSystemEntry };
        } catch (error) {
            console.error("Error in complete file upload:", error);
            throw error;
        }
    }, [validateFileType, storePdfInDb, addFileToFileSystem]);

    const uploadMultipleFilesComplete = useCallback(async (files, currentFolder, userId, addPdf, pdfCache, onProgress) => {
        const results = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileId = uuidv4();

            try {
                const result = await uploadFileComplete(
                    file,
                    fileId,
                    currentFolder,
                    userId,
                    addPdf,
                    pdfCache,
                    (progress) => onProgress && onProgress(i, progress)
                );
                results.push({ file, success: true, ...result });
            } catch (error) {
                results.push({ file, success: false, error: error.message });
            }
        }

        return {
            results,
            successCount: results.filter(r => r.success).length,
            failureCount: results.filter(r => !r.success).length
        };
    }, [uploadFileComplete]);

    const createFolderComplete = useCallback((baseName, currentFolder, fileSystem) => {
        const uniqueName = generateUniqueName(baseName, "folder", "", fileSystem, currentFolder);
        const newFolder = createFolderInFileSystem(uniqueName, currentFolder);
        return newFolder;
    }, [generateUniqueName, createFolderInFileSystem]);

    const deleteItemComplete = useCallback(async (itemId, fileSystem, userId) => {
        const itemToDelete = fileSystem.find((item) => item.id === itemId);
        if (!itemToDelete) return { success: false, message: "Item not found" };

        try {
            if (itemToDelete.type === "folder") {
                const idsToDelete = await deleteFolderAndContents(itemId, fileSystem, userId);
                const updatedFileSystem = fileSystem.filter(
                    (item) => !idsToDelete.includes(item.id)
                );
                return { success: true, updatedFileSystem };
            } else {
                await deleteFileFromDb(itemId, userId, itemToDelete.fileType);
                const updatedFileSystem = fileSystem.filter((item) => item.id !== itemId);
                return { success: true, updatedFileSystem };
            }
        } catch (error) {
            console.error("Error in complete item deletion:", error);
            return { success: false, message: error.message };
        }
    }, [deleteFolderAndContents, deleteFileFromDb]);

    // ============================================
    // RETURN ALL FUNCTIONS
    // ============================================

    return {
        // 📁 FILE OPERATIONS
        storePdfInDb,
        addFileToFileSystem,
        fetchAllPdfsFromDb,
        getPdfFromDbById,
        readFileAsArrayBufferWithProgress,
        validateFileType,
        validateFiles,
        deleteFileFromDb,
        deleteMultipleFiles,
        searchFiles,
        filterFilesByType,
        sortFiles,
        getFileStatistics,

        // 📂 FOLDER OPERATIONS
        createFolderInFileSystem,
        deleteFolderAndContents,
        getItemsInFolder,
        getRootFolders,
        getAllSubfolders,
        getSubFoldersOf,
        getFolderById,
        getFolderNameById,
        getCurrentFolderItems,
        searchFolders,
        sortFolders,
        getFolderStatistics,

        // 🔐 PERMISSIONS & VALIDATION
        isSubfolder,
        isRootFolder,
        canUploadFiles,
        canCreateFolders,

        // 🛠️ SHARED UTILITIES
        formatFileSize,
        getFileExtension,
        getFileNameWithoutExtension,
        generateUniqueName,
        updateItemSyncTrainStatus,
        renameItem,

        // ⚡ COMPLETE OPERATIONS
        uploadFileComplete,
        uploadMultipleFilesComplete,
        createFolderComplete,
        deleteItemComplete
    };
};

export default useFileSystemOperations;