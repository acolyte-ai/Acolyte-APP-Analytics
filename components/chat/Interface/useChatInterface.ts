"use client";
import { useState, useEffect, useRef } from "react";
import { getAllPdfIds } from "@/db/pdf/pdfFiles";
import useUserId from "@/hooks/useUserId";
import { getItem } from "@/lib/fileSystemUtils";
import { usePathname } from "next/navigation";
import ChatService from "../services/chatService";
import { useSettings } from "@/context/store";
import { zoomUtils } from "@/components/pdf/utils/pdf-utils";
import { useUpdateLearningToolTime } from "@/hooks/useUpdateLearningToolTime";
import useChatSession from "../services/useChatSession";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  name: string;
  avatar: string;
  time: string;
  references?: Reference[];
}

interface Reference {
  source_id: string;
  page: number | null;
  content: string;
  metadata?: {
    [key: string]: any;
  };
}

interface Conversation {
  run_id: string;
  created_at: string;
  messages: {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    message_id: string;
  }[];
  references: Reference[];
  metadata: {
    total_messages: number;
    total_references: number;
    tools_used: string[];
  };
}

interface ChatHistoryResponse {
  session_id: string;
  status: "success" | "not_found";
  conversations: Conversation[];
  summary: {
    total_conversations: number;
    total_messages: number;
    total_references: number;
  };
}

