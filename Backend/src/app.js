
import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import cors from 'cors';
import { connectTosocket } from './Controllers/scoketManager.js'
import userRoutes from './Routes/user.routes.js'

const app = express();
const server = createServer(app)

app.set("port", 8000)
const io = connectTosocket(server)

app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}));


app.use("/api/v1/user", userRoutes)
app.use("/api/v2/user", userRoutes)


app.get("/", (req, res) => {
    res.send("Hello from /")
})
app.get("/home", (req, res) => {
    res.send("Hello from home")
})

const start = () => {
    const connect = mongoose.connect("mongodb://localhost:27017/VideoApp")
        .then(() => {
            console.log("Connected to MongoDB")
        })


    server.listen(app.get("port"), () => {
        console.log("Server is running on port 8000")
    })
}

start()
