import CodeBlock from "../models/model.codeblock.js";

// Stores active rooms and their participants
const activeRooms = {};
// Stores the mentor assigned to each room
const mentors = {};
// Tracks the total number of connected users
const connectedUsersSet = new Set();

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    // Add user to the set of connected users
    connectedUsersSet.add(socket.id);
    // Emit updated user count to all clients
    io.emit("connecting_users", connectedUsersSet.size);

    /**
     * Handles when a user joins a room
     */
    socket.on("joinRoom", async ({ blockId }) => {
      if (!blockId) return; // Ensure blockId is valid

      // Add the user to the room
      socket.join(blockId);

      // Initialize the room if it doesn't exist
      if (!activeRooms[blockId]) activeRooms[blockId] = [];

      // Prevent duplicate entries for the same user in the room
      if (!activeRooms[blockId].includes(socket.id)) {
        activeRooms[blockId].push(socket.id);

        try {
          // Update the number of participants in the database
          const updatedBlock = await CodeBlock.findByIdAndUpdate(
            blockId,
            { $set: { participants: activeRooms[blockId].length } },
            { new: true }
          );

          // Assign the first user in the room as the mentor
          if (!mentors[blockId]) mentors[blockId] = socket.id;

          // Notify all users in the room about the updated user count and mentor
          io.to(blockId).emit("roomUsers", {
            userCount: updatedBlock.participants,
            mentor: mentors[blockId],
            blockId,
          });
        } catch (error) {
          console.error("Error updating participants:", error);
        }
      }
    });

    /**
     * Handles when a user leaves a room
     */
    socket.on("leaveRoom", async ({ blockId }) => {
      if (!activeRooms[blockId]) return; // Ensure the room exists

      // Remove the user from the room's participant list
      activeRooms[blockId] = activeRooms[blockId].filter(user => user !== socket.id);

      // If the mentor leaves, notify all users and reset the room
      if (mentors[blockId] === socket.id) {
        io.to(blockId).emit("mentorLeft", { blockId });
        delete activeRooms[blockId]; // Clear the room
        delete mentors[blockId]; // Remove mentor assignment
      }

      try {
        // Update the number of participants in the database
        const updatedBlock = await CodeBlock.findByIdAndUpdate(
          blockId,
          { $set: { participants: activeRooms[blockId]?.length || 0 } },
          { new: true }
        );

        // Notify all users in the room about the updated user count and mentor
        io.to(blockId).emit("roomUsers", {
          userCount: updatedBlock?.participants || 0,
          mentor: mentors[blockId] || null,
          blockId,
        });
      } catch (error) {
        console.error("Error updating participants:", error);
      }
    });

    /**
     * Handles user disconnection
     */
    socket.on("disconnect", () => {
      // Remove user from the connected users set
      connectedUsersSet.delete(socket.id);
      // Notify all clients of the updated user count
      io.emit("connecting_users", connectedUsersSet.size);
    });
  });
};
