import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.model.js";

interface AuthSocket extends Socket {
  user?: any;
}

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.use(async (socket: AuthSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization;

      if (!token) return next(new Error("Auth error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await User.findById(decoded.id);

      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch {
      next(new Error("Auth error"));
    }
  });

  io.on("connection", (socket: AuthSocket) => {
    console.log(`✅ ${socket.user.username} connected`);

    // personal room
    socket.join(socket.user._id.toString());

    socket.on("join_conversation", (conversationId: string) => {
      console.log(
        `${socket.user.username} joined conversation ${conversationId}`
      );
      socket.join(conversationId);
    });

    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(conversationId);
    });

    socket.on("disconnect", () => {
      console.log(`❌ ${socket.user.username} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};
