import mongoose, { Schema } from 'mongoose';
// Tạo Schema (bản thiết kế) cho Mongoose
const WordSchema = new Schema({
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
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});
// Tạo và export Model để có thể tương tác với collection 'words' trong DB
export default mongoose.model('Word', WordSchema);
