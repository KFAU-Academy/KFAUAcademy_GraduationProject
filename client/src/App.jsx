import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import MyAnnouncements from "./pages/MyAnnouncement/MyAnnouncements";
import Favorites from "./pages/Favorites/Favorites";
import MyVideos from "./pages/MyVideos/MyVideos";
import MyNotes from "./pages/MyNotes/MyNotes";
import Videos from "./pages/Videos/Videos";
import Notes from "./pages/Notes/Notes";

import "./App.css";
import Layout from "./components/Layout/Layout";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ToastContainer } from "react-toastify";
import { UserProvider } from "../src/context/UserContext.jsx";

const App = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/myAnnouncements" element={<MyAnnouncements />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/myVideos" element={<MyVideos />} />
              <Route path="/myNotes" element={<MyNotes />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/" element={<Login />} />
            </Route>
          </Routes>
        </Router>
      </UserProvider>
      <ToastContainer />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
