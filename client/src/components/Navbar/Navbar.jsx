import React, { useState } from "react";
import "./Navbar.css";
import logo from "../../assets/images/logoBlack.png";
import { BiMenuAltRight } from "react-icons/bi";
import OutsideClickHandler from "react-outside-click-handler";
import { useUser } from "../../context/UserContext.jsx";

const Navbar = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const getMenuStyles = (menuOpened) => {
    if (document.documentElement.clientWidth <= 800) {
      return { right: !menuOpened && "-100%" };
    }
  };

  const { logout } = useUser();

  return (
    <div className="nav-wrapper">
      <div className="flexCenter paddings nav-container">
        <img src={logo} alt="Logo" className="flexStart l-logo" />

        <OutsideClickHandler onOutsideClick={() => setMenuOpened(false)}>
          <div
            className="flexCenter nav-menu"
            style={getMenuStyles(menuOpened)}
          >
            <a href="/home">Home</a>
            <a href="/videos">Videos</a>
            <a href="/notes">Notes</a>
            <a href="/profile">My Profile</a>
            <button onClick={logout} className="button">
              <a href="/login">Log Out</a>
            </button>
          </div>
        </OutsideClickHandler>

        <div
          className="menu-icon"
          onClick={() => setMenuOpened((prev) => !prev)}
        >
          <BiMenuAltRight size={30} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
