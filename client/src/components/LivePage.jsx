/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react'
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import BedtimeIcon from '@mui/icons-material/Bedtime';
import LightModeIcon from '@mui/icons-material/LightMode';

import socket from '../socket';

export default function LivePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedSong, setSelectedSong] = useState(location.state?.song || null);
    const [userData, setUserData] = useState(null);
    const [isScrolling, setIsScrolling] = useState(false);

    const [darkMode, setDarkMode] = useState(false); 

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };


    useEffect(() => {
        let scrollInterval;

        if (isScrolling) {
            scrollInterval = setInterval(() => {
                window.scrollBy({ top: 1, behavior: "smooth" });
            }, 100);
        } else {
            clearInterval(scrollInterval);
        }

        return () => clearInterval(scrollInterval);
    }, [isScrolling]);



    useEffect(() => {
        socket.emit("get_user_data");

        const handleUserData = (data) => {
            setUserData(data);
        };

        socket.on("user_data", handleUserData);
        socket.on("song_selected", (newSong) => {
            setSelectedSong(newSong);
        });

        const handleSessionQuit = () => {
            if (userData === "admin") {
                navigate("/main-admin");
            } else {
                navigate("/main");
            }
        };

        socket.on("live_session_quit", handleSessionQuit);

        return () => {
            socket.off("user_data", handleUserData);
            socket.off("song_selected");
            socket.off("live_session_quit", handleSessionQuit);
        };
    }, [userData]);


    const handleQuit = () => {
        if (userData === "admin") {
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
        <Card
            sx={{
                width: "90%",
                backgroundColor: darkMode ? "#213547" : "#F5F5F5", 
                color: darkMode ? "#ffffff" : "#000000", 
                maxWidth: 600,
                margin: "auto",
                mt: 3,
                p: 2,
                borderRadius: "12px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
            }}
        >
            <CardContent sx={{ flexGrow: 1, position: "relative" }}>
    
                {/* Control Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
    
                    {/* Left side: Play/Pause & Theme Toggle */}
                    <div style={{ display: "flex", gap: "10px" }}>
                        {/* Play/Pause Button */}
                        <IconButton
                            onClick={() => setIsScrolling(!isScrolling)}
                            sx={{
                                color: darkMode ? "#FFFFFF" : "#213547",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px"
                            }}
                        >
                            {isScrolling ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
                        </IconButton>
    
                        {/* Theme Toggle Button */}
                        <IconButton
                            onClick={toggleTheme}
                            sx={{
                                color: darkMode ? "#FFFFFF" : "#000000",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px"
                            }}
                        >
                            {darkMode ? <LightModeIcon fontSize="medium" /> : <BedtimeIcon fontSize="medium" />}
                        </IconButton>
                    </div>
    
                    {/* Right side: Quit Button */}
                    {userData === "admin" && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleQuit}
                            sx={{ borderRadius: "8px", minWidth: "50px" }}
                        >
                            Quit
                        </Button>
                    )}
                </div>
    
                {/* Song Title & Artist */}
                <Typography variant="h4" align="center" fontWeight="bold">
                    {selectedSong.title}
                </Typography>
                <Typography variant="h5" align="center" color={darkMode ? "#FFFFFF" : "black"} mb={2}>
                    {selectedSong.artist}
                </Typography>
    
                {/* Lyrics / Chords Section */}
                <div style={{ overflowY: "auto", flexGrow: 1 }}>
                    {userData?.instrument?.toLowerCase() === "vocals" ? (
                        <>
                            <Typography
                                variant="body1"
                                sx={{
                                    whiteSpace: "pre-wrap",
                                    lineHeight: 1.8,
                                    fontSize: "1rem"
                                }}
                            >
                                {selectedSong.lyrics}
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Typography
                                variant="body1"
                                sx={{
                                    whiteSpace: "pre-wrap",
                                    color: darkMode ? "#FFFFFF" : "black",
                                    lineHeight: 2,
                                    fontSize: "1.2rem",
                                    fontWeight: "20%"
                                }}
                            >
                                {selectedSong.chords_with_lyrics}
                            </Typography>
                        </>
                    )}
                </div>
    
            </CardContent>
        </Card>
    );
}