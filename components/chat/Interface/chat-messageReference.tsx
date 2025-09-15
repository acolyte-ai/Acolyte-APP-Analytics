import ReferenceCard from "./chat-referenceCard";
import { Library, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Reference {
    id: string;
    source_id?: string;
    title?: string;
    page?: string | number;
    content?: string;
    metadata?: {
        page?: string | number;
        [key: string]: any;
    };
}

const MessageReferences = ({
    references,
    onReferenceClick
}: {
    references: Reference[];
    onReferenceClick: (ref: Reference) => void;
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!references || references.length === 0) return null;

    // Filter out invalid references (no content or missing metadata)
    const validReferences = references.filter(ref => {
        const hasValidContent = ref.content && ref.content !== 'No documents found';
        const hasMetadata = ref.metadata && Object.keys(ref.metadata).length > 0;
        return hasValidContent && hasMetadata;
    });

    if (validReferences.length === 0) return null;

    return (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-[#0F1012] rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full group hover:bg-gray-100 dark:hover:bg-[#181A1D] p-2 -m-2 rounded-lg transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Library className="w-4 h-4 text-[#36AF8D]" />
                    <span className="text-sm font-semibold text-black dark:text-white">
                        Sources
                    </span>
                    <span className="text-xs bg-[#36AF8D] text-white px-2 py-0.5 rounded-full font-medium">
                        {validReferences.length}
                    </span>
                </div>
                <div className="text-gray-400 dark:text-gray-500 group-hover:text-[#36AF8D] transition-colors">
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </div>
            </button>

            {/* References Grid */}
            {isExpanded && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {validReferences.map((reference, index) => (
                        <ReferenceCard
                            key={`${reference.source_id || reference.id || 'unknown'}-${index}`}
                            reference={{
                                ...reference,
                                source_id: reference.source_id || 'Unknown Source',
                                content: reference.content || 'No content available',
                                metadata: reference.metadata || { info: 'No metadata available' }
                            }}
                            onClick={onReferenceClick}
                        />
                    ))}
                </div>
            )}

            {/* Collapse hint */}
            {!isExpanded && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Click to view {validReferences.length} source{validReferences.length > 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};

export default MessageReferences;