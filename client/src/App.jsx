// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import socket from './socket'
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import './components/Register'
import Register from './components/Register'
import Login from './components/Login'
import MainPage from './components/MainPage'
import MainPageAdmin from './components/MainPageAdmin'
import AdminLogin from './components/AdminLogin'
import Welcome from './components/welcome'

function App() {
  // const [count, setCount] = useState(0)
  const [islogged, setIsLogged] = useState(false);
  const [usernameLogged, setUsernameLogged] = useState("");

  useEffect(() => {
    if (!islogged || !usernameLogged) {
      console.log("⚠️ User is not logged in. Skipping socket connection.");
      return;
    }
    console.log("🔵 Emitting user_connected:", usernameLogged);
    socket.connect();
    socket.emit("user_connected", usernameLogged);
    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });
    return () => {
      console.log("ℹ️ Cleaning up socket connection...");
      if (!islogged) {
        socket.disconnect();
      }
    };
  }, [islogged, usernameLogged]);


  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Welcome />} />
          <Route path="/login" element={<Login setIsLogged={setIsLogged} setUsernameLogged={setUsernameLogged} />} />

          <Route path='/admin-login' element={<AdminLogin setIsLogged={setIsLogged} setUsernameLogged={setUsernameLogged} />} />

          <Route path="/register" element={<Register setIsLogged={setIsLogged} />} />

          <Route path="/main" element={islogged ? <MainPage /> : <Navigate to="/login" />} />

          <Route path="/main-admin" element={islogged ? <MainPageAdmin /> : <Navigate to="/admin-login" />} />
        </Routes>
      </Router>
      {/* <div>
        <h1>Socket.IO cilent</h1>
      </div>
      <Register /> */}
    </>
  )
}

export default App
