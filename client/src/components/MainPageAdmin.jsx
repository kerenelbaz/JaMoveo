import React from 'react'
import { useState, useEffect } from 'react';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export default function MainPageAdmin() {
    // const [songFoundDetails, setSongFoundDetails] = useState("");
    const [searchText, setSearchText] = useState("");
    // eslint-disable-next-line no-unused-vars
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
        if (!searchText.trim()) return; // Don't search if empty input

        try {
            const response = await axios.get(`http://localhost:3001/songs/search/${searchText}`);
            const { success, songs } = response.data;

            if (success && songs.length > 0) {
                console.log(songs)
                // Navigate to results page with song options
                navigate("/result", { state: { songs: songs } });
            } else {
                console.error("No songs found.");
            }
        } catch (error) {
            console.error("Error fetching songs:", error);
        }
    };

    return (
        <div>
            <h3>Search for a song:</h3>
            <TextField
                id="text"
                label="Search a song"
                value={searchText}
                variant="outlined"
                onChange={(e) => setSearchText(e.target.value)}
            />
            <Button variant="outlined" onClick={handleSearch}>
                Search
            </Button>
        </div>

    )
}
