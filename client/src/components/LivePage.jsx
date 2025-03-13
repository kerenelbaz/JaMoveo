import React from 'react'
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import socket from '../socket';

export default function LivePage() {
    const location = useLocation();
    const navigate = useNavigate();
    //const selectedSong = location.state?.song;
    const [selectedSong, setSelectedSong] = useState(location.state?.song || null);

    const [userData, setUserData] = useState(null);
    const [isScrolling, setIsScrolling] = useState(false);

    console.log("selected song is: ", selectedSong)

    useEffect(() => {
        let scrollInterval;

        if (isScrolling) {
            scrollInterval = setInterval(() => {
                window.scrollBy({ top: 1, behavior: "smooth" });
            }, 200);
        } else {
            clearInterval(scrollInterval);
        }

        return () => clearInterval(scrollInterval);
    }, [isScrolling]);

    useEffect(() => {
        socket.emit("get_user_data");

        const handleUserData = (data) => {
            setUserData(data);
            console.log("🔹 User data received:", data);
        }
        socket.on("user_data", handleUserData);
        socket.on("song_selected", (newSong) => {
            console.log("🎵 New song received:", newSong);
            setSelectedSong(newSong);
        });

        const handleSessionQuit = () => {
            console.log("⚠️ Admin quit the session. Returning to main...");
            if (userData === "admin") {
                navigate("/main-admin");
            } else {
                navigate("/main");
            }
        };

        socket.on("user_data", handleUserData);
        socket.on("live_session_quit", handleSessionQuit);


        return () => {
            console.log("ℹ️ Cleaning up event listeners...");
            socket.off("user_data", handleUserData);
            socket.off("song_selected");
            socket.off("live_session_quit", handleSessionQuit);
        };
    }, [userData]);

    const handleQuit = () => {
        console.log("🚨 Admin clicked quit! Emitting 'quit_session' event...");

        if (userData === "admin") {
            console.log("quit admin")
            socket.emit("quit_session");
            setSelectedSong(null)
        }
    };

    if (!selectedSong || !userData) {
        return <h3>No song selected.</h3>;
    }
    console.log(userData)

    return (
        <div>
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

            <p style={{ whiteSpace: "pre-wrap" }}>
                {selectedSong.lyrics}
            </p>
            {/* מוסיפה טקסט ריק כדי להאריך את הדף ולגרום לגלילה */}
            <div style={{ height: "100vh" }}></div>

            <Button
                variant="contained"
                onClick={() => setIsScrolling(!isScrolling)}
            >
                {isScrolling ? "Stop Scrolling" : "Start Scrolling"}
            </Button>

            {userData === "admin" && (
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleQuit}
                    style={{ marginLeft: "10px" }}
                >
                    Quit
                </Button>
            )}
        </div>
    )
}
