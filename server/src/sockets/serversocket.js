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
    io.emit("connecting_users", connectedUsersSet.size);

    /**
     * Handles when a user joins a room
     */
    socket.on("joinRoom", async ({ blockId }) => {
      if (!blockId) return; // Ensure blockId is valid

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

          // Send the correct code (current_code if exists, otherwise initial_code)
          const codeToSend = updatedBlock.current_code ? updatedBlock.current_code : updatedBlock.initial_code || "";
          socket.emit("codeUpdate", { blockId, code: codeToSend });

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
     * Handles code updates from users
     */
    socket.on("codeUpdate", async ({ blockId, newCode }) => {
      try {
        const updatedBlock = await CodeBlock.findByIdAndUpdate(
          blockId, 
          { current_code: newCode }, 
          { new: true }
        );

        // Broadcast the updated code to all users in the room
        io.to(blockId).emit("codeUpdate", { blockId, code: newCode });

        // Check if the solution is correct and notify users
        if (updatedBlock.solution.replace(/\s+/g, "") === newCode.replace(/\s+/g, "")) {
          io.to(blockId).emit("solutionCorrect", { blockId });
        }
      } catch (error) {
        console.error("Error updating code:", error);
      }
    });

    /**
     * Handles when a user leaves a room
     */
    socket.on("leaveRoom", async ({ blockId }) => {
      if (!activeRooms[blockId]) return; 

      // Remove the user from the room's participant list
      activeRooms[blockId] = activeRooms[blockId].filter(user => user !== socket.id);

      // If the mentor leaves, reset the room and notify users
      if (mentors[blockId] === socket.id) {
        try {
          await CodeBlock.findByIdAndUpdate(blockId, { current_code: "" }, { new: true });

          io.to(blockId).emit("mentorLeft", { blockId });
        } catch (error) {
          console.error("Error clearing initial_code:", error);
        }
        delete activeRooms[blockId];
        delete mentors[blockId];
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
    socket.on("disconnect", async () => {
      for (const blockId in activeRooms) {
          if (activeRooms[blockId].includes(socket.id)) {
              // Remove the user from the room
              activeRooms[blockId] = activeRooms[blockId].filter(userId => userId !== socket.id);

              // If the mentor leaves, notify users and reset the room
              if (mentors[blockId] === socket.id) {
                  await CodeBlock.findByIdAndUpdate(blockId, { $set: { current_code: "" } });
                  io.to(blockId).emit("mentorLeft", { blockId });

                  delete activeRooms[blockId];
                  delete mentors[blockId];
              }

              // Update participant count in the database
              const updatedBlock = await CodeBlock.findByIdAndUpdate(
                  blockId,
                  { $set: { participants: activeRooms[blockId]?.length || 0 } },
                  { new: true }
              );

              // Notify users in the room about the updated count and mentor status
              io.to(blockId).emit("roomUsers", {
                  userCount: updatedBlock?.participants || 0,
                  mentor: mentors[blockId] || null,
                  blockId,
              });
          }
      }

      // Remove user from the connected users set
      connectedUsersSet.delete(socket.id);
      io.emit("connecting_users", connectedUsersSet.size);
    });
  });
};
