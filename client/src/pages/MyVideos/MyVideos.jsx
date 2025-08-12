import React, { useState } from "react";
import "./MyVideos.css";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";
import { sliderSettings } from "../../utils/common";
import { GiPlayButton } from "react-icons/gi";
import { toast } from "react-toastify";
import { PuffLoader } from "react-spinners";
import { useMutation, useQueryClient } from "react-query";
import useMyVideos from "../../hooks/useMyVideos";
import { api } from "../../utils/api";
import dayjs from "dayjs";

const MyVideos = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    courseName: "",
    videoTitle: "",
    file: null,
  });
  const [courseNameError, setCourseNameError] = useState(false);
  const [videoTitleError, setVideoTitleError] = useState(false);

  const courseOptions = [
    "Operating Systems",
    "Human-Computer Interaction",
    "Automata Theory and Formal Languages",
    "Modern Programming Languages",
  ];

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserEmail = user.email || "";

  console.log("Current user email:", currentUserEmail); // Debug log

  if (!currentUserEmail) {
    console.error("No user email found in localStorage");
    toast.error("Please log in to manage videos");
  }

  const { data: videos, isError, isLoading } = useMyVideos(currentUserEmail);
  const queryClient = useQueryClient();

  const createVideoMutation = useMutation(
    (formData) =>
      api.post("/video/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["myVideos", currentUserEmail]);
        toast.success("Video created successfully");
        setModalOpen(false);
        setFormData({ courseName: "", videoTitle: "", file: null });
      },
      onError: (error) => {
        console.error("Create video error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          request: error.config?.data,
        });
        toast.error(
          error.response?.data?.message ||
            "Failed to create video. Please try again."
        );
      },
    }
  );

  const updateVideoMutation = useMutation(
    ({ id, formData }) =>
      api.put(`/video/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["myVideos", currentUserEmail]);
        toast.success("Video updated successfully");
        setModalOpen(false);
        setEditingVideo(null);
        setFormData({ courseName: "", videoTitle: "", file: null });
      },
      onError: (error) => {
        console.error("Update video error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        toast.error(
          error.response?.data?.message ||
            "Failed to update video. Please try again."
        );
      },
    }
  );

  const deleteVideoMutation = useMutation(
    (id) =>
      api.delete(`/video/${id}`, {
        data: { userEmail: currentUserEmail },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["myVideos", currentUserEmail]);
        toast.success("Video deleted successfully");
      },
      onError: (error) => {
        console.error("Delete video error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        toast.error(
          error.response?.data?.message ||
            "Failed to delete video. Please try again."
        );
      },
    }
  );

  if (isError) {
    console.error("useMyVideos error:", { isError, data: videos });
    return (
      <div className="mv-wrapper flexCenter">
        <span className="secondaryText">Error while fetching your videos</span>
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "courseName" && value.trim()) setCourseNameError(false);
    if (name === "videoTitle" && value.trim()) setVideoTitleError(false);
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = () => {
    if (
      !formData.courseName ||
      !formData.videoTitle ||
      (!formData.file && !editingVideo)
    ) {
      if (!formData.courseName) setCourseNameError(true);
      if (!formData.videoTitle) setVideoTitleError(true);
      if (!formData.file && !editingVideo)
        toast.error("Please select a video file.");
      return;
    }

    if (!currentUserEmail) {
      toast.error("User not logged in. Please log in to continue.");
      return;
    }

    const videoFormData = new FormData();
    videoFormData.append("courseName", formData.courseName);
    videoFormData.append("videoTitle", formData.videoTitle);
    videoFormData.append("userEmail", currentUserEmail);
    if (formData.file) {
      videoFormData.append("file", formData.file);
    }

    if (editingVideo) {
      updateVideoMutation.mutate({
        id: editingVideo.id,
        formData: videoFormData,
      });
    } else {
      console.log("Creating video with data:", {
        courseName: formData.courseName,
        videoTitle: formData.videoTitle,
        userEmail: currentUserEmail,
        file: formData.file?.name,
      });
      createVideoMutation.mutate(videoFormData);
    }
  };

  const handleDelete = (id) => {
    deleteVideoMutation.mutate(id);
  };

  const handleEditClick = (video) => {
    setFormData({
      courseName: video.courseName,
      videoTitle: video.videoTitle,
      file: null,
    });
    setEditingVideo(video);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData({ courseName: "", videoTitle: "", file: null });
    setEditingVideo(null);
    setCourseNameError(false);
    setVideoTitleError(false);
  };

  return (
    <section className="mv-wrapper">
      <Navbar />
      <div className="ma-main">
        <Sidebar />
        <main className="ma-container">
          <div className="ma-head flexStart">
            <span className="primaryText">My Videos</span>
            <button
              className="flexStart add-button"
              onClick={() => setModalOpen(true)}
            >
              <img
                src="/green_add.png"
                alt="Add Video"
                title="Add Video"
                className="add-icon"
              />
              <span>Add Video</span>
            </button>
          </div>

          {videos && videos.length > 0 ? (
            <Swiper {...sliderSettings}>
              <SliderButtons />
              {videos.map((video) => (
                <SwiperSlide key={video.id}>
                  <div className="flexColStart mv-card">
                    <img
                      src={video.image || "/video_icon.png"}
                      alt="Video Icon"
                      className="mv-card-icon"
                    />
                    <span className="purpleText">{video.videoTitle}</span>
                    <span className="secondaryText">{video.courseName}</span>
                    <span className="greenText2">
                      {video.owner?.fullName || "Unknown"}
                    </span>
                    <span className="secondaryText ma-date">
                      {dayjs(video.createdAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                    <div className="flexCenter mv-card-buttons">
                      <button
                        className="button2"
                        onClick={() => handleEditClick(video)}
                      >
                        Edit
                      </button>
                      <button
                        className="button2"
                        onClick={() => handleDelete(video.id)}
                      >
                        Delete
                      </button>
                      <button
                        className="flexCenter button2"
                        onClick={() => {
                          const baseUrl = "http://localhost:8000";
                          const videoUrl = video.videoUrl.startsWith("http")
                            ? video.videoUrl
                            : baseUrl + video.videoUrl;
                          window.open(videoUrl, "_blank");
                        }}
                      >
                        <GiPlayButton size={30} />
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="flexCenter">
              <span className="secondaryText">You have no videos yet.</span>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="modal-container">
          <div className="ma-modal-overlay" onClick={closeModal}></div>
          <div className="ma-add-modal">
            <div className="modal-header">
              <span>{editingVideo ? "Edit Video" : "Add Video"}</span>
              <button onClick={closeModal}>X</button>
            </div>
            <div className="modal-body">
              <label>Course Name</label>
              <select
                name="courseName"
                onChange={handleInputChange}
                value={formData.courseName}
                className={courseNameError ? "input-error" : ""}
              >
                <option value="">Select a Course</option>
                {courseOptions.map((course, index) => (
                  <option key={index} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              {courseNameError && (
                <p className="mn-error-message">Course name is required.</p>
              )}
              <label>Video Title</label>
              <input
                name="videoTitle"
                onChange={handleInputChange}
                value={formData.videoTitle}
                placeholder="Enter video title"
                className={videoTitleError ? "input-error" : ""}
              />
              {videoTitleError && (
                <p className="mn-error-message">Video title is required.</p>
              )}
              <label>Video File</label>
              <input
                type="file"
                accept="video/*"
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
                  createVideoMutation.isLoading || updateVideoMutation.isLoading
                }
              >
                {editingVideo ? "Save Changes" : "Submit"}
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

export default MyVideos;
