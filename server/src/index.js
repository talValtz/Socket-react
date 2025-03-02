import dotenv from "dotenv";

import mongoose from "mongoose";
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from "./config/db.js";
import CodeBlock from "./models/model.codeblock.js";






dotenv.config(); // Ensure this is at the top

const app = express();
const server = http.createServer(app);
//const io = new Server(server, { cors: { origin: '*' } });


const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/online_coding_platform';
app.use(cors());
app.use(express.json());

// התחברות ל-Socket.io
const io = new Server(server, {
    cors: {
      origin: "http://localhost:5174",
      methods: ["GET", "POST"],
    },
  });
  let connectedUsersSet = new Set();
  const activeRooms = {}; // Store users per room
const mentors = {};


  io.on('connection', (socket) => {
    connectedUsersSet.add(socket.id);
    console.log('🔌 משתמש מחובר:', socket.id);
    io.emit("connecting_users", connectedUsersSet.size);
    console.log(`🔗 User Connected: ${socket.id}, Total Users: ${connectedUsersSet.size}`);
    
    socket.on("joinRoom", async ({ blockId }) => {
        if (!blockId) {
            console.error("❌ שגיאה: blockId לא התקבל מהלקוח.");
            return;
        }
    
        console.log(`📌 הצטרפות לחדר ${blockId}...`);
        socket.join(blockId);
    
        // ✅ יצירת רשימה חדשה אם החדר לא קיים
        if (!activeRooms[blockId]) {
            activeRooms[blockId] = [];
        }
    
        // ✅ מניעת כפילות: רק אם המשתמש לא נמצא כבר ברשימה
        if (!activeRooms[blockId].includes(socket.id)) {
            activeRooms[blockId].push(socket.id);
    
            try {
                // ✅ עדכון מסד הנתונים בהתאם למספר המשתמשים ב-`activeRooms`
                const updatedBlock = await CodeBlock.findByIdAndUpdate(
                    blockId,
                    { $set: { participants: activeRooms[blockId].length } }, // ✅ מספר המשתמשים בפועל
                    { new: true }
                );
    
                if (!updatedBlock) {
                    console.error(`❌ שגיאה: CodeBlock עם מזהה ${blockId} לא נמצא.`);
                    return;
                }
    
                console.log(`✅ מספר המשתתפים בחדר ${blockId}: ${updatedBlock.participants}`);
    
                // ✅ קביעת מנטור ראשון
                if (!mentors[blockId]) {
                    mentors[blockId] = socket.id;
                    console.log(`🏆 המנטור של חדר ${blockId}: ${socket.id}`);
                }
    
                // ✅ שליחת עדכון לכל המשתמשים
                io.to(blockId).emit("roomUsers", {
                    userCount: updatedBlock.participants,
                    mentor: mentors[blockId],
                    blockId: blockId
                });
    
            } catch (error) {
                console.error(`❌ שגיאה בעדכון מספר המשתתפים:`, error);
            }
        } else {
            console.log(`⚠️ משתמש ${socket.id} כבר רשום בחדר ${blockId}, לא מוסיפים שוב.`);
        }
    });
    
    

    socket.on("leaveRoom", async ({ blockId }) => {
        console.log(`🚪 ${socket.id} יוצא מהחדר ${blockId}`);
        
        try {
            if (!activeRooms[blockId]) {
                console.error(`⚠️ החדר ${blockId} לא נמצא.`);
                return;
            }
    
            // ✅ הסרת המשתמש מהרשימה
            activeRooms[blockId] = activeRooms[blockId].filter(userId => userId !== socket.id);
    
            // ✅ אם המנטור עוזב, יש לאפס את המנטור ולהעביר את כל המשתמשים **באותו חדר בלבד** ללובי
            if (mentors[blockId] === socket.id) {
                console.log(`🚨 המנטור ${socket.id} עזב את החדר ${blockId}. מעבירים את כולם ללובי...`);
    
                // ✅ שליחת הודעה **רק למשתמשים בחדר הזה** שיעברו ללובי
                io.to(blockId).emit("mentorLeft", { blockId });
    
                // ✅ כל משתמש יוצא מהחדר בשרת
                activeRooms[blockId].forEach(userSocketId => {
                    io.sockets.sockets.get(userSocketId)?.leave(blockId);
                });
    
                // ✅ ניקוי רשימת המשתמשים בחדר
                delete activeRooms[blockId];
                delete mentors[blockId]; // ✅ איפוס המנטור
            }
    
            // ✅ עדכון מספר המשתמשים במסד הנתונים
            const updatedBlock = await CodeBlock.findByIdAndUpdate(
                blockId,
                { $set: { participants: activeRooms[blockId]?.length || 0 } },
                { new: true }
            );
    
            console.log(`✅ מספר המשתתפים בחדר ${blockId} לאחר עזיבה: ${updatedBlock?.participants}`);
    
            // ✅ שליחת עדכון לכל המשתמשים **שנשארו בחדר**
            io.to(blockId).emit("roomUsers", {
                userCount: updatedBlock?.participants || 0,
                mentor: mentors[blockId] || null,
                blockId: blockId
            });
    
        } catch (error) {
            console.error(`❌ שגיאה בהפחתת מספר המשתתפים:`, error);
        }
    });
    
    
    
    
    
    socket.on('disconnect', () => {
        console.log('❌ משתמש התנתק:', socket.id);
        connectedUsersSet.delete(socket.id);
        io.emit("connecting_users", connectedUsersSet.size);
        console.log(`🔗 User Connected: ${socket.id}, Total Users: ${connectedUsersSet.size}`);
        for (const blockId in activeRooms) {
            if (activeRooms[blockId].includes(socket.id)) {
                // Remove the user from the room list
                activeRooms[blockId] = activeRooms[blockId].filter(userId => userId !== socket.id);

                // If the mentor left, assign a new mentor
                /*if (mentors[blockId] === socket.id) {
                    mentors[blockId] = activeRooms[blockId][0] || null;
                    console.log(`🔄 New mentor for room ${blockId}: ${mentors[blockId]}`);
                }*/

                // Notify all users in the room
                io.to(blockId).emit("roomUsers", {
                    userCount: activeRooms[blockId].length,
                    mentor: mentors[blockId]
                });

                // If the room is empty, clean up
                if (activeRooms[blockId].length === 0) {
                    delete activeRooms[blockId];
                    delete mentors[blockId];
                    console.log(`🗑️ Room ${blockId} deleted`);
                }
            }
        }



    });
});

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// API להחזרת בלוקי קוד
app.get('/api/codeblocks', async (req, res) => {
    try {
        //console.log("📥 Received request headers:", req.headers);
        const codeBlocks = await CodeBlock.find({});
        res.json(codeBlocks);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});
app.get('/api/codeblocks/:id', async (req, res) => {
    try {
        const block = await CodeBlock.findById(req.params.id);
        if (!block) {
            return res.status(404).json({ message: "CodeBlock not found" });
        }
        res.json(block);
    } catch (error) {
        console.error("❌ Error fetching CodeBlock:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT,()=>{
    console.log("console is running is on PORT:"+ PORT);
    //CodeBlock();
    //connectDB();
    
}); 