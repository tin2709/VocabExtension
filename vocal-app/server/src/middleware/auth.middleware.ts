import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/user.model.js'; // Chỉ cần import model

// Mở rộng interface Request để có thể chứa thông tin user
export interface AuthRequest extends Request {
    user?: { id: string };
}

// Middleware để xác thực và tạo/lấy user
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const googleId = req.headers['x-user-google-id'] as string;
    const email = req.headers['x-user-email'] as string;
    const name = req.headers['x-user-name'] as string;

    if (!googleId || !email) {
        return res.status(401).json({ error: 'User identification headers are missing.' });
    }

    try {
        // Bước 1: Luôn thử tìm người dùng trước
        let user = await UserModel.findOne({ googleId: googleId });

        // Bước 2: Nếu không tìm thấy, TẠO MỚI và sau đó TÌM LẠI
        if (!user) {
            console.log(`Creating new user: ${email}`);
            await UserModel.create({ googleId, email, name });

            // Tìm lại người dùng vừa tạo để đảm bảo chúng ta có một document Mongoose đầy đủ
            user = await UserModel.findOne({ googleId: googleId });
        }

        // Bước 3: Kiểm tra chắc chắn rằng user đã tồn tại sau hai bước trên
        if (!user) {
            // Trường hợp rất hiếm, có thể do lỗi DB
            throw new Error('Failed to find or create user.');
        }

        // Tại điểm này, TypeScript hoàn toàn chắc chắn 'user' là một document hợp lệ
        // và không phải là null, do đó nó biết 'user._id' tồn tại và có kiểu đúng.
        req.user = { id: user._id.toString() };
        next();

    } catch (error) {
        console.error("Authentication middleware error:", error);
        res.status(500).json({ error: 'Authentication failed.' });
    }
};