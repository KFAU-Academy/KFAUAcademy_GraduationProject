import React, { useState } from "react";
import "./MyNotes.css";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";
import { sliderSettings } from "../../utils/common";
import { FaFilePdf } from "react-icons/fa6";
import { toast } from "react-toastify";
import { PuffLoader } from "react-spinners";
import { useMutation, useQueryClient } from "react-query";
import useMyNotes from "../../hooks/useMyNotes";
import { api } from "../../utils/api";
import dayjs from "dayjs";

const MyNotes = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    courseName: "",
    noteTitle: "",
    file: null,
  });
  const [noteNameError, setNoteNameError] = useState(false);
  const [noteTitleError, setNoteTitleError] = useState(false);

  const courseOptions = [
    "Operating Systems",
    "Human-Computer Interaction",
    "Automata Theory and Formal Languages",
    "Modern Programming Languages",
  ];

  // Kullanıcının email bilgisini localStorage'dan alıyoruz
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserEmail = user.email || "";

  // userEmail kontrolü
  if (!currentUserEmail) {
    console.error("No user email found in localStorage");
    toast.error("Please log in to manage notes");
  }

  // useMyNotes hook'undan kullanıcının notlarını çekme
  const { data: notes, isError, isLoading } = useMyNotes(currentUserEmail);
  const queryClient = useQueryClient();

  // Yeni not oluşturma mutation'ı
  const createNoteMutation = useMutation(
    (formData) =>
      api.post("/note/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["myNotes", currentUserEmail]);
        toast.success("Note created successfully");
        setModalOpen(false);
        setFormData({ courseName: "", noteTitle: "", file: null });
      },
      onError: (error) => {
        console.error("Create note error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          request: error.config?.data,
        });
        toast.error(
          error.response?.data?.message ||
            "Failed to create note. Please try again."
        );
      },
    }
  );

  // Not güncelleme mutation'ı
  const updateNoteMutation = useMutation(
    ({ id, formData }) =>
      api.put(`/note/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["myNotes", currentUserEmail]);
        toast.success("Note updated successfully");
        setModalOpen(false);
        setEditingNote(null);
        setFormData({ courseName: "", noteTitle: "", file: null });
      },
      onError: (error) => {
        console.error("Update note error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        toast.error(
          error.response?.data?.message ||
            "Failed to update note. Please try again."
        );
      },
    }
  );

  // Not silme mutation'ı
  const deleteNoteMutation = useMutation(
    (id) =>
      api.delete(`/note/${id}`, {
        data: { userEmail: currentUserEmail },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["myNotes", currentUserEmail]);
        toast.success("Note deleted successfully");
      },
      onError: (error) => {
        console.error("Delete note error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        toast.error(
          error.response?.data?.message ||
            "Failed to delete note. Please try again."
        );
      },
    }
  );

  // Hata durumu
  if (isError) {
    return (
      <div className="mn-wrapper flexCenter">
        <span className="secondaryText">Error while fetching your notes</span>
      </div>
    );
  }

  // Yüklenme durumu
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "courseName" && value.trim()) setNoteNameError(false);
    if (name === "noteTitle" && value.trim()) setNoteTitleError(false);
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = () => {
    if (
      !formData.courseName ||
      !formData.noteTitle ||
      (!formData.file && !editingNote)
    ) {
      if (!formData.courseName) setNoteNameError(true);
      if (!formData.noteTitle) setNoteTitleError(true);
      if (!formData.file && !editingNote)
        toast.error("Please select a note file.");
      return;
    }

    if (!currentUserEmail) {
      toast.error("User not logged in. Please log in to continue.");
      return;
    }

    const noteFormData = new FormData();
    noteFormData.append("courseName", formData.courseName);
    noteFormData.append("noteTitle", formData.noteTitle);
    noteFormData.append("userEmail", currentUserEmail);
    if (formData.file) {
      noteFormData.append("file", formData.file);
    }

    if (editingNote) {
      // Update işlemi
      updateNoteMutation.mutate({
        id: editingNote.id,
        formData: noteFormData,
      });
    } else {
      // Yeni not oluşturma
      console.log("Creating note with data:", {
        courseName: formData.courseName,
        noteTitle: formData.noteTitle,
        userEmail: currentUserEmail,
        file: formData.file?.name,
      });
      createNoteMutation.mutate(noteFormData);
    }
  };

  const handleDelete = (id) => {
    deleteNoteMutation.mutate(id);
  };

  const handleEditClick = (note) => {
    setFormData({
      courseName: note.courseName,
      noteTitle: note.noteTitle,
      file: null,
    });
    setEditingNote(note);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData({ courseName: "", noteTitle: "", file: null });
    setEditingNote(null);
    setNoteNameError(false);
    setNoteTitleError(false);
  };

  return (
    <section className="mn-wrapper">
      <Navbar />
      <div className="ma-main">
        <Sidebar />
        <main className="ma-container">
          <div className="ma-head flexStart">
            <span className="primaryText">My Notes</span>
            <button
              className="flexStart add-button"
              onClick={() => setModalOpen(true)}
            >
              <img
                src="/green_add.png"
                alt="Add Note"
                title="Add Note"
                className="add-icon"
              />
              <span>Add Note</span>
            </button>
          </div>

          {notes && notes.length > 0 ? (
            <Swiper {...sliderSettings}>
              <SliderButtons />
              {notes.map((note) => (
                <SwiperSlide key={note.id}>
                  <div className="flexColStart mv-card">
                    <img
                      src={note.image || "/note_icon.png"}
                      alt="Note Icon"
                      className="mv-card-icon"
                    />
                    <span className="purpleText">{note.noteTitle}</span>
                    <span className="secondaryText">{note.courseName}</span>
                    <span className="greenText2">
                      {note.owner?.fullName || "Unknown"}
                    </span>
                    <span className="secondaryText ma-date">
                      {dayjs(note.createdAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                    <div className="flexCenter mv-card-buttons">
                      <button
                        className="button2"
                        onClick={() => handleEditClick(note)}
                      >
                        Edit
                      </button>
                      <button
                        className="button2"
                        onClick={() => handleDelete(note.id)}
                      >
                        Delete
                      </button>
                      <button
                        className="flexCenter button2"
                        onClick={() => {
                          const baseUrl = "http://localhost:8000";
                          const noteUrl = note.noteUrl.startsWith("http")
                            ? note.noteUrl
                            : baseUrl + note.noteUrl;
                          window.open(noteUrl, "_blank");
                        }}
                      >
                        <FaFilePdf size={30} />
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="flexCenter">
              <span className="secondaryText">You have no notes yet.</span>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="modal-container">
          <div className="ma-modal-overlay" onClick={closeModal}></div>
          <div className="ma-add-modal">
            <div className="modal-header">
              <span>{editingNote ? "Edit Note" : "Add Note"}</span>
              <button onClick={closeModal}>X</button>
            </div>
            <div className="modal-body">
              <label>Course Name</label>
              <select
                name="courseName"
                onChange={handleInputChange}
                value={formData.courseName}
                className={noteNameError ? "input-error" : ""}
              >
                <option value="">Select a Course</option>
                {courseOptions.map((course, index) => (
                  <option key={index} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              {noteNameError && (
                <p className="mn-error-message">Course name is required.</p>
              )}
              <label>Note Title</label>
              <input
                name="noteTitle"
                onChange={handleInputChange}
                value={formData.noteTitle}
                placeholder="Enter note title"
                className={noteTitleError ? "input-error" : ""}
              />
              {noteTitleError && (
                <p className="mn-error-message">Note title is required.</p>
              )}
              <label>Note File</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="input-field"
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="submit-button"
                onClick={handleSubmit}
                disabled={
                  createNoteMutation.isLoading || updateNoteMutation.isLoading
                }
              >
                {editingNote ? "Save Changes" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const SliderButtons = () => {
  const swiper = useSwiper();
  return (
    <div className="flexCenter ma-buttons">
      <button onClick={() => swiper.slidePrev()}>&lt;</button>
      <button onClick={() => swiper.slideNext()}>&gt;</button>
    </div>
  );
};

export default MyNotes;
