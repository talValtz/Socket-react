import { io } from "socket.io-client";

const socket = io.connect("http://localhost:3000", { transports: ["websocket"] });

export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
        console.log("🔗 Connected to WebSocket server");
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
        console.log("❌ Disconnected from WebSocket server");
    }
};

// ✅ Ensure correct format when joining a room
export const joinRoom = (roomId) => {
    console.log(`📌 Sending join_room event for room: ${roomId}`);
    socket.emit("joinRoom", { blockId: roomId }); // ✅ Fix: Use correct object format
    console.log(`✅ Emitted join_room event for: ${roomId}`);
};

// ✅ Improved: Prevent duplicate listeners
export const subscribeToUserCount = (setUserCount) => {
    const handleUserCountUpdate = (count) => {
        setUserCount(count);
        console.log(`👥 Updated user count: ${count}`);
    };

    socket.off("connecting_users"); // Remove previous listeners
    socket.on("connecting_users", handleUserCountUpdate);

    return () => {
        console.log("🔇 Unsubscribing from user count updates...");
        socket.off("connecting_users", handleUserCountUpdate);
    };
};

// ✅ Improved: Prevent duplicate listeners
export const subscribeToRoomUsers = (roomId, setUserCount, setMentorId) => {
    const handleRoomUsersUpdate = ({ userCount, mentor, blockId }) => {
        console.log(`👥 Received room update: blockId = ${blockId.blockId}, expected roomId = ${roomId}`);

        if (blockId.blockId === roomId) { // ✅ Only update if the event is for the correct room
            setUserCount(userCount);
            setMentorId(mentor);
            console.log(`✅ Updated users in room ${blockId}: ${userCount}, Mentor: ${mentor}`);
        } else {
            console.log(`⚠️ Ignored update for different room: ${blockId}`);
        }
    };

    socket.off("roomUsers"); // ✅ Prevent multiple listeners
    socket.on("roomUsers", handleRoomUsersUpdate);

    return () => {
        console.log("🔇 Unsubscribing from roomUsers...");
        socket.off("roomUsers", handleRoomUsersUpdate);
    };
};



export const removeListeners = () => {
    socket.off("roomUsers");
    socket.off("connecting_users");
    console.log("🔇 Removed all socket listeners");
};

export { socket };
