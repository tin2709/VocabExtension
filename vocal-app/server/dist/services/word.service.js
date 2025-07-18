import WordModel from '../models/word.model.js';
export class WordService {
    /**
     * Tìm một từ trong DB theo tên.
     * @param word - Từ cần tìm (dạng chuỗi)
     * @returns - Document của từ nếu tìm thấy, hoặc null
     */
    static async getByWord(word) {
        return WordModel.findOne({ word: word.toLowerCase() });
    }
    /**
     * Tạo một bản ghi từ mới trong DB.
     * @param data - Dữ liệu đầy đủ của từ cần tạo
     * @returns - Document của từ vừa được tạo
     */
    static async createWord(data) {
        const newWord = new WordModel({
            word: data.word,
            ipa: data.ipa,
            audioUrl: data.audioUrl,
            meanings: data.meanings,
            examples: data.examples,
        });
        return newWord.save();
    }
}
