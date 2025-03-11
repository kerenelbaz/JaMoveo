const express = require("express")
const cors = require("cors")
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get("/", (req, res) => {
    res.send("Server is running")
});

server.listen(3001, () => {
    console.log("Server running on port 3001")
})