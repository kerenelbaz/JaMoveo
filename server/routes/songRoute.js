const express = require("express");
const fs = require("fs");
const path = require("path");
const { searchSongs, fetchSongDetails } = require("../scrapers/tab4uScraper");

const router = express.Router();
const DATA_FOLDER = path.join(__dirname, "../scrapers/data");
const FILE_PATH = path.join(DATA_FOLDER, "selected_song.json");

if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER, { recursive: true });
}

router.get("/search/:songName", async (req, res) => {
    console.log("🔍 Received request for song:", req.params.songName);

    const songName = req.params.songName;
    if (!songName) {
        console.log("❌ Missing song name");
        return res.status(400).json({ error: "Missing song name" });
    }

    try {
        const songs = await searchSongs(songName);
        if (songs.length === 0) {
            console.log("⚠️ No songs found for:", songName);
            return res.status(404).json({ error: "No songs found" });
        }

        console.log("✅ Sending songs:", songs);
        res.json({ success: true, songs });
    } catch (error) {
        console.error("🔥 ERROR: Scraping failed:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/fetch-song", async (req, res) => {
    const { songUrl, title, artist } = req.body;

    if (!songUrl || !title || !artist) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    try {
        const songDetails = await fetchSongDetails(songUrl);

        if (!songDetails) {
            return res.status(404).json({ error: "Failed to fetch song details" });
        }

        const songData = { title, artist, ...songDetails };

        fs.writeFileSync(FILE_PATH, JSON.stringify(songData, null, 2));
        res.json({ success: true, song: songData });

    } catch (error) {
        console.error("Error fetching song:", error);
        res.status(500).json({ success: false, error: "Failed to fetch song details" });
    }
});

router.post("/select", async (req, res) => {
    const { songUrl, title, artist } = req.body;

    if (!songUrl || !title || !artist) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    try {
        const songDetails = await fetchSongDetails(songUrl);
        if (!songDetails) {
            return res.status(404).json({ error: "Song details not found" });
        }

        // Send the full song details back
        return res.json({ success: true, song: { title, artist, ...songDetails } });

    } catch (error) {
        console.error("Error fetching song details:", error);
        return res.status(500).json({ error: "Failed to fetch song details" });
    }
});

module.exports = router;