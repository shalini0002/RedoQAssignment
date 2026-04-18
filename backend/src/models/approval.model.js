import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema({
    contentId: mongoose.Schema.Types.ObjectId,
    stage: String,
    action: String,
    comment: String,
    reviewedBy: String,

},{timestamps: true});
export default mongoose.model("ApprovalLog", approvalSchema)