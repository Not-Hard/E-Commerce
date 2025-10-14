import express from 'express'
import mongoose from 'mongoose';
import { type } from 'os';

const Schema = mongoose.Schema;


//user schema
const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    cartItems: [
        {
            quantity:{
                type: Number,
                default: 1,
            },
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        }
    ]
});

const User = mongoose.model('User', userSchema);

export default User;
