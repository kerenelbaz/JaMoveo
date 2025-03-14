const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const DATA_FOLDER = path.join(__dirname, "data");

// Ensure data folder exists
if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER, { recursive: true });
}

/**
 * Delays the execution for a specified amount of milliseconds.
 * @param {number} ms - The delay duration in milliseconds.
 * @returns {Promise<void>}
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Searches for songs on the Tab4U website based on a given song name.
 * It retrieves up to a maximum of 60 search results by navigating through multiple pages.
 * @param {string} songName - The name of the song to search for.
 * @returns {Promise<Array<{title: string, artist: string, link: string}>>} - An array of song objects.
 */
async function searchSongs(songName) {
    await delay(5000);
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        const searchUrl = `https://www.tab4u.com/resultsSimple?tab=songs&q=${encodeURIComponent(songName)}`;

        await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 });

        let allSongs = [];
        let pageNum = 1;
        const MAX_RESULTS = 60;

        // Continue fetching results until the limit is reached
        while (allSongs.length < MAX_RESULTS) {
            await page.waitForSelector("div.pageWrapMic", { timeout: 20000 });

            const songs = await page.evaluate(() => {
                return Array.from(document.querySelectorAll("div.pageWrapMic a.ruSongLink.songLinkT"))
                    .map(link => {
                        let title = link.querySelector(".sNameI19")?.innerText.trim();
                        let artist = link.querySelector(".aNameI19")?.innerText.trim();
                        let href = link.getAttribute("href");

                        if (title) {
                            title = title.replace(/^\/|\/$/g, "").trim();
                            title = title.replace(/\s+/g, " ");
                        }

                        return href ? {
                            title: title || "Unknown",
                            artist: artist || "Unknown",
                            link: `https://www.tab4u.com/${href}`
                        } : null;
                    })
                    .filter(song => song !== null);
            });

            const remainingSlots = MAX_RESULTS - allSongs.length;
            allSongs.push(...songs.slice(0, remainingSlots));

            if (allSongs.length >= MAX_RESULTS) {
                console.log(`Reached limit of ${MAX_RESULTS} songs.`);
                break;
            }

            const nextPageButton = await page.$("a.nextPre.h");
            if (!nextPageButton) { // No more pages
                break;
            }

            await Promise.all([
                nextPageButton.click(),
                page.waitForNavigation({ waitUntil: "networkidle2" })
            ]);

            pageNum++;
        }
        await browser.close();
        return allSongs;

    } catch (error) {
        console.error("ERROR in searchSongs:", error.message);
        return [];

    } finally {
        await browser.close();
    }
}

/**
 * Fetches detailed song information (lyrics and chords) from a given song URL.
 * @param {string} songUrl - The URL of the song to fetch details from.
 * @returns {
 * Promise<{lyrics: string, chords_with_lyrics: string} || null>} - An object containing lyrics and chords, or null if an error occurs.
 */
async function fetchSongDetails(songUrl) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        await page.goto(songUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

        await page.waitForSelector("#songContentTPL", { timeout: 60000 });

        const songDetails = await page.evaluate(() => {
            const rows = document.querySelectorAll("#songContentTPL tr");

            let lyricsArray = [];
            let combinedArray = [];

            rows.forEach(row => {
                const chordTd = row.querySelector("td.chords");
                const lyricTd = row.querySelector("td.song");

                const chordText = chordTd ? chordTd.innerText.trim() : "";
                const lyricText = lyricTd ? lyricTd.innerText.trim() : "";

                if (lyricText) {
                    lyricsArray.push(lyricText);
                }

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
        console.error("Error fetching song details:", error.message);
        await browser.close();
        return null;
    }
}

module.exports = { searchSongs, fetchSongDetails };