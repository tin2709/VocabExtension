import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Một API route mẫu
app.get('/api/greeting', (req, res) => {
    res.json({ message: 'Hello from the Node.js server!' });
});

app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});