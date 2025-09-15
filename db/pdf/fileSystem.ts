
// These interfaces can be kept the same
interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemItem[];
  isSynced:boolean;
  isTrained:boolean
}

// Simple function to get file system from the hook
export const getFileSystem = (fileSystemData: FileSystemItem[]): FileSystemItem[] => {
  return fileSystemData || [];
};



// Get file by ID from the file system
export const getFileById = (fileSystemData: FileSystemItem[], id: string): FileSystemItem | null => {
  // Handle the case where fileSystemData might be null or undefined
  if (!fileSystemData || !fileSystemData.length) {
    return null;
  }

  const findFile = (items: FileSystemItem[]): FileSystemItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findFile(item.children);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findFile(fileSystemData);
};

// Mark a PDF as trained
export const markPdfAsTrained = (
  fileSystemData: FileSystemItem[], 
  setfileSystem,
  documentId: string
) => {
  try {
    // Handle the case where fileSystemData might be null or undefined
    if (!fileSystemData || !fileSystemData.length) {
      console.error('Cannot mark PDF as trained: File system is empty');
      return;
    }

    const newFileSystem = [...fileSystemData];

    const updateFile = (items) => {
      for (const item of items) {
        if (item.id === documentId) {
          item.isTrained = true;
          return true;
        }
        if (item.children) {
          const found = updateFile(item.children);
          if (found) return true;
        }
      }
      return false;
    };

    if (updateFile(newFileSystem)) {
      setfileSystem(newFileSystem);
    } else {
      throw new Error('File not found');
    }
  } catch (error) {
    console.error('Failed to mark PDF as trained:', error);
    throw new Error('Failed to mark PDF as trained');
  }
};

// Mark a PDF as synced
export const markPdfAsSynced = (
  fileSystemData: FileSystemItem[], 
  setfileSystem,
  documentId: string
) => {
  try {
    // Handle the case where fileSystemData might be null or undefined
    if (!fileSystemData || !fileSystemData.length) {
      console.error('Cannot mark PDF as synced: File system is empty');
      return;
    }
    
    const newFileSystem = [...fileSystemData];

    const updateFile = (items) => {
      for (const item of items) {
        if (item.id === documentId) {
          item.isSynced = true;
          return true;
        }
        if (item.children) {
          const found = updateFile(item.children);
          if (found) return true;
        }
      }
      return false;
    };

    if (updateFile(newFileSystem)) {
       setfileSystem(newFileSystem);
    } else {
      throw new Error('File not found');
    }
  } catch (error) {
    console.error('Failed to mark PDF as synced:', error);
    throw new Error('Failed to mark PDF as synced');
  }
};



// Mark a PDF as started training
export const markPdfAsStartedTraining = (
  fileSystemData: FileSystemItem[], 
  setfileSystem,
  documentId: string
) => {
  try {
    if (!fileSystemData || !fileSystemData.length) {
      console.error('Cannot mark PDF as started training: File system is empty');
      return;
    }
    
    
    const newFileSystem = [...fileSystemData];

    const updateFile = (items) => {
      for (const item of items) {
        if (item.id === documentId) {
          item.isStartedTraining = true;
          return true;
        }
        if (item.children) {
          const found = updateFile(item.children);
          if (found) return true;
        }
      }
      return false;
    };

    console.log("setting pdf as ,marked",newFileSystem)
    if (updateFile(newFileSystem)) {
      setfileSystem(newFileSystem);
    } else {
      throw new Error('File not found');
    }
  } catch (error) {
    console.error('Failed to mark PDF as started training:', error);
    throw new Error('Failed to mark PDF as started training');
  }
};


// Clear the file system
export const clearFileSystem = (setfileSystemData) => {
  try {
    setfileSystemData([]);
    console.log('File system cleared successfully');
  } catch (error) {
    console.error('Failed to clear file system:', error);
    throw new Error('Failed to clear file system');
  }
};

// Get PDF by ID
export const getPdfById = (fileSystemData: FileSystemItem[], documentId: string): FileSystemItem | null => {
  // Handle the case where fileSystemData might be null or undefined
  if (!fileSystemData || !fileSystemData.length) {
    return null;
  }
  
  const findPdf = (items: FileSystemItem[]): FileSystemItem | null => {
    for (const item of items) {
      if (item.id === documentId && item.type === 'file' && item.fileType === 'pdf') {
        return item;
      }
      if (item.children) {
        const found = findPdf(item.children);
        if (found) return found;
      }
    }
    return null;
  };

  return findPdf(fileSystemData);
};





