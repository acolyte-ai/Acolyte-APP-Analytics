"use client"

import * as React from "react"

export function AllTopicCombobox({ allTopics, addTopic }: { allTopics: string[], addTopic: (topic: string) => void; }) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");

    const handleSelect = (topic: string) => {
        setValue(topic === value ? "" : topic);
        console.log("topic:::", topic)
        addTopic(topic)
        setOpen(false);
    };

    return (
        <div className="relative w-full">
            {/* Trigger Button */}
            <button
                onClick={() => setOpen(!open)}
                className="flex h-10 w-52 items-center justify-between
                rounded-md  px-3 py-2
                text-sm placeholder:text-zinc-700

                disabled:cursor-not-allowed disabled:opacity-50
                dark:border-zinc-900  border border-[#B8B8B8] dark:bg-[#3D3E42] bg-[#E8EAF3]
                light:border-zinc-300 light:bg-white light:text-zinc-900"
                aria-expanded={open}
                aria-haspopup="listbox"
            >
                <span className={value ? "dark:text-white text-black" : "dark:text-white text-black"}>
                    {value || "Select topic..."}
                </span>
                <svg
                    className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border
                 border-zinc-900 dark:bg-[#3D3E42] bg-[#E8EAF3] shadow-lg no-scrollbar remove-scrollbar">
                    <div className="max-h-40 overflow-auto py-1">
                        {!allTopics ? (
                            <div className="px-3 py-2 text-sm text-zinc-700">
                                No topic found.
                            </div>
                        ) : (
                            allTopics.map((topic) => (
                                <button
                                    key={topic}
                                    onClick={() => handleSelect(topic)}
                                    className="flex w-full items-center px-3 py-2 text-sm dark:text-white text-black
                                     hover:bg-emerald-600 focus:bg-zinc-100
                                      focus:outline-none"
                                >
                                    <span className="truncate">{topic}</span>
                                    {value === topic && (
                                        <svg className="ml-auto h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0
                                            011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Backdrop to close dropdown when clicking outside */}
            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                />
            )}
        </div>
    );
}