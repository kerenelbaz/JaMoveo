import React from 'react'
import { useState, useEffect } from 'react';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

export default function MainPageAdmin() {
    // const [songFoundDetails, setSongFoundDetails] = useState("");
    const [searchText, setSearchText] = useState("");
    const [songs, setSongs] = useState([]);

    const navigate = useNavigate();

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

    // const handleSearch = async () => {

    //     if (!searchText.trim()) return //checks if the text is empty

    //     const foundSongs = songs.filter(song => song.lyrics.includes(searchText.toLocaleLowerCase()));
    //     if (foundSongs.length > 0) {
    //         // setSongFoundDetails(foundSongs);
    //         navigate("/result", {state:{foundSongs}});

    //     } else {
    //         // setSongFoundDetails(null) //didnt find a song match to the text
    //         navigate("/result", { state: { foundSongs: [] } });
    //     }
    // }
    const handleSearch = async () => {
        try {
            const response = await fetch(`http://localhost:3001/songs/scrape-song/${searchText}`);
            const data = await response.json();

            if (data.success) {
                navigate("/live", { state: { song: data.song } });
            } else {
                console.error("Song not found");
            }
        } catch (error) {
            console.error("Error fetching song:", error);
        }
    };

    return (
        <div>MainPageAdmin

            <h3>Search for a song:</h3>

            <TextField id="text" label="Search a song" value={searchText} variant="outlined" onChange={(e) => setSearchText(e.target.value)} />

            <Button variant="outlined" onClick={handleSearch}>Search</Button>

        </div>

    )
}
