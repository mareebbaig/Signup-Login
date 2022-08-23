import { signup, login, verifyUser,forgetPassword,resetPassword } from "../controllers/user.js";
import express, { Router } from "express";

//initialise the router
const router = Router();

router.get('/verifyuser/:token', verifyUser);
router.post('/login', login);
router.post('/forgetpassword',forgetPassword);

router.post('/resetpassword',resetPassword);
//get all transactions

//create transaction route
router.post('/signup', signup);



//get transaction history of an user

export default router;
