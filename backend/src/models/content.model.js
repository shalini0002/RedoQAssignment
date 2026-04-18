// models/content.model.js
import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  title: String,
  body: String,
  status: {
    type: String,
    enum: ["DRAFT", "REVIEW_1", "REVIEW_2", "APPROVED", "REJECTED"],
    default: "DRAFT"
  },
  createdBy: String,
  // Track if content is currently editable

  // isLocked: {
  //   type: Boolean,
  //   default: false
  // },
  isEditable: {
    type: Boolean,
    default: true
  },
  // Track rejection reason
  rejectionReason: String,
  // Track which roles have approved this content
  approvedBy: [{
    role: String,
    timestamp: Date
  }]
}, { timestamps: true });

export default mongoose.model("Content", contentSchema);