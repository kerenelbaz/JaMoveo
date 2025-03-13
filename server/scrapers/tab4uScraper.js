const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const DATA_FOLDER = path.join(__dirname, "data");

if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER, { recursive: true });
}

async function searchSongs(songName) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const searchUrl = `https://www.tab4u.com/resultsSimple?tab=songs&q=${encodeURIComponent(songName)}`;

    console.log(`Searching for songs: ${songName}`);
    await page.goto(searchUrl, { waitUntil: "networkidle2" });

    let allSongs = [];
    let pageNum = 1;

    while (true) {
        console.log(`Extracting results from page ${pageNum}...`);

        // Wait for results
        await page.waitForSelector("div.pageWrapMic", { timeout: 20000 });

        // Extract song results from current page
        const songs = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("div.pageWrapMic a.ruSongLink.songLinkT"))
                .map(link => {
                    let title = link.querySelector(".sNameI19")?.innerText.trim();
                    let artist = link.querySelector(".aNameI19")?.innerText.trim();
                    let href = link.getAttribute("href");

                    if (title) {
                        title = title.replace(/^\/|\/$/g, "").trim(); // Remove `/` at start or end
                        title = title.replace(/\s+/g, " "); // Replace multiple spaces with a single space
                    }
        
                    return href ? {
                        title: title || "Unknown",
                        artist: artist || "Unknown",
                        link: `https://www.tab4u.com/${href}`
                    } : null;
                })
                .filter(song => song !== null);
        });

        allSongs.push(...songs);

        // Check if there's a "Next Page" button
        const nextPageButton = await page.$("a.nextPre.h");
        if (!nextPageButton) {
            console.log("No more pages.");
            break;
        }

        // Click "Next Page" and wait for navigation
        await Promise.all([
            nextPageButton.click(),
            page.waitForNavigation({ waitUntil: "networkidle2" })
        ]);

        pageNum++;
    }

    await browser.close();
    console.log(`Total results found: ${allSongs.length}`);
    return allSongs;
}

async function fetchSongDetails(songUrl) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(songUrl, { waitUntil: "networkidle2" });

    try {
        await page.waitForSelector("#songContentTPL", { timeout: 20000 });

        const songDetails = await page.evaluate(() => {
            const rows = document.querySelectorAll("#songContentTPL tr");

            let lyricsArray = [];
            let combinedArray = [];

            rows.forEach(row => {
                const chordTd = row.querySelector("td.chords");
                const lyricTd = row.querySelector("td.song");

                const chordText = chordTd ? chordTd.innerText.trim() : "";
                const lyricText = lyricTd ? lyricTd.innerText.trim() : "";

                // Store separate lyrics for singer-only display
                if (lyricText) {
                    lyricsArray.push(lyricText);
                }

                // Combine chords and lyrics in a readable format
                if (chordText || lyricText) {
                    combinedArray.push(`${chordText} ${lyricText}`.trim());
                }
            });

            return {
                lyrics: lyricsArray.join("\n") || "No lyrics found.",
                chords_with_lyrics: combinedArray.join("\n") || "No chords found."
            };
        });

        await browser.close();
        return songDetails;
    } catch (error) {
        await browser.close();
        console.error("Error fetching song details:", error.message);
        return null;
    }
}

module.exports = { searchSongs, fetchSongDetails };