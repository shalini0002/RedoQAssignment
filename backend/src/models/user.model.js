// models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ["ADMIN", "REVIEWER_1", "REVIEWER_2"],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
