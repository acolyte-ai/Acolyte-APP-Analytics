import { BookOpen, ExternalLink } from "lucide-react";

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

const ReferenceCard = ({
    reference,
    onClick,
}: {
    reference: Reference;
    onClick: (ref: Reference) => void;
}) => {
    const pageNumber = reference.page || reference.metadata?.page;
    const sourceTitle = reference.title || reference.source_id || 'Document';
    
    // Extract first few words from content (limit to ~40 characters)
    const getPreviewText = (content: string | undefined): string => {
        if (!content) return '';
        
        const cleanText = content.replace(/\s+/g, ' ').trim();
        if (cleanText.length <= 40) return cleanText;
        
        const words = cleanText.split(' ');
        let preview = '';
        
        for (const word of words) {
            if ((preview + ' ' + word).length > 40) break;
            preview += (preview ? ' ' : '') + word;
        }
        
        return preview + (preview.length < cleanText.length ? '...' : '');
    };

    const previewText = getPreviewText(reference.content);

    return (
        <div
            className="group flex flex-col p-3 bg-white dark:bg-[#181A1D] rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1f2125] transition-all duration-200 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
            onClick={() => onClick(reference)}
        >
            {/* Header with icon and page */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#36AF8D] flex-shrink-0" />
                    {pageNumber && (
                        <span className="text-xs bg-[#36AF8D] text-white px-2 py-0.5 rounded-full font-medium">
                            Page {pageNumber}
                        </span>
                    )}
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[#36AF8D] transition-colors flex-shrink-0" />
            </div>

            {/* Content preview */}
            <div className="flex-1 min-w-0">
                {previewText && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
                        "{previewText}"
                    </p>
                )}
                {!previewText && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        No preview available
                    </p>
                )}
            </div>

            {/* Source title at bottom */}
            {sourceTitle !== 'Document' && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                        {sourceTitle}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReferenceCard
