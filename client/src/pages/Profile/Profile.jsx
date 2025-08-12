import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Yönlendirme için import
import "./Profile.css";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";

const Profile = () => {
  // State for user information and edit modes
  const [userInfo, setUserInfo] = useState({
    schoolNumber: "123456",
    department: "Computer Engineering",
    email: "",
    fullName: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserInfo((prev) => ({
          ...prev,
          email: parsedUser.email || "",
          fullName: parsedUser.fullName || "",
          schoolNumber: parsedUser.schoolNumber || prev.schoolNumber,
          department: parsedUser.department || prev.department,
        }));
      } catch (err) {
        console.error("User verisi çözümlenemedi:", err);
      }
    }
  }, []);

  const [editMode, setEditMode] = useState({
    schoolNumber: false,
    department: false,
  });

  const [errors, setErrors] = useState({
    schoolNumber: "",
    department: "",
  });

  const departments = [
    "Electrical and Electronics Engineering",
    "Computer Engineering",
    "Biomedical Engineering",
    "Food Engineering",
    "Software Engineering",
    "Industrial Engineering",
  ];

  // Validation rules
  const validateField = (field, value) => {
    if (field === "schoolNumber" && !/^\d*$/.test(value)) {
      return "School number can only contain numbers.";
    }
    return ""; // No error
  };

  // Toggle edit mode for a specific field
  const handleEditToggle = (field) => {
    if (editMode[field]) {
      // Save mode: Validate input before exiting edit mode
      const error = validateField(field, userInfo[field]);
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
        return;
      }
      setErrors((prev) => ({ ...prev, [field]: "" })); // Clear any previous errors
      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      const updatedUser = { ...storedUser, [field]: userInfo[field] };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Update the value of a specific field
  const handleValueChange = (field, value) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
    if (editMode[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  return (
    <div className="profile-wrapper">
      {/* Üst menü */}
      <Navbar />
      <div style={{ padding: "15px" }}>
        {/* İçerik */}
        <div className="profile-content">
          {/* Sol menü */}
          <Sidebar />

          {/* Ana içerik */}
          <main className="profile-main">
            <h2 className="profile-user-name">{userInfo.fullName}</h2>
            <p className="profile-user-email">{userInfo.email}</p>
            <div className="profile-user-info">
              {/* Okul No */}
              <div className="profile-info-row">
                <span className="profile-info-label">School Number:</span>
                {editMode.schoolNumber ? (
                  <input
                    className="profile-info-value"
                    type="text"
                    value={userInfo.schoolNumber}
                    onChange={(e) =>
                      handleValueChange("schoolNumber", e.target.value)
                    }
                  />
                ) : (
                  <span className="profile-info-value">
                    {userInfo.schoolNumber}
                  </span>
                )}
                <button
                  className="profile-edit-button"
                  onClick={() => handleEditToggle("schoolNumber")}
                >
                  {editMode.schoolNumber ? "Save" : "Edit"}
                </button>
                {errors.schoolNumber && (
                  <p className="profile-main-error-message">
                    {errors.schoolNumber}
                  </p>
                )}
              </div>

              {/* Bölüm */}
              <div className="profile-info-row">
                <span className="profile-info-label">Department:</span>
                {editMode.department ? (
                  <select
                    className="profile-info-value"
                    style={{ backgroundColor: "antiquewhite" }}
                    value={userInfo.department}
                    onChange={(e) =>
                      handleValueChange("department", e.target.value)
                    }
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="profile-info-value">
                    {userInfo.department}
                  </span>
                )}
                <button
                  className="profile-edit-button"
                  onClick={() => handleEditToggle("department")}
                >
                  {editMode.department ? "Save" : "Edit"}
                </button>
                {errors.department && (
                  <p className="error-message">{errors.department}</p>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
