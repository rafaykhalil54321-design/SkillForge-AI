const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// --- YOUR MAGIC CLOUD DATABASE LINK ---
const MONGO_URI = "mongodb://rafay_user:RAFAYKHALIL12345@ac-cdztph2-shard-00-00.fvgtphf.mongodb.net:27017,ac-cdztph2-shard-00-01.fvgtphf.mongodb.net:27017,ac-cdztph2-shard-00-02.fvgtphf.mongodb.net:27017/skillforge?ssl=true&authSource=admin&retryWrites=true&w=majority";

// 1. Connect to MongoDB Cloud
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err.message));

// 2. Blueprint for saving resumes
const resumeSchema = new mongoose.Schema({
    filename: String,
    role: String,
    roadmap: [String],
    uploadDate: { type: Date, default: Date.now }
});
const Resume = mongoose.model('Resume', resumeSchema);

// 3. Blueprint for saving Chats (UPDATED FOR SESSIONS ✨)
const chatSchema = new mongoose.Schema({
    sessionId: { type: String, required: true }, // NEW: Har chat ka apna ek makhsoos Folder ID hoga
    prompt: String,
    reply: String,
    date: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', chatSchema);

// 4. Blueprint for Users 
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const upload = multer({ storage: multer.memoryStorage() });

// --- ROUTE 1: FILE UPLOAD ---
app.post('/api/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

        console.log(`✅ Success! Backend received file: ${req.file.originalname}`);
        const form = new FormData();
        form.append('file', req.file.buffer, { filename: req.file.originalname });

        const aiResponse = await axios.post('http://127.0.0.1:5001/upload', form, {
            headers: { ...form.getHeaders() }
        });

        const newRecord = new Resume({
            filename: req.file.originalname,
            role: aiResponse.data.role,
            roadmap: aiResponse.data.roadmap
        });
        
        await newRecord.save();
        console.log("💾 AI Analysis officially saved to the database!");

        res.json({ success: true, data: aiResponse.data });
    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ success: false, message: "Server failed to process file." });
    }
});

// --- ROUTE 2: DIRECT CHAT (UPDATED ✨) ---
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt, sessionId } = req.body; // Frontend ab bataega kis folder mein rakhna hai
        
        if (!prompt) return res.status(400).json({ success: false, message: "No text provided" });
        if (!sessionId) return res.status(400).json({ success: false, message: "Session ID missing" });

        console.log(`💬 Backend received question in Session [${sessionId}]`);

        const aiResponse = await axios.post('http://127.0.0.1:5001/chat', { prompt: prompt });
        const aiReply = aiResponse.data.reply;

        const newChat = new Chat({
            sessionId: sessionId,
            prompt: prompt,
            reply: aiReply
        });
        await newChat.save();
        console.log("💾 Chat saved to specific session folder!");

        res.json({ success: true, data: aiReply });

    } catch (error) {
        console.error("❌ Chat Error:", error.message);
        res.status(500).json({ success: false, message: "Backend failed to talk to Python AI." });
    }
});

// --- ROUTE 3: REGISTER USER ---
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email is already registered!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        
        res.json({ success: true, message: "User Registered Successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Registration failed." });
    }
});

// --- ROUTE 4: LOGIN USER ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Wrong password!" });

        const token = jwt.sign({ userId: user._id }, "SkillForgeSecretKey123", { expiresIn: '1h' });
        
        res.json({ success: true, token, message: "Login Successful!" });
    } catch (error) {
        res.status(500).json({ message: "Login failed." });
    }
});

// --- ROUTE 5: GET ALL CHAT FOLDERS (NEW ✨) ---
app.get('/api/sessions', async (req, res) => {
    try {
        // Database saari chats ko unke sessionId ke hisaab se group karega aur pehle sawal ko Title bana dega!
        const sessions = await Chat.aggregate([
            { $sort: { date: 1 } },
            { $group: { _id: "$sessionId", title: { $first: "$prompt" }, date: { $first: "$date" } } },
            { $sort: { date: -1 } } // Nayi chats upar nazar aayengi
        ]);
        res.json({ success: true, data: sessions });
    } catch (error) {
        res.status(500).json({ message: "Failed to load chat folders." });
    }
});

// --- ROUTE 6: GET CHATS OF A SPECIFIC FOLDER (NEW ✨) ---
app.get('/api/chats/:sessionId', async (req, res) => {
    try {
        const chats = await Chat.find({ sessionId: req.params.sessionId }).sort({ date: 1 });
        res.json({ success: true, data: chats });
    } catch (error) {
        res.status(500).json({ message: "Failed to load chat history." });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});