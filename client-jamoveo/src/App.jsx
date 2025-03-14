import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import socket from './socket'
import './App.css'

import Register from './components/Register'
import Login from './components/Login'
import MainPage from './components/MainPage'
import MainPageAdmin from './components/MainPageAdmin'
import AdminLogin from './components/AdminLogin'
import Welcome from './components/Welcome'
import Result from './components/Result'
import LivePage from './components/LivePage'

function App() {
  // State to track login status and the currently logged-in user
  const [islogged, setIsLogged] = useState(false);
  const [userLogged, setUserLogged] = useState(null);

  /**
   * useEffect hook to handle WebSocket connection.
   * Connects socket only if the user is logged in and emits user connection.
   */
  useEffect(() => {
    if (!islogged || !userLogged) {
      console.log("⚠️ User is not logged in. Skipping socket connection.");
      return;
    }
    socket.connect(); // Establish WebSocket connection
    socket.emit("user_connected", userLogged);
    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });
    return () => {
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
