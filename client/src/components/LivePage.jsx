import React from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";

export default function LivePage() {
    const location = useLocation();
    const selectedSong = location.state?.song;

    if (!selectedSong) {
        //return <h3>No song selected.</h3>;
        console.log(selectedSong);
        return <h3>No song selected.</h3>;
    }

    return (
        <div>
            <h2>{selectedSong.songName}</h2>
            <h3>Lyrics:</h3>
            <p>{selectedSong.lyrics}</p>
            <h3>Chords:</h3>
            <p>{selectedSong.chords}</p>
        </div>
    )
}
