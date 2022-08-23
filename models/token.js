
import mongoose from "mongoose";

var tokenSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: { type: String, required: true },
});


const Token = mongoose.model("Token", tokenSchema);

export default Token;