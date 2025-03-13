import io from "socket.io-client";

const socket = io("https://jamoveo-production-6dff.up.railway.app");

socket.on("connect", () => {
    console.log("client connected to the server with ID: ", socket.id);
})

export default socket;