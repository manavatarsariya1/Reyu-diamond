import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./config/firebase-admin.config.js";
import routes from './routes/index.routes.js';
import { connectDB } from './config/db.js';
import { createServer } from "http";
import { initSocket } from "./socket.js";
import { stripeWebhookHandler } from "./controllers/stripe.controller.js";
import { initAuctionCron } from "./cron/auction.cron.js";

dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Cron Jobs
// initAuctionCron();

const app = express();
const httpServer = createServer(app);

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);

// Initialize Socket.io
initSocket(httpServer);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Firebase connection
app.get("/test-firebase", async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("test").get();
    res.json({ count: snapshot.size });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// api routes
app.use('/api', routes);

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
