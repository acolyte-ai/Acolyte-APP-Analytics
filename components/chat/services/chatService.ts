// Types

interface DownloadMemoryParams {
  bucket_name: string;

  user_id: string;

  key: string;

  session_id?: string;
}

interface UploadMemoryParams {
  bucket_name: string;

  user_id: string;

  key: string;

  session_id: string;
}

interface S3DownloadRequest {
  bucket_name: string;

  user_id: string;

  key: string;
}

interface S3DownloadResponse {
  success: boolean;

  download_job_id: string;

  status: string;

  message: string;
}

interface ChatHistoryRequest {
  bucket_name: string;

  user_id: string;

  key: string;

  model_id: string;

  session_id: string;
}

interface DeleteFolderRequest {
  session_id: string;

  key: string;
}

interface ErrorResponse {
  success: false;

  error: string;

  detail: string;
}

interface ValidationError {
  detail: Array<{
    loc: (string | number)[];

    msg: string;

    type: string;
  }>;
}

const BASE_URL = "https://b0b28468bcb7.ngrok-free.app";

// API Client Class

class ChatService {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }


  async getChatHistory(data: { session_id: string }): Promise<Record<string, any>> {

    const response = await fetch("https://4c54lmrc5fy5hbecv53neeelra0mpwdx.lambda-url.ap-south-1.on.aws/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error fetching chat history: ${response.statusText}`);
    }

    return response.json();
  }



}









// Export for use

export default ChatService;

// Usage examples:

/*

const apiClient = new ChatService;



// Download memory

await apiClient.downloadMemory({

bucket_name: 'my-bucket',

user_id: 'user123',

key: 'memory-key',

session_id: 'session123'

});



// Upload memory

await apiClient.uploadMemory({

bucket_name: 'my-bucket',

user_id: 'user123',

key: 'memory-key',

session_id: 'session123'

});



// Start S3 download

const downloadResult = await apiClient.startS3Download({

bucket_name: 'my-bucket',

user_id: 'user123',

key: 'download-key'

});



// Get chat history

const chatHistory = await apiClient.getChatHistory({

bucket_name: 'my-bucket',

user_id: 'user123',

key: 'chat-key',

model_id: 'gpt-4o-mini',

session_id: 'session123'

});



// Delete folder

await apiClient.deleteFolder({

session_id: 'session123',

key: 'folder-key'

});

*/
