// const express = require("express")
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors")
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");

app.use(cors());

// const app = express();
dotenv.config({ path: "./config.env" }); //loading environment variables
const port = process.env.PORT || 3001;
// app.use(cors({ origin: "http://localhost:3000" }));



// app.get("/", (req, res) => {
//     res.send("Server is running")
// });
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB!");
    }).catch(err => {
        console.error("MongoDB connection error:", err);
    });

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const users = {}
let current_song = null;

io.on("connection", (socket) => {
    console.log(`🔵 user connected: ${socket.id}`);
    socket.on("user_connected", (userData) => {
        users[socket.id] = userData; //saves as {socket.id:{username, instrument } }
        console.log(`👤 ${userData.username} connected with instrument: ${userData.instrument}`);
        if (current_song) {
            socket.emit("song_selected", current_song);
        }
    });

    socket.on("get_user_data", () => {
        if (users[socket.id]) {
            socket.emit("user_data", users[socket.id]);
        }
    });

    socket.on("admin_selected_song", (song) => {
        console.log("🎵 Admin chose a song:", song);
        current_song=song;
        io.emit("song_selected", song); // broadcast to all connected users
    })

    socket.on("quit_session", () => {
        current_song = null;
        io.emit("live_session_quit");
        
        
        // for (const socketId in users) { //cleared users list
        //     delete users[socketId]
        //     //remove multiple listener in order to prevent many calls to the server
        //     socket.off("user_connected");
        //     socket.off("get_user_data");
        //     socket.off("admin_selected_song");
        //     socket.off("quit_session");
        // }
    });

    socket.on("disconnect", () => {
        console.log(`❌ user disconnected: ${socket.id}`);
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})