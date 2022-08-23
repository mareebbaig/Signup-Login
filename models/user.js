
import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  emailId: {
    type: String,
    required: true,
    unique: true,
    min: 5,
    max: 255,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type : Boolean,
    default: false,
  },
});

const User = mongoose.model("User", userSchema);



export default User;
