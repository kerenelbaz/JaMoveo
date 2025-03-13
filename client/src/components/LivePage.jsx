import React from 'react'
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import socket from '../socket';

export default function LivePage() {
    const location = useLocation();
    const navigate = useNavigate();
    //const selectedSong = location.state?.song;
    const [selectedSong, setSelectedSong] = useState(location.state?.song || null);

    const [userData, setUserData] = useState(null);
    const [isScrolling, setIsScrolling] = useState(false);


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
            // console.log("🔹 User data received:", data);
        };
    
        socket.on("user_data", handleUserData);
    
        socket.on("song_selected", (newSong) => {
            console.log("🎵 New song received:", newSong);
            setSelectedSong(newSong);
        });
    
        const handleSessionQuit = () => {
            // console.log("⚠️ Admin quit the session. Returning to main...");
            if (userData === "admin") {
                navigate("/main-admin");
            } else {
                navigate("/main");
            }
        };
    
        socket.on("live_session_quit", handleSessionQuit);
    
        return () => {
            // console.log("ℹ️ Cleaning up event listeners...");
            socket.off("user_data", handleUserData);
            socket.off("song_selected");
            socket.off("live_session_quit", handleSessionQuit);
        };
    }, [userData]);

    
    const handleQuit = () => {
        // console.log("🚨 Admin clicked quit! Emitting 'quit_session' event...");

        if (userData === "admin") {
            // console.log("quit admin")
            socket.emit("quit_session");
            setSelectedSong(null)
        }
    };

    if (!selectedSong || !userData) {
        return (
            <Box textAlign="center" mt={5}>
                <Typography variant="h5" color="error">No song selected.</Typography>
                <Button variant="contained" color="primary" onClick={() => navigate("/main-admin")}>
                    Back to Search
                </Button>
            </Box>
        );
    }



    return (
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" mt={5}>
            <Card sx={{ width: "80%", maxWidth: 600, p: 2 }}>
                <CardContent>
                    <Typography variant="h4" align="center" fontWeight="bold">
                        {selectedSong.title}
                    </Typography>
                    <Typography variant="h6" align="center" color="textSecondary">
                        {selectedSong.artist}
                    </Typography>

                    <Box mt={3}>
                        {/* {console.log(selectedSong)} */}
                        {userData?.instrument?.toLowerCase() === "vocals" ? (
                            <>
                                <Typography variant="h6" fontWeight="bold">Lyrics:</Typography>
                                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                                    {selectedSong.lyrics}
                                </Typography>
                            </>
                        ) : (
                            <>
                                <Typography variant="h6" fontWeight="bold">Chords with Lyrics:</Typography>
                                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", color: "blue" }}>
                                    {selectedSong.chords_with_lyrics}
                                </Typography>
                            </>
                        )}
                    </Box>

                    <Box mt={3} textAlign="center">
                        <Button variant="contained" onClick={() => setIsScrolling(!isScrolling)}>
                            {isScrolling ? "Stop Scrolling" : "Start Scrolling"}
                        </Button>
                        {userData === "admin" && (
                            <Button variant="contained" color="error" onClick={handleQuit} sx={{ ml: 2 }}>
                                Quit
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}