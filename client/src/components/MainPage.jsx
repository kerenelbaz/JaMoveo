import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function MainPage() {
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
            <CircularProgress />
        </Box>
    );
}