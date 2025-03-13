import { useState } from "react";
import { TextField, Button, Snackbar, Alert, Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import axios from "axios";

export default function Login({ setIsLogged, setUserLogged }) {
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
            const response = await axios.post("https://jamoveo-production-6dff.up.railway.app/users/login", formData);
            if (response.status === 200) {
                setIsLogged(true);
                setUserLogged(response.data.user);
                navigate("/main");
            }
        } catch (error) {
            console.error("Login error:", error);
            setLoginFailed(true);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <Card sx={{ width: "90%", maxWidth: 400, p: 3, borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)" }}>
                <CardContent sx={{ position: "relative" }}>

                    <Box display="flex" justifyContent="center" mb={1}>
                        <IconButton onClick={() => navigate("/")} sx={{ position: "absolute", top: 20, left: 10 }}>
                            <ArrowBackIosIcon />
                        </IconButton>
                    </Box>

                    <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
                        Login
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            fullWidth
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
                            sx={{ mb: 3 }}
                        />

                        <Button type="submit" variant="contained" fullWidth sx={{ borderRadius: "8px", fontSize: "1rem" }}>
                            Login
                        </Button>
                    </form>
                    <Typography align="center" mt={2}>
                        Don't have an account yet? <br />
                        <Link to="/register" style={{ textDecoration: "none", fontWeight: "bold", color: "#1976D2" }}>
                            Click here to sign up
                        </Link>
                    </Typography>
                </CardContent>
            </Card>

            <Snackbar open={loginFailed} autoHideDuration={6000} onClose={() => setLoginFailed(false)}>
                <Alert severity="error">Incorrect username or password</Alert>
            </Snackbar>
        </Box>
    );
}