/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react'
import { useState, useEffect } from 'react';
import { Box, TextField, Button, CircularProgress, Typography, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';


export default function MainPageAdmin() {
    // const [songFoundDetails, setSongFoundDetails] = useState("");
    const [searchText, setSearchText] = useState("");
    // eslint-disable-next-line no-unused-vars
    const [songs, setSongs] = useState([]);

    const navigate = useNavigate();

    const songsData = import.meta.glob("../songs/*.json") //loading JSON file
    const [loading, setLoading] = useState(false)


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


    const handleSearch = async () => {
        if (!searchText.trim()) return; // Don't search if empty input
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3001/songs/search/${searchText}`);
            const { success, songs } = response.data;

            if (success && songs.length > 0) {
                navigate("/result", { state: { songs: songs } });
            } else {
                console.error("No songs found.");
            }
        } catch (error) {
            console.error("Error fetching songs:", error);
        }finally{
            setLoading(false);
        }
    };

    

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100vh"
            px={2} // Padding for responsiveness
        >
            <Box 
                display="flex"
                alignItems="center"
                width="90%"
                maxWidth={400}
            >
                <TextField
                    id="text"
                    label="Enter song name"
                    value={searchText}
                    variant="outlined"
                    onChange={(e) => setSearchText(e.target.value)}
                    sx={{ flex: 1, mr: 1 }} // חיפוש מתרחב עם רווח קטן לכפתור
                />
                <Button 
                    variant="contained" 
                    onClick={handleSearch} 
                    disabled={loading}
                    sx={{ minWidth: 50, height: "56px" }} // גודל אחיד לכפתור כמו השדה
                >
                    <SearchIcon />
                </Button>
            </Box>
    
            {/* יצירת מקום קבוע ל-Loading */}
            <Box height={40} mt={2} display="flex" justifyContent="center" alignItems="center">
                {loading && <CircularProgress />}
            </Box>
        </Box>
    );
}
