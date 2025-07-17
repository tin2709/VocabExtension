import WordModel, { IWord } from '../models/word.model.js';

// Định nghĩa kiểu dữ liệu nhận vào để tạo một từ
interface WordCreationData {
    word: string;
    ipa: string;
    meanings: { meaning: string }[];
    examples: { sentence: string; explanation: string }[];
}

export class WordService {
    /**
     * Tìm một từ trong DB theo tên.
     * @param word - Từ cần tìm (dạng chuỗi)
     * @returns - Document của từ nếu tìm thấy, hoặc null
     */
    static async getByWord(word: string): Promise<IWord | null> {
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
            meanings: data.meanings,
            examples: data.examples,
        });
        return newWord.save();
    }
}