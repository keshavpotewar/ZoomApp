
import { Server } from 'socket.io'

let connections = {}
let timeOnline = {}
let messages = {}



export const connectTosocket = (server) => {
    const io = new Server(server,{
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
    }})

    io.on("connection", (socket) => {
        console.log("New user connected");

        socket.on("join-call", (path) => {
            if (connections[path] === undefined) {
                connections[path] = []
            } else {
                connections[path].push(socket.id)

                timeOnline[socket.id] = Date.now()

                for (let i = 0; i < connections[path].length; i++) {

                    io.to(connections[path][i]).emit("user-joined", socket.id) 
                }
                if (messages[path] !== undefined) {
                    for (let i = 0; i < messages[path].length; i++) {
                        io.to(socket.id).emit("chat-message", messages[path][i]['data'], messages[path][i]['sender'], messages[path][i]['socket-id-sender'])

                    }
                }
            }



        })
        socket.on("signal", (message) => {
            // console.log("User disconnected")
            io.to(toId).emit("signal", socket.id, message)
        })
        socket.on("chat-message", (message) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true]
                    }
                    return [room, isFound]
                }, ['', false]);

            if (found == true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }
                messages[matchingRoom].push({ sender: sender, "socket-id-sender": socket.id })
                console.log("messages", key, ":", sender, data)
                connections[matchingRoom].forEach((userId) => {
                    io.to(userId).emit("chat-message", data, sender, socket.id)
                })

            }


        })
        socket.on("disconnect", () => {
            var diffTime = Math.abs(Date.now() - timeOnline[socket.id]);
            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                for (let i = 0; i < v.length; i++) {
                    if (v[i] === socket.id) {
                        key = k;
                        for (let j = 0; j < connections[key].length; j++) {
                            io.to(connections[key][j]).emit("user-left", socket.id)
                        }
                        var index = connections[key].indexOf(socket.id);
                        connections[key].splice(index, 1);
                        if (connections[key].length === 0) {
                            delete connections[key]
                            delete messages[key]
                        }

                    }

                }
            };
        });
    })
    

 return io;

}



export default {connectTosocket};