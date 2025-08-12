import React from "react";
import "./Sidebar.css";
import { useNavigate } from "react-router-dom"; // Yönlendirme için import
import { MdAnnouncement } from "react-icons/md";
import { IoDocumentText } from "react-icons/io5";
import { FaVideo, FaHeart } from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate(); // useNavigate function for navigation

  // Navigation functions for each button
  const goToAnnouncements = () => navigate("/myAnnouncements");
  const goToVideos = () => navigate("/myVideos");
  const goToFavorites = () => navigate("/favorites");
  const goToNotes = () => navigate("/myNotes");

  return (
    <aside className="sidebar">
      <button className="sidebar-item" onClick={goToAnnouncements}>
        My Announcements
        <MdAnnouncement fill="#d06382" />
      </button>

      <button className="sidebar-item" onClick={goToVideos}>
        My Videos
        <FaVideo fill="#d06382" />
      </button>

      <button className="sidebar-item" onClick={goToNotes}>
        My Notes
        <IoDocumentText fill="#d06382" />
      </button>

      <button className="sidebar-item" onClick={goToFavorites}>
        Favorites
        <FaHeart fill="#d06382" />
      </button>
    </aside>
  );
};

export default Sidebar;
