// const express = require("express")
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors")
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { fetchSongDetails } = require("./scrapers/tab4uScraper");

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
        users[socket.id] = userData;
        console.log(`👤 ${userData.username} connected with instrument: ${userData.instrument}`);

        if (current_song) {
        console.log("📡 Sending current song to new user:", current_song);
            socket.emit("song_selected", current_song);
        }
    });

    socket.on("get_user_data", () => {
        if (users[socket.id]) {
            
            socket.emit("user_data", users[socket.id]);
        }
    });

    socket.on("admin_selected_song", async (song) => {
        console.log("🎵 Admin chose a song:", song);
    
        try {
            // Get full song details before broadcasting
            const fullSongDetails = await fetchSongDetails(song.link);
            
            if (!fullSongDetails) {
                console.error("❌ Failed to fetch song details.");
                return;
            }
    
            // Merge full details with existing song data
            const fullSong = {
                ...song,
                lyrics: fullSongDetails.lyrics,
                chords_with_lyrics: fullSongDetails.chords_with_lyrics
            };
    
            // Save current song
            current_song = fullSong;
    
            // Broadcast full song details to all users
            io.emit("song_selected", fullSong);
            console.log("📡 Sent full song details to users.");
    
        } catch (error) {
            console.error("❌ Error fetching song details:", error);
        }
    });

    socket.on("quit_session", () => {
        console.log("❌ Admin quit session, clearing song data...");
        current_song = null;
        io.emit("live_session_quit");
    });

    socket.on("disconnect", () => {
        console.log(`❌ user disconnected: ${socket.id}`);
        delete users[socket.id];
        console.log("👥 Updated users list:", users);
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})