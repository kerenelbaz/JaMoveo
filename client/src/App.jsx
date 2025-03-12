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
import Result from './components/Result'
import LivePage from './components/LivePage'

function App() {
  // const [count, setCount] = useState(0)
  const [islogged, setIsLogged] = useState(false);
  const [userLogged, setUserLogged] = useState(null);

  // const usernameLogged = userLogged?.username;
  // const userInstrument = userLogged?.instrument;

  useEffect(() => {
    if (!islogged || !userLogged) {
      console.log("⚠️ User is not logged in. Skipping socket connection.");
      return;
    }
    console.log("🔵 Emitting user_connected:", userLogged);
    socket.connect();
    socket.emit("user_connected", userLogged);
    //socket.emit("user_connected", { username: usernameLogged, instrument: userInstrument });
    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });
    return () => {
      console.log("ℹ️ Cleaning up socket connection...");
      if (!islogged) {
        socket.disconnect();
      }
    };
  }, [islogged, userLogged]);


  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Welcome />} />
          <Route path="/login" element={<Login setIsLogged={setIsLogged} setUserLogged={setUserLogged} />} />

          <Route path='/admin-login' element={<AdminLogin setIsLogged={setIsLogged} setUserLogged={setUserLogged} />} />

          <Route path="/register" element={<Register setIsLogged={setIsLogged} setUserLogged={setUserLogged} />} />

          <Route path="/main" element={islogged ? <MainPage /> : <Navigate to="/login" />} />

          <Route path="/main-admin" element={islogged ? <MainPageAdmin /> : <Navigate to="/admin-login" />} />

          <Route path="/result" element={<Result />} />

          <Route path="/live" element={<LivePage />} />

        </Routes>
      </Router>
    </>
  )
}

export default App
