
import httpStatus from "http-status";
import {userModel} from "../Models/user.model.js";
import bcrypt  from "bcrypt";

import crypto from "crypto";




const login = async (req, res) => {
    const { username, password } = req.body;
    
    // console.log(username, password)

    if(!username || !password) {
        return res.status(400).json({ message: "Username and password not provide" });
    }

    try {
        const user = await userModel.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        if(await bcrypt.compare(password, user.password)) {
            // return res.status(httpStatus.OK).json({ message: "Login successful" });
            let token = crypto.randomBytes(20).toString('hex');

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ message: "Login successful", token: token });
        }
        else{
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid password and username" });
        }


        
    } catch (error) {
        return res.status(500).json({ message: "something went wrong" });

        
    }
}

const register = async (req, res) => {
    const { username, password, name } = req.body;
    try {
        const user = await userModel.findOne({ username });
        if (user) {
            return res.status(httpStatus.FOUND).json({ message: "User already exists" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            username,
            password: hashPassword,
            name
        });

        await newUser.save();
        res.status(httpStatus.CREATED).json({ message: "User registered successfully" });
    } catch (error) {

        res.json("something went wrong" + error)

    }
}

export { login, register };