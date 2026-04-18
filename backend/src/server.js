import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import contentRoutes from "./routes/content.routes.js";

dotenv.config();

const app = express();

// 🔥 👉 ADD CORS HERE (VERY IMPORTANT POSITION)
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"], // Allow both possible frontend ports
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// 👉 then JSON middleware
app.use(express.json());

// 👉 then routes
app.use("/api/content", contentRoutes);

// 👉 DB connection
const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => console.error(err));