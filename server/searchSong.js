const puppeteer = require('puppeteer');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function getAllResults(page) {
    let allSongs = [];
    let pageNumber = 1;

    while (true) {
        console.log(`Extracting results from page ${pageNumber}...`);
        await page.waitForSelector('div.pageWrapMic', { timeout: 20000 });

        const songs = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('div.pageWrapMic a.ruSongLink.songLinkT'))
                .map(link => {
                    const title = link.querySelector('.sNameI19')?.innerText.trim();
                    const artist = link.querySelector('.aNameI19')?.innerText.trim();
                    const href = link.getAttribute('href');

                    return href ? {
                        title: title || "Unknown",
                        artist: artist || "Unknown",
                        link: `https://www.tab4u.com/${href}`
                    } : null;
                })
                .filter(song => song !== null);
        });

        allSongs = [...allSongs, ...songs];

        const nextPage = await page.$('a.nextPre[href]');
        if (nextPage) {
            const nextPageUrl = await page.evaluate(el => el.href, nextPage);
            await page.goto(nextPageUrl, { waitUntil: 'networkidle2' });
            pageNumber++;
        } else {
            break;
        }
    }
    return allSongs;
}

async function searchSong(songName) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const searchUrl = `https://www.tab4u.com/resultsSimple?tab=songs&q=${encodeURIComponent(songName)}`;

    console.log(`Searching for songs: ${songName}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    try {
        const songs = await getAllResults(page);

        if (songs.length === 0) {
            console.log("No results found.");
            await browser.close();
            return;
        }

        console.log("\nResults found:\n");
        songs.forEach((song, index) => {
            console.log(`${index + 1}. ${song.title} - ${song.artist}`);
        });

        rl.question("\nEnter the number of the song to view details: ", async (number) => {
            const songIndex = parseInt(number) - 1;
            if (songIndex >= 0 && songIndex < songs.length) {
                console.log(`\nLoading song details: ${songs[songIndex].title} - ${songs[songIndex].artist}`);
                await fetchSongDetails(songs[songIndex], browser);
            } else {
                console.log("Invalid selection.");
                await browser.close();
                rl.close();
            }
        });

    } catch (error) {
        console.error("Error:", error.message);
        await browser.close();
        rl.close();
    }
}

async function fetchSongDetails(song, browser) {
    const page = await browser.newPage();
    await page.goto(song.link, { waitUntil: 'networkidle2' });

    try {
        await page.waitForSelector('#songContentTPL', { timeout: 20000 });

        const songDetails = await page.evaluate(() => {
            const rows = document.querySelectorAll('#songContentTPL tr');

            let lyrics = [];
            let chordsFormatted = [];

            rows.forEach(row => {
                const chordTd = row.querySelector('td.chords');
                const lyricTd = row.querySelector('td.song');

                let chordLine = chordTd ? chordTd.innerText.trim() : "";
                let lyricLine = lyricTd ? lyricTd.innerText.trim() : "";

                if (chordLine) chordsFormatted.push(chordLine);
                if (lyricLine) {
                    chordsFormatted.push(lyricLine);
                    lyrics.push(lyricLine);
                }
            });

            return {
                lyrics: lyrics.join('\n'),
                chordsWithLyrics: chordsFormatted.join('\n')
            };
        });

        const lyricsOnly = removeChords(songDetails.chordsWithLyrics);

        console.log(`\nSong: ${song.title}`);
        console.log(`Artist: ${song.artist}`);
        console.log("\nChords & Lyrics:\n" + songDetails.chordsWithLyrics);
        console.log("\nLyrics Only:\n" + lyricsOnly);

        const songData = {
            title: song.title,
            artist: song.artist,
            lyrics: lyricsOnly,
            chords_with_lyrics: songDetails.chordsWithLyrics
        };

        fs.writeFileSync('selected_song.json', JSON.stringify(songData, null, 2));
        console.log("JSON file saved: selected_song.json");

    } catch (error) {
        console.error("Error loading song details:", error.message);
    }

    await browser.close();
    searchNewSong();
}

// Function to remove chords from lyrics
function removeChords(text) {
    return text
        .split('\n')
        .filter(line => !/^[A-Ga-g#♯b♭0-9\s]*$/.test(line)) // Filters out lines that contain only chords
        .join('\n');
}

function searchNewSong() {
    rl.question("\nEnter a song name to search: ", (songName) => {
        searchSong(songName);
    });
}

searchNewSong();