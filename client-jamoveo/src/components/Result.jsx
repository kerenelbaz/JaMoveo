/* eslint-disable no-unused-vars */
import React from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Box, IconButton, Typography } from "@mui/material";
import socket from '../socket';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { motion } from "framer-motion";
import { CardActionArea } from '@mui/material';
import axios from 'axios';

/**
 * Result Component
 * Displays a list of songs fetched from the admin's search.
 * Admin selects a song, which is then sent to the server and all connected users via WebSocket.
 */
export default function Result() {
    const navigate = useNavigate();
    const location = useLocation();
    const songs = location.state?.songs || []; // List of songs received from MainPageAdmin

    const handleSelectSong = async (song) => {

        try {
            const response = await axios.post("https://jamoveo-production-6dff.up.railway.app/songs/fetch-song", {
                songUrl: song.link,
                title: song.title,
                artist: song.artist
            });

            if (response.data.success) {
                const fullSongDetails = response.data.song;

                // Notify all users about the selected song via WebSocket
                socket.emit("admin_selected_song", song);
                navigate("/live", { state: { song: fullSongDetails } });
            } else {
                console.error("Failed to fetch song details.");
            }
        } catch (error) {
            console.error("Error fetching song details:", error);
        }
    };

    return (
        <div style={{ padding: "20px" }}>

            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>

                <IconButton
                    onClick={() => navigate('/main-admin')}
                    sx={{

                        color: "black",  // Icon color
                        backgroundColor: "transparent", // No background
                        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.05)" } // Light hover effect
                    }}
                >
                    <ArrowBackIosIcon />
                </IconButton>

                <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1, textAlign: "center" }}>
                    Pick a song
                </Typography>

            </Box>

            {/* Song List */}
            {songs.length > 0 ? (
                <Grid container spacing={2} justifyContent="center" marginTop="0.5rem">
                    {songs.map((song, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Card
                                    sx={{
                                        width: "100%",
                                        maxWidth: 240,
                                        margin: "auto",
                                        borderRadius: "12px",
                                        boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.15)",
                                    }}
                                >
                                    <CardActionArea onClick={() => handleSelectSong(song)}>
                                        <CardContent>
                                            <Typography
                                                variant="h6"
                                                color="primary"
                                                sx={{ fontWeight: "bold", fontSize: "1rem" }}
                                            >
                                                {song.title}
                                            </Typography>
                                            <Typography
                                                variant="subtitle2"
                                                color="textSecondary"
                                                sx={{ fontSize: "0.8rem", marginTop: "5px" }}
                                            >
                                                {song.artist}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography>No songs found.</Typography>
            )}
        </div>
    );
}