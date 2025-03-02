import { io } from "socket.io-client";

const socket = io.connect("http://localhost:3000", { transports: ["websocket"] });

/**
 * Connects to the WebSocket server if not already connected.
 */
export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};

/**
 * Disconnects from the WebSocket server if currently connected.
 */
export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

/**
 * Sends a request to join a specific room.
 * @param {string} roomId - The ID of the room to join.
 */
export const joinRoom = (roomId) => {
    socket.emit("joinRoom", { blockId: roomId });
};

/**
 * Subscribes to real-time updates of the total user count in the system.
 * @param {Function} setUserCount - Function to update the user count state.
 * @returns {Function} Cleanup function to remove the listener.
 */
export const subscribeToUserCount = (setUserCount) => {
    const handleUserCountUpdate = (count) => {
        setUserCount(count);
    };

    socket.off("connecting_users"); // Remove any previous listeners
    socket.on("connecting_users", handleUserCountUpdate);

    return () => {
        socket.off("connecting_users", handleUserCountUpdate);
    };
};

/**
 * Subscribes to real-time updates of a specific room.
 * @param {string} roomId - The ID of the room to subscribe to.
 * @param {Function} setUserCount - Function to update the room's user count.
 * @param {Function} setMentorId - Function to update the room's mentor ID.
 * @returns {Function} Cleanup function to remove the listener.
 */
export const subscribeToRoomUsers = (roomId, setUserCount, setMentorId) => {
    const handleRoomUsersUpdate = ({ userCount, mentor, blockId }) => {
        if (blockId === roomId) {
            setUserCount(userCount);
            setMentorId(mentor);
        }
    };

    socket.off("roomUsers"); // Remove any previous listeners
    socket.on("roomUsers", handleRoomUsersUpdate);

    return () => {
        socket.off("roomUsers", handleRoomUsersUpdate);
    };
};

/**
 * Sends a request to leave a specific room.
 * @param {string} roomId - The ID of the room to leave.
 */
export const leaveRoom = (roomId) => {
    socket.emit("leaveRoom", { blockId: roomId });
};

/**
 * Removes all socket event listeners.
 */
export const removeListeners = () => {
    socket.off("roomUsers");
    socket.off("connecting_users");
};

export { socket };
