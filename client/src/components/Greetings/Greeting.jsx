import React, { useState, useEffect } from "react";
import "./Greeting.css";

const Greeting = () => {
  const [greeting, setGreeting] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Kullanıcının saatine göre mesaj seçme
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      setGreeting("Good Morning");
    } else if (hours >= 12 && hours < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  // Typewriter efekti için
  useEffect(() => {
    if (greeting) {
      setDisplayText(""); // Önce ekranı temizle
      setCurrentIndex(0); // index'i sıfırla
    }
  }, [greeting]);

  useEffect(() => {
    if (currentIndex < greeting.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + greeting[currentIndex]);
        setCurrentIndex(currentIndex + 1); // currentIndex'i artır
      }, 100); // Harflerin yazılma hızı
      return () => clearTimeout(timer); // Temizleme işlemi
    }
  }, [currentIndex, greeting]);

  return (
    <div className="g-wrapper">
      <div className="flexCenter paddings innerWidth g-container">
        <div className="greet-text">{displayText}</div>
      </div>
    </div>
  );
};

export default Greeting;
