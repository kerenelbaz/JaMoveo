/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import socket from '../socket';
import '../styleByMe.css';

export default function MainPage() {
    const navigate = useNavigate();

    useEffect(() => {
        socket.on("song_selected", (song) => {
            navigate("/live", { state: { song } });
        });
        return () => {
            socket.off("song_selected")
        }
    }, []);
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}
        >
            <Typography variant="h6" gutterBottom>
                Waiting for the admin to choose a song...
            </Typography>
            {/* <CircularProgress /> */}
            <div className="spinner"></div>
        </Box>
    );
}