import express from 'express';
import {login, signup, logout} from '../controllers/authController.js';

const route = express.Router();


route.get("/login", login);
route.get("/signup", signup);
route.get("/logout", logout);

export default route;


