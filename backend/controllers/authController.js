import express from "express"


//Verification of user signup properly
export const signup = async (req, res) => {
    const {user,email,password} = req.body;

    
}

export const login = async (req, res) => {
    res.send("Login Route");
}

export const logout = async (req, res) => {
    res.send("Logout Route");
}