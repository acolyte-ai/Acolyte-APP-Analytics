import { FileText, PlusIcon } from "lucide-react";


export default function DocumentRow({ number, more }) {
    const getCircleColor = (num) => {
        const colors = {
            1: "bg-green-100 text-green-600",
            3: "bg-green-100 text-green-600",
            4: "bg-green-100 text-green-600",
        };
        return colors[num] || "bg-green-100 text-green-600";
    };

    return (
        <div className="py-2 sm:py-4 px-2 sm:px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-indigo-600 font-semibold text-sm">
                            Guyton and hall
                        </span>
                        <span className="text-gray-500 text-sm">- physiology</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <button className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
                    <PlusIcon className="w-3 h-3 text-gray-500" />
                </button>

                <div className="flex items-center">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white bg-gray-200"
                            />
                        ))}
                    </div>
                    <span className="ml-2 text-gray-500 text-xs sm:text-sm">+2 more</span>
                </div>

                <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${getCircleColor(
                        number
                    )} flex items-center justify-center text-xs sm:text-sm font-medium`}
                >
                    {number}
                </div>
            </div>
        </div>
    );


}