import WordModel, { IWord } from '../models/word.model.js';

// Định nghĩa kiểu dữ liệu nhận vào để tạo một từ
interface WordCreationData {
    word: string;
    ipa: string;
    audioUrl?: string;
    meanings: { meaning: string }[];
    examples: { sentence: string; explanation: string }[];
    tags?: string[];
    userId: string; // Nhận userId dạng chuỗi
}

export class WordService {
    /**
     * Tìm một từ trong DB theo tên.
     * @param word - Từ cần tìm (dạng chuỗi)
     * @returns - Document của từ nếu tìm thấy, hoặc null
     */
    static async getByWord(word: string, userId: string): Promise<IWord | null> {
        return WordModel.findOne({ word: word.toLowerCase() });
    }

    /**
     * Tạo một bản ghi từ mới trong DB.
     * @param data - Dữ liệu đầy đủ của từ cần tạo
     * @returns - Document của từ vừa được tạo
     */
    static async createWord(data: WordCreationData): Promise<IWord> {
        const newWord = new WordModel({
            word: data.word,
            ipa: data.ipa,
            audioUrl: data.audioUrl,
            meanings: data.meanings,
            examples: data.examples,
            tags: data.tags || [],
            userId: data.userId,
        });
        return newWord.save();
    }
    static async getAllWordStrings(userId: string): Promise<string[]> {
        const words = await WordModel.find({ userId: userId }, { word: 1, _id: 0 });
        return words.map(w => w.word);
    }
}