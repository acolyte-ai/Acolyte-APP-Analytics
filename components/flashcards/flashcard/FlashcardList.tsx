// FlashcardList.tsx
import { useState, useEffect } from 'react';
// import { fetchFlashcards, fetchFlashcardById, initializeSampleData } from './flashcardService';
// import { FlashcardData } from './flashcardTypes';

import useUserId from '@/hooks/useUserId';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchFlashcardById, fetchFlashcards, initializeSampleData } from '../services/flashcardService';
import FlashCardUI from './flashCard';

export default function FlashcardList() {
    const [flashcards, setFlashcards] = useState<{ id: number; title: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardData | null>(null);
    const [showFlashcard, setShowFlashcard] = useState(false);
    const userId = useUserId()

    // Load flashcards on component mount
    useEffect(() => {
        const loadFlashcards = async () => {
            if (!userId) return
            try {
                // Initialize sample data if none exists
                initializeSampleData();

                // Fetch flashcards from the API
                const data = await fetchFlashcards(userId);
                setFlashcards(data);
            } catch (err) {
                console.error('Error loading flashcards:', err);
                setError('Failed to load flashcards. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        loadFlashcards();
    }, [userId]);

    // Handle clicking on a flashcard
    const handleFlashcardClick = async (id: number) => {
        if (!userId) return
        try {
            // Fetch the full flashcard data
            const flashcard = await fetchFlashcardById(userId, id);

            if (flashcard) {
                setSelectedFlashcard(flashcard);
                setShowFlashcard(true);
            } else {
                setError('Flashcard not found');
            }
        } catch (err) {
            console.error('Error fetching flashcard:', err);
            setError('Failed to load flashcard details');
        }
    };

    // Close the flashcard
    const handleCloseFlashcard = () => {
        setShowFlashcard(false);
        setSelectedFlashcard(null);
    };

    return (
        <div className="  m-5 p-4 h-full ">
            <ScrollArea className=' h-full overflow-hidden '>
                {/* Error message */}
                {error && (
                    <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Loading state */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    // Flashcard list
                    <div className="grid grid-cols-1  gap-4 ">
                        {flashcards.length === 0 ? (
                            <div className="col-span-full text-center text-gray-500 py-10">
                                No flashcards found. Create some to get started!
                            </div>
                        ) : (
                            flashcards.map((card: any) => (
                                <div
                                    key={card.id}
                                    onClick={() => handleFlashcardClick(card?.flashcard_id)}
                                    className="bg-white dark:bg-black p-7 rounded-xl shadow-md cursor-pointer max-w-[400px]  h-[20vh] max-h-full
                                  hover:shadow-lg transition-shadow duration-200 border dark:border-[#2E323C]"
                                >

                                    <h3 className="max-md:text-lg text-2xl font-bold text-black dark:text-white mt-2 w-[400px] truncate overflow-hidden" >
                                        {card?.heading}
                                    </h3>
                                    <p className="max-md:text-sm text-lg text-[#787486] dark:text-gray-300 mt-3">
                                        Click to view details
                                    </p>
                                </div>
                            ))


                        )}
                    </div>
                )}

                {/* Display the selected flashcard */}
                {showFlashcard && selectedFlashcard && (
                    <div className="fixed inset-0 z-50">
                        <FlashCardUI
                            flashcardData={selectedFlashcard}
                            onClose={handleCloseFlashcard}
                        />
                    </div>
                )}

            </ScrollArea>
        </div>
    );
}