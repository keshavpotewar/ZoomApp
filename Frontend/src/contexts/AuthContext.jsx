import axios, { HttpStatusCode } from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import HttpStatus  from "http-status";
import { useNavigate } from "react-router-dom";


export const AuthContext = createContext();

const client = axios.create({
    baseURL: "http://localhost:8000/api/v1/user",

});

export const AuthProvider = ({ children }) => {
    const authContext = useContext(AuthContext);

    const [userData, setUserData] = useState(authContext);

    const router = useNavigate(); 
    const handleRegister = async (name, username, password) => {
        try {
            const response = await client.post("/register", {
                name,
                username,
                password
            });

            if (response.status === HttpStatus.CREATED) {
                return response.data.message;
            }
        } catch (error) {
            throw error;
        }
    };

    const handleLogin = async (username, password) => {
        try {
            const response = await client.post("/login", {
                username,
                password
            });
            console.log(response.data);

            if (response.status === HttpStatus.OK) {
                localStorage.setItem("token", response.data.token);
                return response.data.message;
            }
        } catch (error) {
            throw error;
        }
    }

   


    const data = {
        userData, setUserData ,handleRegister,handleLogin
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )


}