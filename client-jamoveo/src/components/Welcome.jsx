import React from 'react'
import Button from "@mui/material/Button";
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
    const navigate = useNavigate();

    return (
        <div>
            <h2>Welcome to JaMoveo!</h2>
            <h3>Click to sign in the rehearsal as:</h3>
            <Button onClick={() => navigate("/login")}>User</Button>
            <Button onClick={() => navigate("/admin-login")}>Admin</Button>
        </div>
    )
}
