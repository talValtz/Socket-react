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
    
    socket.on('joinRoom', (id) => {
        console.log("jesdbehbs");
        socket.join(id);
        console.log(`${socket.id} joined room ${id}`);
        

        // Add user to the room tracking
       if (!activeRooms[id]) {
            activeRooms[id] = [];
        }
        activeRooms[id].push(socket.id);

        // Assign first user as mentor
        if (!mentors[id]) {
            mentors[id] = socket.id;
            console.log(`🏆 Mentor for room ${id}: ${socket.id}`);
        }

        console.log(`${socket.id} joined room ${JSON.stringify(id)}, Users: ${activeRooms[id].length}`);

        // Send updated user count and mentor to the room
        io.to(id).emit("roomUsers", {
            userCount: activeRooms[id].length,
            mentor: mentors[id],
            blockId: id

        });
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