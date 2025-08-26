import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },          
    iv: { type: String, default: null },                
    tag: { type: String, default: null },                
    enc: { type: Boolean, default: false },          
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    room: { type: String, required: true, index: true }, 
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

MessageSchema.index({ room: 1, timestamp: -1 });

export default mongoose.model("Message", MessageSchema);
