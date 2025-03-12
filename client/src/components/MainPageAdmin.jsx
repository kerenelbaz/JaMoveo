import React from 'react'
import { useState, useEffect } from 'react';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";


export default function MainPageAdmin() {
    const [songFoundDetails, setSongFoundDetails] = useState("");
    const [searchText, setSearchText] = useState("");
    const [songs, setSongs] = useState([]);

    const songsData = import.meta.glob("../songs/*.json") //loading JSON file

    useEffect(() => {
        loadSongs();
    }, []);

    const loadSongs = async () => {
        const songs = [];

        for (let path in songsData) {
            const itemModule = await songsData[path]();
            const songName = path.split("/").pop().replace(".json", "");

            const { lyricsText, chordsText } = extractLyricsAndChords(itemModule);
            songs.push({
                songName, lyrics: lyricsText, chords: chordsText
            });
        }
        console.log(songs)
        setSongs(songs)
    }

    const extractLyricsAndChords = (songData) => {
        const lyricsText = songData.default
            .flat() //change the inner arrays into one array
            .map(word => word.lyrics)
            .join(" ")
            .toLowerCase();

        const chordsText = songData.default
            .flat()
            .map(word => word.chords || "-")
            .join(" ")
            .toLowerCase();

        return { lyricsText, chordsText }; // return tuple of both strings
    };

    const handleSearch = async () => {
        console.log("🔍 Searching for:", searchText);

        if (!searchText.trim()) return //checks if the text is empty

        const foundSongs = songs.filter(song => song.lyrics.includes(searchText.toLocaleLowerCase()));
        if (foundSongs.length > 0) {
            setSongFoundDetails(foundSongs);
        } else {
            setSongFoundDetails(null) //didnt find a song match to the text
        }
    }

    return (
        <div>MainPageAdmin

            <h3>Search for a song:</h3>

            <TextField id="text" label="Search a song" value={searchText} variant="outlined" onChange={(e) => setSearchText(e.target.value)} />

            <Button variant="outlined" onClick={handleSearch}>Search</Button>
            {songFoundDetails ? (
                songFoundDetails.length > 0 ? (
                    <div>
                        <h4>Results:</h4>
                        <ul>
                            {songFoundDetails.map((song, index) => (
                                <li key={index}>{song.songName}</li>
                            ))}
                        </ul>
                    </div>
                ) : null
            ) : (
                <p>No songs found.</p>
            )}
        </div>

    )
}
