import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import axios from "axios";

export default function Register() {
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
            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            setOpenSnackbar({ success: false, error: true });
        }
    };

    return (
        <div>
            <h3>Register</h3>
            <form onSubmit={handleSubmit}>

                <div>
                    <TextField
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                </div>
                <div>
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                </div>
                <div>
                    <Autocomplete
                        options={instruments}
                        getOptionLabel={(option) => option}
                        onChange={handleInstrumentChange}
                        renderInput={(params) => (
                            <TextField {...params} label="Instrument" required fullWidth />
                        )}
                    />
                </div>
                <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                    Register
                </Button>
            </form>

            {/* Snackbar for success */}
            <Snackbar open={openSnackbar.success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
                    Registration Successful! ✅
                </Alert>
            </Snackbar>

            {/* Snackbar for error */}
            <Snackbar open={openSnackbar.error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: "100%" }}>
                    Registration Failed! ❌
                </Alert>
            </Snackbar>
        </div>
    );
}
