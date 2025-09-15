import bigOwl from "@/public/bigOwl.svg";
import Image from "next/image";
import Markdown from "react-markdown";
import MessageReferences from "./chat-messageReference";

// Function to extract actual user query from formatted text
function extractUserQuery(text) {
    // Regex to match the pattern and extract the actual query
    const regex = /Student Query:\s*(.+?)\s*Context:/s;
    const match = text.match(regex);

    if (match && match[1]) {
        return match[1].trim();
    }

    // If no match found, return original text
    return text;
}

export default function ChatMessages({ messages, isGenerating, handleReferenceClick }) {
    return (
        <div className="max-w-4xl mx-auto px-4 space-y-8">
            {messages.map((message, index) => {
                // Extract clean query for user messages
                const displayText = message.sender === "user"
                    ? extractUserQuery(message.text)
                    : message.text;

                return (
                    <div key={message.id} className="w-full">
                        <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0 mt-1">
                                {message.sender !== "user" ? (
                                    <div className="w-8 h-8 rounded-full bg-[#36AF8D] flex items-center justify-center">
                                        <Image
                                            src={bigOwl}
                                            alt="Acolyte"
                                            height={20}
                                            width={20}
                                            className="w-5 h-5"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-[#36AF8D] flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">U</span>
                                    </div>
                                )}
                            </div>

                            {/* Message Content */}
                            <div className="flex-1 min-w-0">
                                {/* Sender Label with Different Styling */}
                                <div className={`text-base font-semibold mb-3 flex items-center gap-2 ${
                                    message.sender === "user" 
                                        ? "text-[#36AF8D]" 
                                        : "text-black dark:text-white"
                                }`}>
                                    {message.sender === "user" ? (
                                        <>
                                            <span>You</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#36AF8D]"></div>
                                        </>
                                    ) : (
                                        <>
                                            <span>Acolyte</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                                        </>
                                    )}
                                </div>

                                {/* Message Content */}
                                <div className="text-black dark:text-white">
                                    {message.sender === "user" ? (
                                        <div className="bg-white dark:bg-[#232529] rounded-xl px-4 py-3 text-base leading-relaxed whitespace-pre-wrap break-words border border-gray-200 dark:border-gray-600 shadow-sm">
                                            {displayText}
                                        </div>
                                    ) : (
                                        <div className="prose prose-gray max-w-none dark:prose-invert">
                                            <Markdown
                                                components={{
                                                    p: ({ children }) => (
                                                        <p className="mb-4 last:mb-0 text-base leading-relaxed text-black dark:text-white">
                                                            {children}
                                                        </p>
                                                    ),
                                                    h1: ({ children }) => (
                                                        <h1 className="text-2xl font-semibold mb-4 mt-6 first:mt-0 text-black dark:text-white">
                                                            {children}
                                                        </h1>
                                                    ),
                                                    h2: ({ children }) => (
                                                        <h2 className="text-xl font-semibold mb-3 mt-5 first:mt-0 text-black dark:text-white">
                                                            {children}
                                                        </h2>
                                                    ),
                                                    h3: ({ children }) => (
                                                        <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0 text-black dark:text-white">
                                                            {children}
                                                        </h3>
                                                    ),
                                                    h4: ({ children }) => (
                                                        <h4 className="text-base font-semibold mb-2 mt-3 first:mt-0 text-black dark:text-white">
                                                            {children}
                                                        </h4>
                                                    ),
                                                    ul: ({ children }) => (
                                                        <ul className="mb-4 pl-6 space-y-1 list-disc text-black dark:text-white text-base">
                                                            {children}
                                                        </ul>
                                                    ),
                                                    ol: ({ children }) => (
                                                        <ol className="mb-4 pl-6 space-y-1 list-decimal text-black dark:text-white text-base">
                                                            {children}
                                                        </ol>
                                                    ),
                                                    li: ({ children }) => (
                                                        <li className="text-base leading-relaxed text-black dark:text-white">
                                                            {children}
                                                        </li>
                                                    ),
                                                    blockquote: ({ children }) => (
                                                        <blockquote className="border-l-4 border-[#36AF8D] pl-4 my-4 italic text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#181A1D] py-2 rounded-r">
                                                            {children}
                                                        </blockquote>
                                                    ),
                                                    code: ({ children, className }) => {
                                                        const isInline = !className;
                                                        if (isInline) {
                                                            return (
                                                                <code className="bg-[#EBEBF5] dark:bg-[#181A1D] px-2 py-1 rounded text-sm font-mono text-[#36AF8D] border">
                                                                    {children}
                                                                </code>
                                                            );
                                                        }
                                                        return (
                                                            <code className="block bg-[#EBEBF5] dark:bg-[#181A1D] p-4 rounded-lg text-sm font-mono overflow-x-auto text-black dark:text-white border">
                                                                {children}
                                                            </code>
                                                        );
                                                    },
                                                    pre: ({ children }) => (
                                                        <pre className="bg-[#EBEBF5] dark:bg-[#181A1D] p-4 rounded-lg mb-4 overflow-x-auto border">
                                                            {children}
                                                        </pre>
                                                    ),
                                                    table: ({ children }) => (
                                                        <div className="overflow-x-auto mb-4">
                                                            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                                                                {children}
                                                            </table>
                                                        </div>
                                                    ),
                                                    th: ({ children }) => (
                                                        <th className="border border-gray-300 dark:border-gray-600 bg-[#EBEBF5] dark:bg-[#181A1D] px-3 py-2 text-left font-semibold text-black dark:text-white">
                                                            {children}
                                                        </th>
                                                    ),
                                                    td: ({ children }) => (
                                                        <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-black dark:text-white">
                                                            {children}
                                                        </td>
                                                    ),
                                                    strong: ({ children }) => (
                                                        <strong className="font-semibold text-[#36AF8D]">
                                                            {children}
                                                        </strong>
                                                    ),
                                                    em: ({ children }) => (
                                                        <em className="italic text-black dark:text-white">
                                                            {children}
                                                        </em>
                                                    )
                                                }}
                                            >
                                                {displayText}
                                            </Markdown>
                                        </div>
                                    )}

                                    {/* Loading indicator */}
                                    {message.sender !== "user" &&
                                        isGenerating &&
                                        index === messages.length - 1 && (
                                            <div className="flex items-center gap-1 mt-3">
                                                <div className="w-2 h-2 bg-[#36AF8D] rounded-full animate-pulse"></div>
                                                <div className="w-2 h-2 bg-[#36AF8D] rounded-full animate-pulse delay-75"></div>
                                                <div className="w-2 h-2 bg-[#36AF8D] rounded-full animate-pulse delay-150"></div>
                                            </div>
                                        )}

                                    {/* References Section */}
                                    {message.sender === "bot" && message.references && (
                                        <div className="mt-4">
                                            <MessageReferences
                                                references={message.references}
                                                onReferenceClick={handleReferenceClick}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Timestamp */}
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {message.time}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}