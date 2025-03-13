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

// 🟢 API: Get song search results
router.get("/search/:songName", async (req, res) => {
    const songName = req.params.songName;
    if (!songName) {
        return res.status(400).json({ error: "Missing song name" });
    }

    try {
        console.log(`Searching for song: ${songName}`);
        const songs = await searchSongs(songName);

        if (songs.length === 0) {
            return res.status(404).json({ error: "No songs found" });
        }

        res.json({ success: true, songs });
    } catch (error) {
        console.error("Scraping failed:", error);
        res.status(500).json({ success: false, error: "Failed to fetch search results" });
    }
});

// 🟢 API: Fetch song details by URL and save JSON
router.post("/fetch-song", async (req, res) => {
    const { songUrl, title, artist } = req.body;

    if (!songUrl || !title || !artist) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    try {
        console.log(`Fetching details for: ${title} - ${artist}`);
        const songDetails = await fetchSongDetails(songUrl);

        if (!songDetails) {
            return res.status(404).json({ error: "Failed to fetch song details" });
        }

        const songData = { title, artist, ...songDetails };

        // Save to JSON
        fs.writeFileSync(FILE_PATH, JSON.stringify(songData, null, 2));
        console.log(`✅ File saved: ${FILE_PATH}`);

        res.json({ success: true, song: songData });
    } catch (error) {
        console.error("Error fetching song:", error);
        res.status(500).json({ success: false, error: "Failed to fetch song details" });
    }
});

module.exports = router;