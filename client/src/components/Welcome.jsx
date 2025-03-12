import React from 'react'
import Button from "@mui/material/Button";
import { Link, Navigate, useNavigate } from 'react-router-dom';

export default function Welcome() {
    const navigate = useNavigate();

    return (
        <div>
            <h3>Welcome! Click to sign in as:</h3>

            <Button onClick={() => navigate("/login")}>User</Button>
            <Button onClick={() => navigate("/admin-login")}>Admin</Button>
        </div>
    )
}
