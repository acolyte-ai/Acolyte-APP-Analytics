import { createOrUpdateItem, getItem, getUserItems, deleteItem, FileSystemItem } from "@/lib/fileSystemUtils";
import useUserId from "@/hooks/useUserId";
import { useCallback, useEffect, useState } from "react";

/**
 * Custom hook to manage file system operations with database integration
 * @param {boolean} initialShouldUpdate - Whether to initially fetch data
 * @returns {Object} - File system operations and state
 */
export function useFileSystem(initialShouldUpdate = true) {
  const userId = useUserId();
  const [fileSystem, setFileSystem] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [shouldUpdate, setShouldUpdate] = useState(initialShouldUpdate);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial file system data
  const fetchFileSystem = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const items = await getUserItems(userId);
      setFileSystem(items || []);
    } catch (error) {
      console.error("Error fetching file system:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update file system with database sync
  const updateFileSystem = useCallback(async (newFileSystem) => {
    setFileSystem(newFileSystem);
    
    // Find modified items by comparing with previous state
    const itemsToUpdate = newFileSystem.filter(newItem => {
      const oldItem = fileSystem.find(item => item.id === newItem.id);
      return !oldItem || JSON.stringify(oldItem) !== JSON.stringify(newItem);
    });
    
    // Update each modified item in the database
    for (const item of itemsToUpdate) {
      try {
        await createOrUpdateItem({
          ...item,
          userId
        });
      } catch (error) {
        console.error(`Error updating item ${item.id}:`, error);
      }
    }
    
    // Find deleted items
    const deletedItems = fileSystem.filter(
      oldItem => !newFileSystem.some(newItem => newItem.id === oldItem.id)
    );
    
    // Delete each removed item from the database
    for (const item of deletedItems) {
      try {
        await deleteItem(userId, item.id);
      } catch (error) {
        console.error(`Error deleting item ${item.id}:`, error);
      }
    }
  }, [fileSystem, userId]);

  // Create a new folder
  const createFolder = useCallback(async (folderName, parentId = null) => {
    const newFolder = {
      id: `folder_${Date.now()}`,
      userId,
      name: folderName,
      type: "folder",
      parentId,
      createdAt: new Date().toISOString()
    };
    
    try {
      await createOrUpdateItem(newFolder);
      setFileSystem(prev => [...prev, newFolder]);
      return newFolder;
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    }
  }, [userId]);

  // Create a new file
  const createFile = useCallback(async (fileName, fileType, parentId = null, additionalData = {}) => {
    const newFile = {
      id: `file_${Date.now()}`,
      userId,
      name: fileName,
      type: "file",
      fileType,
      parentId,
      createdAt: new Date().toISOString(),
      ...additionalData
    };
    
    try {
      await createOrUpdateItem(newFile);
      setFileSystem(prev => [...prev, newFile]);
      return newFile;
    } catch (error) {
      console.error("Error creating file:", error);
      throw error;
    }
  }, [userId]);

  // Rename an item
  const renameItem = useCallback(async (itemId, newName) => {
    try {
      const item = fileSystem.find(item => item.id === itemId);
      if (!item) throw new Error("Item not found");
      
      const updatedItem = { ...item, name: newName };
      await createOrUpdateItem(updatedItem);
      
      setFileSystem(prev => 
        prev.map(item => item.id === itemId ? updatedItem : item)
      );
      return updatedItem;
    } catch (error) {
      console.error("Error renaming item:", error);
      throw error;
    }
  }, [fileSystem]);

  // Delete an item
  const deleteItemById = useCallback(async (itemId) => {
    try {
      await deleteItem(userId, itemId);
      setFileSystem(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  }, [userId]);

  // Helper: Get all items in folder and subfolders
  const getItemsInFolder = useCallback((folderId) => {
    // Start with the folder itself
    const result = [fileSystem.find(item => item.id === folderId)];
    
    // Find direct children
    const directChildren = fileSystem.filter(item => item.parentId === folderId);
    result.push(...directChildren);
    
    // Recursively find children of subfolders
    const childFolders = directChildren.filter(item => item.type === "folder");
    for (const folder of childFolders) {
      const childItems = getItemsInFolder(folder.id);
      // Filter out the folder itself as it's already included
      result.push(...childItems.filter(item => item.id !== folder.id));
    }
    
    return result;
  }, [fileSystem]);

  // Delete a folder and all its contents
  const deleteFolder = useCallback(async (folderId) => {
    try {
      const itemsToDelete = getItemsInFolder(folderId);
      
      // Delete all items from the database
      for (const item of itemsToDelete) {
        await deleteItem(userId, item.id);
      }
      
      // Update local state
      const itemIds = itemsToDelete.map(item => item.id);
      setFileSystem(prev => prev.filter(item => !itemIds.includes(item.id)));
    } catch (error) {
      console.error("Error deleting folder:", error);
      throw error;
    }
  }, [getItemsInFolder, userId]);

  // Move an item to a different folder
  const moveItem = useCallback(async (itemId, newParentId) => {
    try {
      const item = fileSystem.find(item => item.id === itemId);
      if (!item) throw new Error("Item not found");
      
      const updatedItem = { ...item, parentId: newParentId };
      await createOrUpdateItem(updatedItem);
      
      setFileSystem(prev => 
        prev.map(item => item.id === itemId ? updatedItem : item)
      );
      return updatedItem;
    } catch (error) {
      console.error("Error moving item:", error);
      throw error;
    }
  }, [fileSystem]);

  // Get current folder items
  const getCurrentItems = useCallback((filterFileType = null) => {
    return fileSystem.filter(item => {
      const isInCurrentFolder = item.parentId === currentFolder;
      
      if (!isInCurrentFolder) return false;
      
      if (filterFileType && item.type === "file") {
        return item.fileType === filterFileType;
      }
      
      return true;
    });
  }, [fileSystem, currentFolder]);

  // Effect to fetch data when needed
  useEffect(() => {
    if (shouldUpdate && userId) {
      fetchFileSystem();
      setShouldUpdate(false);
    }
  }, [shouldUpdate, fetchFileSystem, userId]);

  return {
    fileSystem,
    currentFolder,
    currentPath,
    isLoading,
    setCurrentFolder,
    setCurrentPath,
    updateFileSystem,
    setShouldUpdate,
    createFolder,
    createFile,
    renameItem,
    deleteItemById,
    deleteFolder,
    moveItem,
    getCurrentItems,
    getItemsInFolder
  };
}

/**
 * Utility to generate a unique name for a file or folder
 * @param {Array} fileSystem - The current file system
 * @param {string} baseName - The base name to use
 * @param {string} type - "file" or "folder"
 * @param {string} parentId - The parent folder ID
 * @param {string} extension - File extension (if applicable)
 * @returns {string} - A unique name
 */
export function generateUniqueName(fileSystem, baseName, type, parentId, extension = "") {
  // Check if the base name already exists
  const nameExists = fileSystem.some(
    item => 
      item.parentId === parentId &&
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

  fileSystem.forEach(item => {
    if (item.parentId === parentId && item.type === type) {
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
}