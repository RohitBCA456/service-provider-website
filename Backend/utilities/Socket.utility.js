import { Server } from "socket.io";
import { Message } from "../Models/Message.Model.js";
import { redisClient } from "../config/redis.config.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("send-message", async ({ senderId, receiverId, message }) => {
      try {
        const participants = [senderId, receiverId].sort();
        const roomId = `${participants[0]}-${participants[1]}`;

        const newMessage = await Message.create({
          senderId,
          receiverId,
          message,
          roomId,
        });

        const cacheKey = `chat:${roomId}:latest`;
        const cachedMessages = await redisClient.get(cacheKey);

        if (cachedMessages) {
          const parsedCache = JSON.parse(cachedMessages);

          parsedCache.messages.push(newMessage);

          if (parsedCache.messages.length > 20) {
            parsedCache.messages.shift();
          }

          await redisClient.setEx(cacheKey, 3600, JSON.stringify(parsedCache));
        }

        socket.to(receiverId).emit("receive-message", {
          id: newMessage._id,
          senderId,
          message,
          createdAt: newMessage.createdAt,
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
