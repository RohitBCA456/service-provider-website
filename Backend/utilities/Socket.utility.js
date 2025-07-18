import { Server } from "socket.io";
import { Message } from "../Models/Message.Model.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("send-message", async ({ senderId, receiverId, message }) => {
      try {
        if (!senderId || !receiverId || !message) {
          console.error("Missing data in send-message event");
          return;
        }

        const participants = [senderId, receiverId].sort();
        const roomId = `${participants[0]}-${participants[1]}`;

        // Save to database
        await Message.create({
          senderId,
          receiverId,
          message,
          roomId,
        });

        // Emit to recipient
        socket.to(receiverId).emit("receive-message", {
          senderId,
          message,
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log("User joined room:", userId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
