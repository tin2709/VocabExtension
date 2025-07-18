import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId; // Thêm dòng này
    googleId: string; // ID duy nhất từ Google
    email: string;
    name: string;
}

const UserSchema: Schema = new Schema({
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);