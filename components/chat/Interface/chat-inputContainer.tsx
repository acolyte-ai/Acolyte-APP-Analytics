import { Button } from "@/components/ui/button";
import { Send, Upload, Plus } from "lucide-react";
import { useEffect } from "react";

interface InputContainerChatProps {
    inputMessage: string;
    setInputMessage: (message: string) => void;
    handleSendMessage: () => void;
    handleNewChat?: () => void;
    disabled?: boolean;
}

export default function InputContainerChat({
    inputMessage,
    setInputMessage,
    handleSendMessage,
    handleNewChat,
    disabled = false,
}: InputContainerChatProps) {

    useEffect(() => {
        const storedQuery = localStorage.getItem("aco-query");
        if (storedQuery) {
            setInputMessage(storedQuery);
            localStorage.removeItem("aco-query");
        }
    }, [setInputMessage])


    return (
        <div
            className={`relative flex items-center grow  max-w-4xl
               dark:shadow-[inset_0_0_8px_#B8B8B82B]    dark:bg-[#181A1D]  bg-[#F3F4F9]   border-[#B8B8B8] dark:border-none  shadow-sm hover:shadow-md rounded-2xl px-3
                 h-[50px] transition-all duration-200 ${disabled
                    ? "opacity-50 pointer-events-none"
                    : "opacity-100"
                }`}
        >
            {/* New Chat Button */}
            {/* <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 h-auto p-2"
                disabled={disabled}
                onClick={handleNewChat}
                title="Start new chat"
            >
                <Plus className="w-4 h-4" />
            </Button> */}

            {/* Upload Icon */}
            {/* <Button
                variant="ghost"
                size="sm"
                className="text-[#36AF8D] hover:text-[#36AF8D] dark:text-[#36AF8D] dark:hover:text-[#36AF8D] h-auto p-2"
                disabled={disabled}
            >
                <Upload className="w-5 h-5" />
            </Button> */}

            {/* Input Field */}
            <div className="w-full h-full items-center flex">
                <textarea
                    placeholder="Message Acolyte..."
                    className="w-full bg-transparent border-0 h-full text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 p-3 ring-0 outline-none focus:outline-none resize-none text-[15px] leading-6"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !disabled) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    disabled={disabled}
                    rows={1}
                />
            </div>

            {/* Send Button */}
            <Button
                size="sm"
                onClick={() => {
                    if (!disabled) {
                        handleSendMessage();
                    }
                }}
                className={`p-1.5 rounded-lg transition-all bg-transparent dark:bg-transparent rotate-45 duration-200 ${inputMessage.trim() === "" || disabled
                    ? "  cursor-not-allowed"
                    : "  shadow-sm hover:shadow-md text-[#36AF8D] dark:text-[#36AF8D]"
                    }`}
                disabled={inputMessage.trim() === "" || disabled}
            >
                <Send className="w-7 h-7  fill-[#36AF8D] dark:fill-[#36AF8D] text-[#36AF8D]" />
            </Button>
        </div>
    );
}