"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

import { useChatInterface } from "./useChatInterface";

import FileUpload from "@/components/FileSystem/file-upload";
import { TrainLoading } from "@/components/UIUX/loading-training";
import SubjectFolders from "../SubjectFolders";
import WelcomeScreen from "./chat-welcomeScreen";
import ChatMessages from "./chat-messages";
import InputContainerChat from "./chat-inputContainer";
import { useSettings } from "@/context/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Reference {
  id: string;
  title?: string;
  page?: string | number;
  metadata?: {
    page?: string | number;
    [key: string]: any;
  };
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  name: string;
  avatar: string;
  time: string;
  references?: Reference[];
}

interface ChatInterfaceProps {
  id: string | number;
}

export function ChatInterface({ id }: ChatInterfaceProps) {
  const {
    messages,
    inputMessage,
    setInputMessage,
    isGenerating,
    isExpanded,
    setIsExpanded,
    messagesEndRef,
    containerRef,
    isTrainingProgress,
    handleSendMessage,
    handleReferenceClick,
    resetMessagesandStartNewSession,
  } = useChatInterface(id);

  const { viewCombination } = useSettings();

  console.log("viewCombination::::", viewCombination)

  return (
    <ScrollArea className="w-full h-screen rounded-md relative">
      {true ? (
        <div className="flex flex-col w-full h-screen relative">
          {/* Messages Area */}
          <div
            className="flex-1 relative p-4 xl:p-8 overflow-y-auto items-center mb-32 no-scrollbar  scrollbar-hide justify-center bg-[#EBEBF5] dark:bg-[#0F1012]"
            style={{ scrollBehavior: "auto" }}
          >
            {messages.length === 0 ? (
              // Welcome Screen (without input container)
              <WelcomeScreen
                handleSendMessage={handleSendMessage}
                setInputMessage={setInputMessage}
              />
            ) : (
              // Messages List
              <>
                <TooltipProvider>
                  <Tooltip >
                    <TooltipTrigger asChild>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg h-8 fixed z-[50] top-14 right-4 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors px-3"
                        onClick={resetMessagesandStartNewSession}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        New chat
                      </Button> */}
                    </TooltipTrigger>
                    <TooltipContent side="left" className="ml-2">
                      <p>Start new chat</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div
                  className="space-y-6  pt-36 flex-1   bg-[#EBEBF5] dark:bg-[#0F1012]"
                  style={{ scrollBehavior: "smooth" }}
                  ref={containerRef}
                >
                  <ChatMessages
                    messages={messages}
                    isGenerating={isGenerating}
                    handleReferenceClick={handleReferenceClick}
                  />
                </div>
              </>
            )}

            <div
              ref={messagesEndRef}
              style={{ height: "1px", visibility: "hidden" }}
            />
          </div>

          {/* Single Fixed Input Section at Bottom - Always Present */}
          <div
            className={`absolute left-0 right-0 px-4 flex justify-center
              w-full  bg-[#EBEBF5] dark:bg-[#0F1012] h-[100px]
              ${viewCombination === "notes+chat" ? "bottom-[100px] " : "bottom-[60px] "}
                `}

          >
            {/* Single Input Container */}
            <InputContainerChat
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              handleSendMessage={handleSendMessage}
              handleNewChat={resetMessagesandStartNewSession}
            />
          </div>

          {/* Subject Folders Overlay */}
          {isExpanded && (
            <SubjectFolders
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />
          )}
        </div>
      ) : (
        // File Upload Screen
        <div className="w-full h-full flex items-center justify-center">
          <FileUpload />
        </div>
      )}

      {/* Training Progress Overlay */}
      {isTrainingProgress && (
        <div className="fixed inset-0 flex items-center justify-center h-screen w-full bg-gray-900/30 backdrop-blur-md z-50">
          <TrainLoading />
        </div>
      )}
    </ScrollArea>
  );
}