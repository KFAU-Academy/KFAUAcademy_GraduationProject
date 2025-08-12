import React, { useState } from "react";
import "./Announcement.css";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";
import { sliderSettings } from "../../utils/common";
import { PuffLoader } from "react-spinners";
import { MdOutlineAnnouncement } from "react-icons/md";
import useAnnouncements from "../../hooks/useAnnouncements";
import dayjs from "dayjs";

const Announcement = () => {
  const { data, isError, isLoading } = useAnnouncements();
  const [isContentOpen, setContentOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  if (isError) {
    return (
      <div className="a-wrapper">
        <span>Error while fetching announcements</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="a-wrapper flexCenter" style={{ height: "60vh" }}>
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
  const handleContentClick = (announcement) => {
    setSelectedContent(announcement);
    setContentOpen(true);
  };

  const closeModal = () => {
    setContentOpen(false);
    setFormData({
      category: "",
      title: "",
      content: "",
    });
    setSelectedContent(null);
  };
  return (
    <section className="a-wrapper">
      <div className="paddings a-container">
        <div className="a-head flexColStart">
          <span className="primaryText">Announcements</span>
        </div>

        {data && data.length > 0 && (
          <Swiper {...sliderSettings}>
            <SliderButtons />
            {data.map((card) => {
              let iconSrc = "/course_icon.png"; // default icon
              if (card.category === "club") {
                iconSrc = "/club_icon.png";
              } else if (card.category === "note") {
                iconSrc = "/course_icon.png";
              } else if (card.category === "video") {
                iconSrc = "/course_icon.png";
              }

              return (
                <SwiperSlide key={card.id}>
                  <div className="flexColStart a-card">
                    <img
                      src={iconSrc}
                      alt="announcement"
                      className="ma-card-icon"
                    />
                    <span className="purpleText">{card.title}</span>
                    <span className="greenText">
                      {card.owner?.fullName || "Unknown"}
                    </span>
                    <span className="secondaryText a-category">
                      {card.category}
                    </span>
                    <span className="secondaryText a-date">
                      <span>
                        {dayjs(card.createdAt).format("DD/MM/YYYY HH:mm")}
                      </span>
                    </span>
                    <button
                      className="button2"
                      onClick={() => handleContentClick(card)}
                    >
                      <MdOutlineAnnouncement size={30} />
                    </button>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>
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

export default Announcement;

const SliderButtons = () => {
  const swiper = useSwiper();
  return (
    <div className="flexCenter a-buttons">
      <button onClick={() => swiper.slidePrev()}>&lt;</button>
      <button onClick={() => swiper.slideNext()}>&gt;</button>
    </div>
  );
};
