import mongoose, { Schema, Document } from 'mongoose';

// Định nghĩa cấu trúc cho một từ vựng
export interface IWord extends Document {
    word: string;
    ipa: string;
    audioUrl?: string;
    meanings: { meaning: string }[];
    examples: { sentence: string; explanation: string }[];
    tags: string[]; // <-- THÊM MỚI
    userId: mongoose.Schema.Types.ObjectId; // <-- THÊM MỚI: Liên kết với User
}

// Tạo Schema (bản thiết kế) cho Mongoose
const WordSchema: Schema = new Schema({
    word: { type: String, required: true, unique: true, index: true, lowercase: true },
    ipa: { type: String },
    audioUrl: { type: String },
    meanings: [{
        meaning: { type: String, required: true }
    }],
    examples: [{
        sentence: { type: String, required: true },
        explanation: { type: String, required: true }
    }],
    tags: [{ type: String, trim: true, lowercase: true }], // <-- THÊM MỚI
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true
    }}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Tạo và export Model để có thể tương tác với collection 'words' trong DB
export default mongoose.model<IWord>('Word', WordSchema);