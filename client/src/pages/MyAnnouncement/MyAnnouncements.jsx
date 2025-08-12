import React, { useState } from "react";
import "./MyAnnouncements.css";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";
import { sliderSettings } from "../../utils/common";
import { MdOutlineAnnouncement } from "react-icons/md";
import { toast } from "react-toastify";
import { PuffLoader } from "react-spinners";
import { useMutation, useQueryClient } from "react-query";
import useMyAnnouncements from "../../hooks/useMyAnnouncements";
import { api } from "../../utils/api";
import dayjs from "dayjs";

const MyAnnouncements = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isContentOpen, setContentOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    content: "",
  });

  // Kullanıcının email bilgisini localStorage'dan alıyoruz
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserEmail = user.email || "";

  // userEmail kontrolü
  if (!currentUserEmail) {
    console.error("No user email found in localStorage");
    toast.error("Please log in to create announcements");
  }

  // useMyAnnouncements hook'undan kullanıcının duyurularını çekme
  const {
    data: announcements,
    isError,
    isLoading,
  } = useMyAnnouncements(currentUserEmail);
  const queryClient = useQueryClient();

  // Yeni duyuru oluşturma mutation'ı
  const createAnnouncementMutation = useMutation(
    (newAnnouncement) => api.post("/announcement/create", newAnnouncement),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["myAnnouncements", currentUserEmail]);
        toast.success("Announcement created successfully");
        setModalOpen(false);
        setFormData({ category: "", title: "", content: "" });
      },
      onError: (error) => {
        console.error("Create announcement error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          request: error.config?.data,
        });
        toast.error(
          error.response?.data?.message ||
            "Failed to create announcement. Please try again."
        );
      },
    }
  );

  // Duyuru güncelleme mutation'ı
  const updateAnnouncementMutation = useMutation(
    ({ id, data }) =>
      api.put(`/announcement/${id}`, { ...data, userEmail: currentUserEmail }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["myAnnouncements", currentUserEmail]);
        toast.success("Announcement updated successfully");
        setModalOpen(false);
        setEditingAnnouncement(null);
        setFormData({ category: "", title: "", content: "" });
      },
      onError: (error) => {
        console.error("Update announcement error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        toast.error(
          error.response?.data?.message ||
            "Failed to update announcement. Please try again."
        );
      },
    }
  );

  // Duyuru silme mutation'ı
  const deleteAnnouncementMutation = useMutation(
    (id) =>
      api.delete(`/announcement/${id}`, {
        data: { userEmail: currentUserEmail },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["myAnnouncements", currentUserEmail]);
        toast.success("Announcement deleted successfully");
      },
      onError: (error) => {
        console.error("Delete announcement error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        toast.error(
          error.response?.data?.message ||
            "Failed to delete announcement. Please try again."
        );
      },
    }
  );

  // Hata durumu
  if (isError) {
    return (
      <div className="ma-wrapper flexCenter">
        <span className="secondaryText">
          Error while fetching your announcements
        </span>
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
  };

  const handleSubmit = () => {
    // Form doğrulaması
    if (!formData.category || !formData.title || !formData.content) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!currentUserEmail) {
      toast.error("User not logged in. Please log in to continue.");
      return;
    }

    if (editingAnnouncement) {
      // Update işlemi
      updateAnnouncementMutation.mutate({
        id: editingAnnouncement.id,
        data: {
          category: formData.category,
          title: formData.title,
          content: formData.content,
        },
      });
    } else {
      // Yeni duyuru oluşturma
      const newAnnouncement = {
        category: formData.category,
        title: formData.title,
        content: formData.content,
        userEmail: currentUserEmail,
      };
      console.log("Creating announcement with data:", newAnnouncement);
      createAnnouncementMutation.mutate(newAnnouncement);
    }
  };

  const handleDelete = (id) => {
    deleteAnnouncementMutation.mutate(id);
  };

  const handleContentClick = (announcement) => {
    setSelectedContent(announcement);
    setContentOpen(true);
  };

  const handleEditClick = (announcement) => {
    setFormData({
      category: announcement.category,
      title: announcement.title,
      content: announcement.content,
    });
    setEditingAnnouncement(announcement);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setContentOpen(false);
    setFormData({
      category: "",
      title: "",
      content: "",
    });
    setEditingAnnouncement(null);
    setSelectedContent(null);
  };

  return (
    <section className="ma-wrapper">
      <Navbar />
      <div className="ma-main">
        <Sidebar />
        <main className="ma-container">
          <div className="ma-head flexStart">
            <span className="primaryText">My Announcements</span>
            <button
              className="flexStart add-button"
              onClick={() => setModalOpen(true)}
            >
              <img
                src="/pink_add.png"
                alt="Add Announcement"
                title="Add Announcement"
                className="add-icon"
              />
              <span>Add Announcement</span>
            </button>
          </div>

          {announcements && announcements.length > 0 ? (
            <Swiper {...sliderSettings}>
              <SliderButtons />
              {announcements.map((card) => {
                let iconSrc = "/course_icon.png";
                if (card.category === "club") {
                  iconSrc = "/club_icon.png";
                } else if (
                  card.category === "note" ||
                  card.category === "video"
                ) {
                  iconSrc = "/course_icon.png";
                }

                return (
                  <SwiperSlide key={card.id}>
                    <div className="flexColStart ma-card">
                      <img
                        src={iconSrc}
                        alt="announcement"
                        className="ma-card-icon"
                      />
                      <span className="purpleText">{card.title}</span>
                      <span className="greenText">
                        {card.owner?.fullName || "Unknown"}
                      </span>
                      <span className="secondaryText ma-category">
                        {card.category}
                      </span>
                      <span className="secondaryText ma-date">
                        {dayjs(card.createdAt).format("DD/MM/YYYY HH:mm")}
                      </span>
                      <div className="flexCenter ma-card-buttons">
                        <button
                          className="button2"
                          onClick={() => handleEditClick(card)}
                        >
                          Edit
                        </button>
                        <button
                          className="button2"
                          onClick={() => handleDelete(card.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="button2"
                          onClick={() => handleContentClick(card)}
                        >
                          <MdOutlineAnnouncement size={30} />
                        </button>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ) : (
            <div className="flexCenter">
              <span className="secondaryText">
                You have no announcements yet.
              </span>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="modal-container">
          <div className="ma-modal-overlay" onClick={closeModal}></div>
          <div className="ma-add-modal">
            <div className="modal-header">
              <span>
                {editingAnnouncement ? "Edit Announcement" : "Add Announcement"}
              </span>
              <button onClick={closeModal}>X</button>
            </div>
            <div className="modal-body">
              <label>Category</label>
              <select
                name="category"
                onChange={handleInputChange}
                value={formData.category}
              >
                <option value="">Select</option>
                <option value="video">Video</option>
                <option value="note">Note</option>
                <option value="club">Club</option>
              </select>

              <label>Title</label>
              <input
                name="title"
                onChange={handleInputChange}
                value={formData.title}
                placeholder="Enter title"
              />

              <label>Content</label>
              <textarea
                name="content"
                onChange={handleInputChange}
                value={formData.content}
                placeholder="Enter content"
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
                  createAnnouncementMutation.isLoading ||
                  updateAnnouncementMutation.isLoading
                }
              >
                {editingAnnouncement ? "Save Changes" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isContentOpen && (
        <div className="modal-container">
          <div className="ma-modal-overlay" onClick={closeModal}></div>
          <div className="ma-content-modal">
            <div className="modal-header">
              <span>Announcement Content</span>
              <button onClick={closeModal}>X</button>
            </div>
            <div className="modal-body">
              <h3>{selectedContent?.title}</h3>
              <p>
                <strong>Category:</strong> {selectedContent?.category}
              </p>
              <p>
                <strong>Creator:</strong>{" "}
                {selectedContent?.owner?.fullName || "Unknown"}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {selectedContent?.createdAt
                  ? dayjs(selectedContent.createdAt).format("DD/MM/YYYY HH:mm")
                  : "N/A"}
              </p>
              <p>{selectedContent?.content}</p>
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

export default MyAnnouncements;
