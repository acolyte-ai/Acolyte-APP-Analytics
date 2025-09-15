import DocumentRow from "./documentRow";


export default function DocumentList() {
    const documents = [
        { number: 1, more: 2 },
        { number: 3, more: 2 },
        { number: 4, more: 2 },
        { number: 1, more: 2 },
    ];

    return (
        // Fixed height to ensure scrolling works
        <div className="bg-[#ecf1f0] dark:bg-[#444444] rounded-2xl w-full h-full overflow-auto">
            <div className="p-2 sm:p-4">
                <div className="divide-y divide-gray-200">
                    {documents.map((doc, index) => (
                        <DocumentRow key={index} {...doc} />
                    ))}
                </div>

                <div className="mt-4 sm:mt-6 flex justify-end">
                    <button className="text-indigo-600 font-medium flex items-center gap-2 hover:text-indigo-700 transition-colors p-2">
                        <span className="text-sm">View All</span>
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
