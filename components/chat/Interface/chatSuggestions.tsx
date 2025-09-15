import React from 'react';

const MedicalTopicsUI = ({ handleSendMessage }: { handleSendMessage: (val: string) => void }) => {
    const suggestionCards = [
        {
            id: 1,
            title: "Provide me a summary of this content"
        },
        {
            id: 2,
            title: "What are the key takeaways here?"
        },
        {
            id: 3,
            title: "What's the main concept being discussed?"
        },
        {
            id: 4,
            title: "Explain difficult concepts from the content"
        }
    ];

    return (
        <div className="w-full space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {suggestionCards.map((suggestion) => (
                    <button
                        key={suggestion.id}
                        onClick={() => {
                            console.log("Suggestion clicked:", suggestion.title);
                            handleSendMessage(suggestion.title);
                        }}
                        className="group relative    dark:shadow-[inset_0_0_8px_#B8B8B82B]    dark:bg-[#181A1D]  bg-[#F3F4F9]   border-[#B8B8B8] dark:border-none  shadow-sm hover:shadow-md rounded-2xl
                             p-4 text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-700
                            hover:border-gray-300 dark:hover:border-zinc-600 focus:outline-none
                            focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20"
                    >
                        <div className="flex items-start justify-between">
                            <span className="text-[15px] leading-6 text-gray-900 dark:text-gray-100 font-medium pr-2">
                                {suggestion.title}
                            </span>
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                                    <svg
                                        className="w-3 h-3 text-gray-600 dark:text-gray-200"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MedicalTopicsUI;