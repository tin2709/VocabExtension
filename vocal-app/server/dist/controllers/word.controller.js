import { WordService } from '../services/word.service.js';
export class WordController {
    static async save(req, res) {
        try {
            // Logic tạo mới hoặc tìm kiếm đã có sẵn trong service
            // nên chúng ta có thể dùng lại nó!
            const wordData = req.body;
            const savedWord = await WordService.createWord(wordData);
            res.status(201).json(savedWord);
        }
        catch (error) {
            console.error('Error in WordController.save:', error);
            res.status(500).json({ error: 'Failed to save word.' });
        }
    }
}
