

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/dev/filesystem`;

export type FileSystemItem = {
  userId: string;
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: "pdf" | "note";
  parentId: string | null;
  timestamp?: string;
};

export type ApiResponse<T> = T | { error: string };

/**
 * Create or Update a File/Folder
 */
export const createOrUpdateItem = async (
  item: FileSystemItem
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating/updating item:", error);
    return { error: "Failed to create/update item" };
  }
};

/**
 * Get a Single File/Folder by ID
 */
export const getItem = async (
  userId: string,
  itemId: string
): Promise<ApiResponse<FileSystemItem>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/item/${userId}/${itemId}`, {
      cache: "no-store", // Prevent cached response (if applicable)
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching item:", error);
    return { error: "Failed to fetch item" };
  }
};


/**
 * Get All Files/Folders for a User
 */
export const getUserItems = async (
  userId: string
): Promise<ApiResponse<FileSystemItem[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${userId}/items`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching user items:", error);
    return { error: "Failed to fetch user items" };
  }
};

/**
 * Delete a File/Folder
 */
export const deleteItem = async (
  userId: string,
  itemId: string
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/item/${userId}/${itemId}`, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting item:", error);
    return { error: "Failed to delete item" };
  }
};



