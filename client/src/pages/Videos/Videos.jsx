import React, { useState, useEffect } from "react";
import "./Videos.css";
import Navbar from "../../components/Navbar/Navbar";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import useVideos from "../../hooks/useVideos";
import { PuffLoader } from "react-spinners";
import { AiFillHeart } from "react-icons/ai";
import { GiPlayButton } from "react-icons/gi";
import { truncate } from "lodash";
import axios from "axios";

const Videos = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [favVideos, setFavVideos] = useState([]);
  const { data, isError, isLoading } = useVideos();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserEmail = user.email || "";

  // Favori videoları çekme
  const fetchFavVideos = async () => {
    try {
      const res = await axios.post("/api/user/allVideoFavs", {
        email: currentUserEmail,
      });
      setFavVideos(res.data.favVideosID || []);
    } catch (error) {
      console.error("Error fetching favorite videos", error);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchFavVideos();
    }
  }, [isLoading]);

  if (isError) {
    return (
      <div className="wrapper">
        <span>Error while fetching data</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loader-container" style={{ height: "60vh" }}>
        <PuffLoader
          height="80"
          width="80"
          radius={1}
          color="#b6306c"
          aria-label="puff-loading"
        />
      </div>
    );
  }

  const courseOptions = [
    "Operating Systems",
    "Human-Computer Interaction",
    "Automata Theory and Formal Languages",
    "Modern Programming Languages",
  ];

  const handleCourseSelect = (course) => {
    setSearchInput(course);
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Videoyu favorilere ekleme/çıkarma
  const handleToggleFavorite = async (videoId) => {
    try {
      await axios.post(`/api/user/toFavVideo/${videoId}`, {
        email: currentUserEmail,
      });
      setFavVideos((prev) =>
        prev.includes(videoId)
          ? prev.filter((id) => id !== videoId)
          : [...prev, videoId]
      );
    } catch (error) {
      console.error("Error toggling favorite video", error);
    }
  };

  // Helper function to format video URL
  const getVideoUrl = (videoUrl) => {
    const baseUrl = "http://localhost:8000";
    return videoUrl.startsWith("http") ? videoUrl : `${baseUrl}${videoUrl}`;
  };

  // Filter videos based on selected course and search query
  const filteredVideos =
    data &&
    data.filter(
      (card) =>
        (searchInput
          ? card.courseName.toLowerCase().includes(searchInput.toLowerCase())
          : true) &&
        (searchQuery
          ? card.videoTitle.toLowerCase().includes(searchQuery.toLowerCase())
          : true)
    );

  return (
    <section className="v-wrapper">
      <Navbar />
      <div className="paddings flexCenter v-container">
        <div className="paddings flexCenter v-responsive">
          <div className="selection-bar">
            <input
              type="text"
              value={searchInput}
              placeholder="Search for courses..."
              onChange={(e) => setSearchInput(e.target.value)}
              className="course-input"
            />
            <button
              className="v-dropdown-button"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <FaChevronDown color="#d06382" />
            </button>

            {showDropdown && (
              <ul className="v-dropdown-menu">
                <li
                  className="v-dropdown-item"
                  onClick={() => handleCourseSelect("")}
                >
                  All Courses
                </li>
                {courseOptions.map((course, index) => (
                  <li
                    key={index}
                    className="v-dropdown-item"
                    onClick={() => handleCourseSelect(course)}
                  >
                    {course}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="search-bar">
            <FaSearch color="#d06382" size={20} />
            <input
              type="text"
              value={searchQuery}
              placeholder="Search by video title..."
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <main className="vs-container">
            <div className="paddings flexCenter videos">
              {filteredVideos && filteredVideos.length > 0 ? (
                filteredVideos.map((card, i) => (
                  <div key={card.id} className="flexColStart v-card">
                    <button
                      className="flexCenter favbutton"
                      onClick={() => handleToggleFavorite(card.id)}
                    >
                      <AiFillHeart
                        size={30}
                        color={
                          favVideos.includes(card.id) ? "#c40a5d" : "#fff2f9"
                        }
                      />
                    </button>
                    <img
                      src={card.image || "/video_icon.png"}
                      alt="video"
                      onError={(e) => (e.target.src = "/video_icon.png")}
                    />
                    <span className="purpleText">
                      {truncate(card.videoTitle, { length: 30 })}
                    </span>
                    <span className="greenText">
                      {card.userEmail.split("@")[0]}
                    </span>
                    <button
                      className="flexCenter button2"
                      onClick={() =>
                        window.open(getVideoUrl(card.videoUrl), "_blank")
                      }
                    >
                      <GiPlayButton size={30} />
                    </button>
                  </div>
                ))
              ) : (
                <p>No videos found.</p>
              )}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
};

export default Videos;
