import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import axios from "axios";

export default function AdminLogin({ setIsLogged, setUserLogged }) {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loginFailed, setLoginFailed] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post("http://localhost:3001/users/login", formData);
            if (response.status === 200 && formData.username === 'admin') {
                setIsLogged(true);
                setUserLogged(formData.username);
                navigate("/main-admin");
            }
        } catch (error) {
            console.error("Login error:", error);
            setLoginFailed(true);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <Card sx={{ width: "90%", maxWidth: 400, padding: 3, boxShadow: 3, borderRadius: 3 }}>
                <CardContent sx={{ position: "relative" }}> 

                    <IconButton onClick={() => navigate("/")} sx={{ position: "absolute", top: 10, left: 10 }}>
                        <ArrowBackIosIcon />
                    </IconButton>

                    <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
                        Admin Login
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            fullWidth
                            sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            fullWidth
                            sx={{ marginBottom: 2 }}
                        />
                        <Button type="submit" variant="contained" fullWidth>
                            Login
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {loginFailed && (
                <Snackbar open={loginFailed} autoHideDuration={6000} onClose={() => setLoginFailed(false)}>
                    <Alert severity="error">Incorrect username or password</Alert>
                </Snackbar>
            )}
        </Box>
    );
}