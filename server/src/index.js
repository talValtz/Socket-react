import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./config/db.js";
import codeblockRoutes from "./routes/codeblock.route.js";
import { socketHandler } from "./sockets/serversocket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5174", methods: ["GET", "POST"] },
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// API Routes
app.use("/api/codeblocks", codeblockRoutes);

// Socket.io
socketHandler(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(` Server running on port ${PORT}`));