export const useChatInterface = (id: string | number) => {
  // Configuration variables
  const MODEL_ID = "gpt-4o-mini";

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPdfFound, setisPdfFound] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isTrained, setIsTrained] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Context and hooks
  const {
    setcurrentView,
    setcurrentDocumentId,
    currentDocumentId,
    isTrainingProgress,
    composerInsertText,
    setComposerInsertText,
    PdfIframeRef,
    setCurrentChunk,
    fileSystem,
  } = useSettings();

  const { sessionId, startNewSession } = useChatSession(
    currentDocumentId,
    getParentFolderName(currentDocumentId, fileSystem)
  );
  const userId = useUserId();
  const currentPath = usePathname().split("/")[2];
  const { updateLearningToolTime } = useUpdateLearningToolTime(userId);

  // Handle composer insert text
  useEffect(() => {
    if (!composerInsertText || !isTrained) return;
    setInputMessage(composerInsertText);
    setComposerInsertText(null);
    zoomUtils.zoomToFit(PdfIframeRef);
  }, [composerInsertText, isTrained]);

  // Check if PDF exists
  const check = async () => {
    const res = await getAllPdfIds();
    const pdfFound = res.includes(id);
    setisPdfFound(pdfFound);
  };

  // Convert API response to Message format
  const convertConversationsToMessages = (
    conversations: Conversation[]
  ): Message[] => {
    const allMessages: Message[] = [];

    conversations.forEach((conversation) => {
      conversation.messages.forEach((msg, index) => {
        // Find references for this specific message
        const messageReferences = conversation.references || [];

        const message: Message = {
          id: msg.message_id || `${msg.timestamp || Date.now()}-${index}`,
          text: msg.content,
          sender: msg.role === "user" ? "user" : "bot",
          name: msg.role === "user" ? "You" : "Acolyte",
          avatar:
            msg.role === "user"
              ? ""
              : "https://via.placeholder.com/150/FF0000/FFFFFF?Text=Bot+Avatar",
          time: msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString()
            : new Date().toLocaleTimeString(),
          references: msg.role === "assistant" ? messageReferences : undefined,
        };

        allMessages.push(message);
      });
    });

    return allMessages.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );
  };

  // Fetch chat history
  const fetchChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      if (!sessionId) return;
      await new Promise((resolve) => setTimeout(resolve, 500));
      const chatService = new ChatService();
      const chatHistoryResponse: ChatHistoryResponse =
        await chatService.getChatHistory({
          session_id: sessionId,
        });

      console.log("Chat History Response:", chatHistoryResponse);

      if (
        chatHistoryResponse?.status === "success" &&
        chatHistoryResponse?.conversations
      ) {
        const convertedMessages = convertConversationsToMessages(
          chatHistoryResponse.conversations
        );
        setMessages(convertedMessages);
        return convertedMessages;
      }

      return [];
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return [];
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Initialize component
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!sessionId) return;
      await fetchChatHistory();
    };
    loadChatHistory();
  }, [sessionId]);

  // Check if PDF is trained
  useEffect(() => {
    const isPdfTrained = async () => {
      try {
        if (!userId) return;
        const res = await getItem(userId, currentDocumentId);
        console.log(res);
        setIsTrained(res?.isTrained);
      } catch (error) {
        console.error("Failed to check if PDF is trained:", error);
        return false;
      }
    };

    isPdfTrained();
    setcurrentDocumentId(id);
    check();
  }, [id, isTrainingProgress, userId]);

  // Time tracking
  useEffect(() => {
    startTimeRef.current = Date.now();
    return () => {
      const endTime = Date.now();
      const timeSpentInSeconds = Math.floor(
        (endTime - startTimeRef.current) / 1000
      );
      updateLearningToolTime("chatbotTime", timeSpentInSeconds);
      console.log("updating chatbot time");
    };
  }, [updateLearningToolTime]);

  // Save chat history
  const saveChatHistory = async (
    docId: string | number,
    messages: Message[]
  ) => {
    try {
      const apiFormat = {
        chat_history: messages.map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        })),
      };

      console.log("Saving chat history:", apiFormat);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { success: true };
    } catch (error) {
      console.error("Error saving chat history:", error);
      return { success: false };
    }
  };

  // Auto-save messages
  useEffect(() => {
    if (messages.length > 0) {
      const timeoutId = setTimeout(() => {
        saveChatHistory(id, messages);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, id]);

  // Set current view
  useEffect(() => {
    setcurrentView("chat");
    if (id == "null") {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [id]);

  function getParentFolderName(docId, fileSystem) {
    // Find the document by its ID
    const document = fileSystem.find((item) => item.id === docId);
    if (!document) return null; // If doc not found

    // Find its parent folder
    let parentFolder = fileSystem.find(
      (item) => item.type === "folder" && item.id === document.parentId
    );
    if (!parentFolder) return null; // No parent folder

    // If parent folder has its own parent, use that folder's name
    if (parentFolder.parentId !== null) {
      const grandParentFolder = fileSystem.find(
        (item) => item.type === "folder" && item.id === parentFolder.parentId
      );
      return grandParentFolder ? grandParentFolder.name : parentFolder.name;
    }

    // Otherwise return the immediate parent folder name
    return parentFolder.name;
  }

  useEffect(() => {
    if (!fileSystem || !currentDocumentId || !userId) return;
    console.log(getParentFolderName(currentDocumentId, fileSystem));
  }, [currentDocumentId, fileSystem, sessionId, userId]);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current && containerRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  // Submit query and get task_id
  const submitQuery = async (): Promise<string> => {
    if (!sessionId) throw new Error('No session ID');
    console.log("submitQuery called:", new Date().toISOString());
    console.log("Current state:", { isGenerating, inputMessage, sessionId });
    console.log("Submitting query...");
    console.log("Input message:", inputMessage);
    console.log("Current document ID:", currentDocumentId);
    console.log("User ID:", userId);
    console.log("Session ID:", sessionId);

    const subject = sessionId.split("#")[2];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_GENERATION_URL}/query`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            key: `${currentDocumentId}.pdf`,
            query_text: inputMessage,
            model_id: MODEL_ID,
            session_id: sessionId,
            subject: subject,
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.task_id;

    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  };

  // Poll job status until completion
  const pollJobStatus = async (taskId: string): Promise<any> => {
    const maxRetries = 120; // 2 minutes with 1 second intervals
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_GENERATION_URL}/job_status/${taskId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const statusData = await response.json();

        console.log("Job status:", statusData.status, "Progress:", statusData.progress);

        if (statusData.status === "completed") {
          return statusData.result;
        } else if (statusData.status === "failed") {
          throw new Error(statusData.error || "Job failed");
        }

        // Wait 1 second before next poll
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries++;

      } catch (error) {
        console.error("Error polling job status:", error);
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error("Job polling timeout");
  };

  // Delay function
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Get model response with streaming
  const getModelResponse = async (callback) => {
    setIsGenerating(true);

    try {
      // Submit query and get task_id
      const taskId = await submitQuery();
      console.log("Received task ID:", taskId);

      // Poll for completion
      const result = await pollJobStatus(taskId);

      if (!result?.content?.answer && !result?.answer) {
        throw new Error('No response from API');
      }

      const references = result?.content?.references || [];
      const responseText = result?.content?.answer || result?.answer || "";

      // Stream the response
      const words = responseText.split(" ");
      let generatedText = "";

      for (const word of words) {
        generatedText += word + " ";
        callback(generatedText.trim(), references);
        await delay(25);
      }
    } catch (error) {
      console.error("Error:", error);
      callback(`Error: ${error.message}`, []);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle send message
  const handleSendMessage = async (message?: string) => {
    if (inputMessage.trim() === "") return;
    console.log("received message:", message);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage ?? message ?? "",
      sender: "user",
      name: "You",
      avatar: "",
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "",
      sender: "bot",
      name: "Acolyte",
      avatar: "https://via.placeholder.com/150/FF0000/FFFFFF?Text=Bot+Avatar",
      time: new Date().toLocaleTimeString(),
      references: [],
    };

    setMessages((prevMessages) => [...prevMessages, botMessage]);

    await getModelResponse((updatedText, references) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === botMessage.id
            ? { ...msg, text: updatedText, references: references || [] }
            : msg
        )
      );
    });
  };

  // Handle reference click
  const handleReferenceClick = (reference: Reference) => {
    console.log("Reference clicked:", {
      source: reference.source_id,
      page: reference.page,
      content: reference.content,
      metadata: reference.metadata,
    });

    setCurrentChunk({
      source: reference.source_id,
      page: reference.page,
      content: reference.content,
      metadata: reference.metadata,
    });

    // You can add navigation logic here
    // For example, navigate to specific page in PDF viewer
    if (reference.page && PdfIframeRef?.current) {
      // Navigate to specific page in PDF
      // This depends on your PDF viewer implementation
    }
  };

  // Reset chat
  const resetChat = async () => {
    setMessages([]);
    setInputMessage("");
    // await saveChatHistory(id, []);
  };

  // Reset messages and start new session
  const resetMessagesandStartNewSession = () => {
    setMessages([]);
    startNewSession();
  };

  return {
    // State
    messages,
    inputMessage,
    setInputMessage,
    isGenerating,
    isExpanded,
    setIsExpanded,
    isPdfFound,
    isComposing,
    setIsComposing,
    isLoadingHistory,
    isTrained,
    currentPath,

    // Refs
    messagesEndRef,
    containerRef,

    // Context values
    isTrainingProgress,

    // Functions
    handleSendMessage,
    handleReferenceClick,
    resetChat,
    resetMessagesandStartNewSession,

    // Configuration
    userAvatar: "",
    botAvatar: "https://via.placeholder.com/150/FF0000/FFFFFF?Text=Bot+Avatar",

    // Suggestions
    suggestions: [
      "What is the goal of the authors?",
      "What is the main issue discussed in the text?",
      'What is the "old implicit compact" mentioned in the text?',
      "Who are the authors of the text?",
    ],
  };
};