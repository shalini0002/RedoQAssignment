import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import contentRoutes from "./routes/content.routes.js";

dotenv.config();

const app = express();

// 🔥 👉 ADD CORS HERE (VERY IMPORTANT POSITION)
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return callback(null, true);
    }
    
    // Allow Netlify domains
    if (origin.includes(".netlify.app")) {
      return callback(null, true);
    }
    
    // Allow specific frontend URL if set
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    callback(null, true); // Temporarily allow all origins for testing
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// 👉 then JSON middleware
app.use(express.json());

// 👉 then routes
app.use("/api/content", contentRoutes);

// 👉 DB connection
const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => console.error(err));