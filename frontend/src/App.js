import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";

import { Spinner } from "reactstrap";

import Api from "./api/api";
import jwt from "jsonwebtoken";
import UserContext from "./UserContext";

import NavBar from "MyComponents/navbar/Navbar";
import Routes from "routes/Routes";
import useLocalStorage from "./hooks/useLocalStorage";
import { io } from "socket.io-client";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [infoLoaded, setInfoLoaded] = useState(false);
  const [token, setToken] = useState(Api.token);
  const [localStorageToken, setLocalStorageToken] = useLocalStorage("token");
  const [friendsUsernames, setFriendsUsernames] = useState([]);
  const [currentUserProfileImage, setCurrentUserProfileImage] = useState(null);
  const [currentUserCoverPic, setCurrentUserCoverPic] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    setSocket(io("ws://localhost:8900"));
  }, []);

  useEffect(() => {
    socket && socket.emit("addUser", currentUser?.username);
    console.log(socket);
  }, [currentUser]);

  useEffect(() => {
    console.debug("App useEffect loadUserInfo", "token=", token);
    const getCurrentUser = async () => {
      if (token) {
        try {
          const { username } = jwt.decode(token);
          Api.token = token;
          setLocalStorageToken(token);
          let currentUser = await Api.getCurrentUser(username);
          setCurrentUser(currentUser);
          setFriendsUsernames(
            currentUser.friends.map((u) =>
              u.user_from === currentUser.username ? u.user_to : u.user_from
            )
          );
          setCurrentUserProfileImage(currentUser?.profileImage);
          setCurrentUserCoverPic(currentUser?.coverPicture);
        }
        catch (e) {
          console.error("App loadUserInfo: problem loading", e);
          setCurrentUser(null);
        }
      }
      setInfoLoaded(true);
    };

    setInfoLoaded(false);
    getCurrentUser();
  }, [token]);

  useEffect(() => {
    socket && socket.on("addUser", currentUser?.username);
  }, [currentUser]);

  const signup = async (signUpData) => {
    try {
      const token = await Api.register(signUpData);
      setToken(token);
      return { success: true };
    } catch (errors) {
      console.error("signup failed", errors);
      return { success: false, errors };
    }
  };

  const login = async (loginData) => {
    try {
      const token = await Api.login(loginData);
      setToken(token);
      return { success: true };
    } catch (errors) {
      console.error("login failed", errors);
      return { success: false, errors };
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setLocalStorageToken("token", null);
  };

  const addEvent = async (username, event) => {
    try {
      const event = await Api.createCalendarEvent(username, event);
      setCurrentUser((user) => {
        return {
          ...user,
          events: [...user.events, event],
        };
      });
    } catch (e) {
      console.error(e);
      return { success: false, e };
    }
  };

  if (!infoLoaded) return <Spinner className="text-primary" />;
  return (
    <Router>
      <UserContext.Provider
        value={{
          currentUser,
          setCurrentUser,
          friendsUsernames,
          setFriendsUsernames,
          currentUserProfileImage,
          setCurrentUserProfileImage,
          currentUserCoverPic,
          setCurrentUserCoverPic,
          socket,
        }}
      >
        <div>
          <NavBar logout={logout} socket={socket} />
          <Routes
            login={login}
            signup={signup}
            events={currentUser?.events}
            addEvent={addEvent}
          />
        </div>
      </UserContext.Provider>
    </Router>
  );
}

export default App;
