import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { connectDB } from './configs/database.js'; // Giả sử các file này đã được sửa thành .js nếu cần
import { WordService } from './services/word.service.js';
import wordRoutes from './routes/word.routes.js'; // <-- IMPORT MỚI
// --- KẾT THÚC ĐỊNH NGHĨA ---
// --- CẤU HÌNH BAN ĐẦU ---
dotenv.config();
connectDB();
const app = express();
const port = process.env.PORT || 3001;
// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
// --- ROUTES ---
app.post('/api/lookup', async (req, res) => {
    try {
        const { word } = req.body;
        if (!word || typeof word !== 'string') {
            return res.status(400).json({ error: "A 'word' string is required in the request body." });
        }
        const dataFromDb = await WordService.getByWord(word);
        if (dataFromDb) {
            console.log(`✅ Fetched "${word}" from MongoDB cache.`);
            const responseData = {
                ipa: dataFromDb.ipa,
                audioUrl: dataFromDb.audioUrl, // <-- TRẢ VỀ CẢ AUDIO URL
                meanings: dataFromDb.meanings.map(m => m.meaning), // Ở đây 'm' cũng được suy luận đúng kiểu
                examples: dataFromDb.examples.map(e => ({ sentence: e.sentence, explanation: e.explanation }))
            };
            return res.json(responseData);
        }
        console.log(`⏳ Fetching "${word}" from DictionaryAPI.dev...`);
        const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
        // ÁP DỤNG KIỂU DỮ LIỆU VÀO AXIOS
        const apiResponse = await axios.get(apiUrl);
        if (!apiResponse.data || apiResponse.data.length === 0) {
            console.error(`Word "${word}" not found on DictionaryAPI.dev (API returned empty array).`);
            // Trả về lỗi 404 cho client một cách tường minh
            return res.status(404).json({ error: `Sorry, we could not find definitions for the word "${word}".` });
        }
        const apiData = apiResponse.data[0];
        const phoneticWithAudio = apiData.phonetics.find((p) => p.audio);
        const audioUrl = phoneticWithAudio ? phoneticWithAudio.audio : '';
        // Giờ đây, TypeScript biết chính xác kiểu của 'm' và 'd'
        const formattedData = {
            ipa: apiData.phonetic || (apiData.phonetics.find(p => p.text)?.text ?? ''),
            audioUrl: audioUrl, // <-- THÊM AUDIO URL VÀO ĐÂY
            meanings: apiData.meanings
                .flatMap(m => m.definitions.map(d => d.definition))
                .slice(0, 5),
            examples: apiData.meanings
                .flatMap(m => m.definitions.filter(d => d.example).map(d => ({
                sentence: d.example, // Thêm '!' để báo rằng chúng ta chắc chắn d.example tồn tại
                explanation: `(Definition: ${d.definition})`
            })))
                .slice(0, 3),
        };
        await WordService.createWord({
            word: word,
            ipa: formattedData.ipa,
            audioUrl: formattedData.audioUrl, // <-- TRUYỀN VÀO ĐÂY
            meanings: formattedData.meanings.map(m => ({ meaning: m })),
            examples: formattedData.examples,
        });
        console.log(`💾 Saved "${word}" to MongoDB.`);
        res.json(formattedData);
    }
    catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.error(`Word "${req.body.word}" not found on DictionaryAPI.dev.`);
            return res.status(404).json({ error: `Sorry, the word "${req.body.word}" could not be found.` });
        }
        console.error("Error in /api/lookup:", error);
        res.status(500).json({ error: "An internal server error occurred." });
    }
});
app.use('/api/words', wordRoutes); // <-- DÒNG MỚI
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Vocabulary Lookup API is running!'
    });
});
// --- KHỞI ĐỘNG SERVER ---
app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});
