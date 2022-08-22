import { boolean } from "joi";
import mongoose from "mongoose";
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

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
    type: boolean,
    default: false,
  },
});

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(255).required(),
    emailId: Joi.string().min(5).max(255).required(),
    password: new passwordComplexity({
      min: 8,
      max: 12,
      lowerCase: 1,
      numeric: 1,
      symbol: 1,
    }),
  });
  return schema.validate(user);
}

export default { User, validateUser };
