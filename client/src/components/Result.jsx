import React from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import socket from '../socket';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { motion } from "framer-motion";
import { CardActionArea } from '@mui/material';
import axios from 'axios';

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation(); //allows to get the item of the one we sent with nevigate
  const songs = location.state?.songs || []; //found songs from admin-main page

  console.log("Songs received:", songs); // Debugging log

  // const handleSelectSong = (song) => {
  //   console.log("song is: ", song)

  //   // send the song to the server througt the socket
  //   console.log("select the song: ",song)
  //   socket.emit("admin_selected_song", song);

  //   navigate("/live" , {state:{song}});   

  // };
  const handleSelectSong = async (song) => {
    try {
      const response = await axios.post("http://localhost:3001/songs/select", {
        songUrl: song.link,
        title: song.title,
        artist: song.artist
      });

      if (response.data.success) {
        const fullSongDetails = response.data.song;
        console.log("Full song details received:", fullSongDetails);

        // Navigate to Live page with full song details
        navigate("/live", { state: { song: fullSongDetails } });
      } else {
        console.error("Failed to fetch song details.");
      }
    } catch (error) {
      console.error("Error fetching song details:", error);
    }
  };

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Search Results
      </Typography>

      {songs.length > 0 ? (
        <Grid container spacing={3} justifyContent="center">
          {songs.map((song, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Card
                  sx={{
                    maxWidth: 350,
                    margin: "auto",
                    borderRadius: "15px",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <CardActionArea onClick={() => handleSelectSong(song)}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        color="primary"
                        sx={{ fontWeight: "bold", fontSize: "1.2rem" }}
                      >
                        {song.title}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        color="textSecondary"
                        sx={{ fontSize: "1rem", marginTop: "5px" }}
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

      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: "20px", borderRadius: "8px", fontSize: "1rem" }}
        onClick={() => navigate('/main-admin')}
      >
        Back to Search
      </Button>
    </div>
  );
}