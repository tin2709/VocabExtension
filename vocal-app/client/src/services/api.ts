import type {WordResponse} from '../types/word.ts';

export const lookupWord = async (word: string): Promise<WordResponse> => {
    const response = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch word information.');
    }

    return response.json();
};