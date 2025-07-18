import { Request, Response } from 'express';
import { WordService } from '../services/word.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export class WordController {
    static async save(req: AuthRequest, res: Response) {
        try {
            // Logic tạo mới hoặc tìm kiếm đã có sẵn trong service
            // nên chúng ta có thể dùng lại nó!
            const userId = req.user!.id;
            const wordData = { ...req.body, userId }; // Gộp userId vào dữ liệu
            const savedWord = await WordService.createWord(wordData);
            res.status(201).json(savedWord);
        } catch (error) {
            console.error('Error in WordController.save:', error);
            res.status(500).json({ error: 'Failed to save word.' });
        }
    }
}