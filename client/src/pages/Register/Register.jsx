import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../../assets/images/logoWhite.png";
import "./Register.css";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Confirm password görünürlük state'i
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);

    const regex = /^[A-Z][a-z]+ [A-Z][a-z]+$/;
    if (!regex.test(value)) {
      setUsernameError("Username must be in 'Name Surname' format."); // Ad ve Soyadın baş harfleri büyük olmalı
    } else {
      setUsernameError("");
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+@ogr\.gidatarim\.edu\.tr$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please use your school email.");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(value)) {
      setPasswordError(
        "Password must contain at least one uppercase letter and one number."
      );
    } else {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value !== password) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleRegisterClick = async () => {
    if (
      !usernameError &&
      !emailError &&
      !passwordError &&
      !confirmPasswordError &&
      username &&
      email &&
      password &&
      confirmPassword
    ) {
      setFormError("");
      try {
        const response = await fetch(
          "http://localhost:8000/api/user/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fullName: username,
              email: email,
              password: password,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          toast.success("Registration successful! You can now log in.", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate("/login");
        } else if (response.status === 409) {
          setFormError("User already registered with this email.");
          toast.error(
            "User already exists. Please use a different email or log in.",
            {
              position: "top-right",
              autoClose: 3000,
            }
          );
        } else {
          setFormError(data.message || "Registration failed.");
          toast.error("Registration failed. Please try again.", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        setFormError(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
        toast.error("Registration failed. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } else {
      setFormError("Please fill in all fields!");
      toast.error("Please fill in all fields!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <div className="flexColCenter r-wrapper">
      <img src={logo} alt="Logo" className="l-logo" />
      <div className="flexColCenter register-container">
        <h1 className="title">Register</h1>
        <div className="flexColCenter register-form">
          <div className="flexStart input-wrapper">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
          {usernameError && (
            <p className="register-name-error">{usernameError}</p>
          )}

          <div className="flexStart input-wrapper">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
            />
          </div>
          {emailError && <p className="register-mail-error">{emailError}</p>}

          <div className="flexStart input-wrapper">
            <FaKey className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={toggleShowPassword}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {passwordError && (
            <p className="register-password-error">{passwordError}</p>
          )}

          <div className="flexStart input-wrapper">
            <FaKey className="input-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={toggleShowConfirmPassword}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {confirmPasswordError && (
            <p className="register-confirm-password-error">
              {confirmPasswordError}
            </p>
          )}

          {formError && <p className="register-form-error">{formError}</p>}

          <button className="flexCenter button2" onClick={handleRegisterClick}>
            Register
          </button>
          <div className="register-login-link">
            <span>Already have an account? </span>
            <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
