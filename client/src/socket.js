import io from "socket.io-client";

const socket = io("http://localhost:3001");

socket.on("connect", () => {
    console.log("client connected to the server with ID: ", socket.id);
})

export default socket;