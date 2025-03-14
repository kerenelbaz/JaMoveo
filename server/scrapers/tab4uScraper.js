const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const DATA_FOLDER = path.join(__dirname, "data");

if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER, { recursive: true });
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchSongs(songName) {
    await delay(5000);
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    try {
        const searchUrl = `https://www.tab4u.com/resultsSimple?tab=songs&q=${encodeURIComponent(songName)}`;
        console.log(`Searching for songs: ${songName}`);
        
        await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 });

        let allSongs = [];
        let pageNum = 1;

        while (true) {
            console.log(`Extracting results from page ${pageNum}...`);
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

            allSongs.push(...songs);

            const nextPageButton = await page.$("a.nextPre.h");
            if (!nextPageButton) {
                console.log("No more pages.");
                break;
            }

            await Promise.all([
                nextPageButton.click(),
                page.waitForNavigation({ waitUntil: "networkidle2" })
            ]);

            pageNum++;
        }

        console.log(`Total results found: ${allSongs.length}`);
        return allSongs;

    } catch (error) {
        console.error("❌ ERROR in searchSongs:", error.message);
        return [];

    } finally {
        await browser.close(); // **💡 סוגר את Puppeteer בכל מצב!**
    }
}

async function fetchSongDetails(songUrl) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        console.log(`🔍 Navigating to: ${songUrl}`);
        await page.goto(songUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

        console.log("⏳ Waiting for #songContentTPL...");
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

        console.log("✅ Song details extracted successfully.");
        await browser.close();
        return songDetails;
    } catch (error) {
        console.error("❌ Error fetching song details:", error.message);
        await browser.close();
        return null;
    }
}

module.exports = { searchSongs, fetchSongDetails };