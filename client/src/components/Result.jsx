import React from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import socket from '../socket';

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation(); //allows to get the item of the one we sent with nevigate
  const foundSongs = location.state?.foundSongs || [];


  const handleSelectSong = (song) => {
    console.log("song is: ", song)
    // setSelectedSong(song);

    // send the song to the server througt the socket
    socket.emit("admin_selected_song", song);

    navigate("/live" , {state:{song}});   

  };

  return (
    <div>
        <h3>Search Results</h3>
        {foundSongs.length > 0 ? (
            <ul>
                {foundSongs.map((song, index) => (
                    <li key={index} onClick={()=>handleSelectSong(song)}
                    style={{cursor:'pointer', color:'blue'}}>
                        <strong>{song.songName}</strong> <br />
                        <em>Preview:</em> {song.lyrics.substring(0, 100)}...
                    </li>
                ))}
            </ul>
        ) : (
            <p>No songs found.</p>
        )}

        <Button variant="outlined" onClick={() => navigate('/main-admin')}>
            Back to Search
        </Button>
    </div>
);
}
