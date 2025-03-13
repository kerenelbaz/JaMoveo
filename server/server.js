const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors")
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { fetchSongDetails } = require("./scrapers/tab4uScraper");

const corsOptions = {
    origin: ["http://localhost:5173", "https://jamoveo-production-311f.up.railway.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use(cors(corsOptions));

dotenv.config({ path: "./config.env" }); // Environment variables
const port = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB!");
    }).catch(err => {
        console.error("MongoDB connection error:", err);
    });

const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://jamoveo-production-311f.up.railway.app"],
        methods: ["GET", "POST"],
        credentials: true
    }
});
const users = {}
let current_song = null;

io.on("connection", (socket) => {

    socket.on("user_connected", (userData) => {
        users[socket.id] = userData;

        if (current_song) {
            socket.emit("song_selected", current_song);
        }
    });

    socket.on("get_user_data", () => {
        if (users[socket.id]) {

            socket.emit("user_data", users[socket.id]);
        }
    });

    socket.on("admin_selected_song", async (song) => {

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

            current_song = fullSong;
            io.emit("song_selected", fullSong);

        } catch (error) {
            console.error("❌ Error fetching song details:", error);
        }
    });

    socket.on("quit_session", () => {
        current_song = null;
        io.emit("live_session_quit");
    });

    socket.on("disconnect", () => {
        console.log(`❌ user disconnected: ${socket.id}`);
        delete users[socket.id];
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`)
})