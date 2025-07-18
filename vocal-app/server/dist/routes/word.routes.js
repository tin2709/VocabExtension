import { Router } from 'express';
import { WordController } from '../controllers/word.controller.js';
const router = Router();
// Định nghĩa route POST / để lưu từ
router.post('/', WordController.save);
export default router;
