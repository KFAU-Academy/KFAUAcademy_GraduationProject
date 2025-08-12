import React, { useState, useEffect } from "react";
import "./Notes.css";
import Navbar from "../../components/Navbar/Navbar";
import { FaSearch, FaChevronDown, FaFilePdf } from "react-icons/fa";
import useNotes from "../../hooks/useNotes";
import { PuffLoader } from "react-spinners";
import { AiFillHeart } from "react-icons/ai";
import { truncate } from "lodash";
import axios from "axios";

const Notes = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [favNotes, setFavNotes] = useState([]);
  const { data, isError, isLoading } = useNotes();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserEmail = user.email || "";

  // Favori notları çekme
  const fetchFavNotes = async () => {
    try {
      const res = await axios.post("/api/user/allNoteFavs", {
        email: currentUserEmail,
      });
      setFavNotes(res.data.favNotesID || []);
    } catch (error) {
      console.error("Error fetching favorite notes", error);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchFavNotes();
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

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const selectCourse = (course) => {
    setSelectedCourse(course);
    setDropdownOpen(false);
  };

  const handleInputChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Notu favorilere ekleme/çıkarma
  const handleToggleFavorite = async (noteId) => {
    try {
      await axios.post(`/api/user/toFavNote/${noteId}`, {
        email: currentUserEmail,
      });
      setFavNotes((prev) =>
        prev.includes(noteId)
          ? prev.filter((id) => id !== noteId)
          : [...prev, noteId]
      );
    } catch (error) {
      console.error("Error toggling favorite note", error);
    }
  };

  // Helper function to format note URL
  const getNoteUrl = (noteUrl) => {
    const baseUrl = "http://localhost:8000";
    return noteUrl.startsWith("http") ? noteUrl : `${baseUrl}${noteUrl}`;
  };

  // Filter notes based on selected course and search query
  const filteredNotes =
    data &&
    data.filter(
      (card) =>
        (selectedCourse
          ? card.courseName.toLowerCase().includes(selectedCourse.toLowerCase())
          : true) &&
        (searchQuery
          ? card.noteTitle.toLowerCase().includes(searchQuery.toLowerCase())
          : true)
    );

  return (
    <section className="n-wrapper">
      <Navbar />
      <div className="paddings flexCenter n-container">
        <div className="paddings flexCenter n-responsive">
          <div className="selection-bar">
            <input
              type="text"
              value={selectedCourse}
              placeholder="Search for courses..."
              onChange={handleInputChange}
              className="course-input"
            />
            <button className="dropdown-button" onClick={toggleDropdown}>
              <FaChevronDown color="#d06382" />
            </button>

            {dropdownOpen && (
              <ul className="dropdown-menu">
                <li className="dropdown-item" onClick={() => selectCourse("")}>
                  All Courses
                </li>
                {courseOptions.map((course, index) => (
                  <li
                    key={index}
                    className="dropdown-item"
                    onClick={() => selectCourse(course)}
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
              placeholder="Search by note title..."
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <main className="ns-container">
            <div className="paddings flexCenter notes">
              {filteredNotes && filteredNotes.length > 0 ? (
                filteredNotes.map((card, i) => (
                  <div key={card.id} className="flexColStart n-card">
                    <button
                      className="flexCenter favbutton"
                      onClick={() => handleToggleFavorite(card.id)}
                    >
                      <AiFillHeart
                        size={30}
                        color={
                          favNotes.includes(card.id) ? "#c40a5d" : "#fff2f9"
                        }
                      />
                    </button>
                    <img
                      src={card.image || "/note_icon.png"}
                      alt="note"
                      onError={(e) => (e.target.src = "/note_icon.png")}
                    />
                    <span className="purpleText">
                      {truncate(card.noteTitle, { length: 30 })}
                    </span>
                    <span className="greenText">
                      {card.userEmail.split("@")[0]}
                    </span>
                    <button
                      className="flexCenter button2"
                      onClick={() =>
                        window.open(getNoteUrl(card.noteUrl), "_blank")
                      }
                    >
                      <FaFilePdf size={30} />
                    </button>
                  </div>
                ))
              ) : (
                <p>No notes found.</p>
              )}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
};

export default Notes;
