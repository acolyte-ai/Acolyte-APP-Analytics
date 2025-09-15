import React from 'react';
import { CreditCard, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlashcardHeaderIconProps {
    isGenerating: boolean;
    onShowFlashcard: () => void;
}

const FlashcardHeaderIcon: React.FC<FlashcardHeaderIconProps> = ({
    isGenerating,
    onShowFlashcard
}) => {
    return (
        <div className="fixed top-32 right-24 z-[9999] pointer-events-none">
            <div className="pointer-events-auto">
                <Button
                    onClick={onShowFlashcard}
                    disabled={isGenerating}
                    variant={isGenerating ? "secondary" : "default"}
                    size="sm"
                    className={`
                        relative transition-all duration-200 shadow-lg
                        ${isGenerating
                            ? 'bg-amber-100 text-amber-700 cursor-wait border-amber-300 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-600 dark:hover:bg-amber-800'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90'
                        }
                        border-2 font-medium
                    `}
                    title={isGenerating ? 'Generating flashcard...' : 'Click to view flashcard'}
                >
                    <div className="flex items-center gap-2">
                        {isGenerating ? (
                            <>
                                <LoaderCircle className="w-4 h-4 animate-spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-4 h-4" />
                                <span>Flashcard</span>
                            </>
                        )}
                    </div>

                </Button>
            </div>
        </div>
    );
};

export default FlashcardHeaderIcon;