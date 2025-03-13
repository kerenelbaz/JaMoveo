import { useState } from "react";
import { TextField, Button, Snackbar, Alert, Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
export default function Register({ setIsLogged, setUserLogged }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        instrument: "",
    });

    const [openSnackbar, setOpenSnackbar] = useState({
        success: false,
        error: false,
    });

    const instruments = ["Drums", "Guitar", "Bass", "Saxophone", "Keyboards", "Vocals"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleInstrumentChange = (event, newInstrument) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            instrument: newInstrument,
        }));
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === "clickaway") return;
        setOpenSnackbar({ success: false, error: false });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post("http://localhost:3001/users/sign-up", formData);
            if (response.status === 200) {
                setOpenSnackbar({ success: true, error: false });
                setIsLogged(true)
                setUserLogged(formData);
                navigate("/main");
            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {

            setOpenSnackbar({ success: false, error: true });
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <Card sx={{ width: "90%", maxWidth: 400, p: 3, borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)" }}>
                <CardContent sx={{ position: "relative" }}>
                    <Box display="flex" justifyContent="center" mb={1}>
                        <IconButton onClick={() => navigate("/")} sx={{ position: "absolute", top: 25, left: 10 }}>
                            <ArrowBackIosIcon />
                        </IconButton>
                    </Box>
                    <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
                        Sign Up
                    </Typography>
                    <form onSubmit={handleSubmit}>

                        <TextField
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            fullWidth
                            style={{ marginBottom: '10px' }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            fullWidth
                            style={{ marginBottom: '10px' }}
                            sx={{ mb: 2 }}
                        />
                        <div>
                            <Autocomplete
                                options={instruments}
                                sx={{ mb: 2 }}
                                getOptionLabel={(option) => option}
                                onChange={handleInstrumentChange}
                                renderInput={(params) => (
                                    <TextField {...params} label="Instrument" fullWidth />
                                )}
                            />
                        </div>
                        <Button type="submit" variant="contained" fullWidth sx={{ borderRadius: "8px", fontSize: "1rem" }}>
                            Register
                        </Button>
                    </form>

                    <Typography align="center" mt={2}>
                        Already have an account? <br />
                        <Link to="/login" style={{ textDecoration: "none", fontWeight: "bold", color: "#1976D2" }}>
                            Click here to login
                        </Link>
                    </Typography>
                </CardContent>
            </Card>

            <Snackbar open={openSnackbar.success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
                    Registration Successful!
                </Alert>
            </Snackbar>

            <Snackbar open={openSnackbar.error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: "100%" }}>
                    Registration Failed!
                </Alert>
            </Snackbar>
        </Box>
    );
}
