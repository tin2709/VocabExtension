export interface WordResponse {
    ipa: string;
    meanings: string[];
    examples: {
        sentence: string;
        explanation: string;
    }[];
}