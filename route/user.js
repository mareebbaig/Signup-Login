import { signup, login } from "../controllers/user.js";
import express, { Router } from "express";

//initialise the router
const router = Router();

router.post("/login", login);
//get all transactions

//create transaction route
router.post("/signup", signup);

//get transaction history of an user

export default router;
