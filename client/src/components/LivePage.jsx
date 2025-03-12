import React from 'react'
import { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import socket from '../socket';

export default function LivePage() {
    const location = useLocation();
    const selectedSong = location.state?.song;
    const [userData, setUserData] = useState(null);
    // const userInstrument = location.state?.instrument;

    useEffect(() => {
        socket.emit("get_user_data");
        socket.on("user_data", (data) => {
            setUserData(data)
        })
        return () => {
            socket.off("user_data")
        }
    }, []);

    if (!selectedSong || !userData) {
        return <h3>No song selected.</h3>;
    }
    console.log("selected song",selectedSong)
    console.log("s",userData)

    return (
        <div>ssss
            <h2>{selectedSong.songName}</h2>

            {userData && userData.instrument?.toLowerCase() === "vocals" ? (
                <>
                    <h3>Lyrics:</h3>
                    <p>{selectedSong.lyrics}</p>
                </>
            ) : (
                <>
                    <h3>Chords:</h3>
                    <p>{selectedSong.chords}</p>
                </>
            )}
        </div>
    )
}
