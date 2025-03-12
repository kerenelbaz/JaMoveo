import React, { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import axios from "axios";
import { AlertTitle } from '@mui/material';


export default function Login({ setIsLogged, setUserLogged }) {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })

    const [loginFailed, setLoginFailed] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {

        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post("http://localhost:3001/users/login", formData);
            console.log("response",response.data)
            if (response.status === 200) {
                setIsLogged(true);
                setUserLogged(response.data.user)
                navigate("/main");
            }
        } catch (error) {
            console.error("Login error:", error);
            setLoginFailed(true);
        }
    };

    return (
        <div>Login

            <form>
                <div>
                    <div>
                        <TextField
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            fullWidth
                            style={{ marginBottom: '10px' }}
                        />
                    </div>
                    <div>
                        <TextField
                            label="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            fullWidth
                            style={{ marginBottom: '10px' }}
                        />
                    </div>
                    <Button type='submit' variant='contained' onClick={handleSubmit}>
                        Login</Button>
                </div>
            </form>
            <p>
                Don't have an account yet? <Link to="/register">Click here to sign-up</Link>
            </p>
            {loginFailed && (
                <Snackbar open={loginFailed} autoHideDuration={6000} onClose={() => setLoginFailed(false)}>
                    <Alert severity="error">Incorrect username or password</Alert>
                </Snackbar>
            )}
        </div>
    )
}
