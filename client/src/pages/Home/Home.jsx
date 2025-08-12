import React from "react";
import "./Home.css";
import Navbar from "../../components/Navbar/Navbar";
import Greeting from "../../components/Greetings/Greeting";
import Announcement from "../../components/Announcement/Announcement";

const Home = () => {
  return (
    <section className="h-wrapper">
      {/* navbar kısmı */}
      <Navbar />

      {/* karşılama metni */}
      <Greeting />

      {/* duyuru kısmı */}
      <Announcement />
    </section>
  );
};

export default Home;
