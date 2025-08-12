import React, { useState } from "react";
import logo from "../../assets/images/logoWhite.png";
import { BsFillPersonFill, BsFillLockFill } from "react-icons/bs";
import { FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; //
import { toast } from "react-toastify"; // Uyarılar için
import { useUser } from "../../context/UserContext.jsx";
import "./Login.css";

const Login = () => {
  const { login } = useUser(); // context hook'u
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // Sayfa yenilenmesini engeller
    try {
      const response = await axios.post(
        "http://localhost:8000/api/user/login",
        {
          email,
          password,
        }
      );
      console.log("Login başarılı:", response.data);

      if (response.status === 200) {
        toast.success("Login successful!");
        login(response.data.user, response.data.token); // <-- context fonksiyon
        navigate("/home");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flexColCenter l-wrapper">
      <img src={logo} alt="Logo" className="l-logo" />
      <div className="flexColCenter login-container">
        <h1 className="title">Login</h1>
        <form className="flexColCenter login-form" onSubmit={handleLogin}>
          <div className="flexStart input-container">
            <FaEnvelope className="input-icon" color="#99b56c" />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your.email@ogr.gidatarim.edu.tr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flexStart input-container">
            <BsFillLockFill className="input-icon" color="#99b56c" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={toggleShowPassword}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="flexCenter button2">
            Login
          </button>
        </form>

        <div className="flexColCenter links">
          <div className="forgot-password">
            <Link to="/login">I forgot my password</Link>
          </div>

          <div className="register-link">
            <span>Don't have an account? </span>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
