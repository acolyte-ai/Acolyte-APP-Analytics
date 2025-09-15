// Define flashcard data types
export interface FlashcardData {
    heading?: string;
    id: string;
    title: string;
    description: string;
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    lastReviewed?: Date;
    bodySystem: string;
}

