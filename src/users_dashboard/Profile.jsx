import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../utils/AuthContext"; // ✅ Import AuthContext

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const { logout } = useContext(AuthContext); // ✅ Get logout from AuthContext
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.log("No token found, redirecting to login...");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        console.log("Profile data received:", response.data);
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  // ✅ Use AuthContext logout function
  const handleLogout = () => {
    logout(); // Clears tokens & cookies + updates state
    navigate("/"); // Redirects to home
  };

  if (!profileData) return <div>Loading...</div>;

  return (
    <div>
      <h2>Profile</h2>
      <p>Name: {profileData.fullName}</p>
      <p>Email: {profileData.email}</p>
      <p>Phone: {profileData.phone}</p>
      <p>Date of Birth: {new Date(profileData.dob).toLocaleDateString()}</p>
      <p>Address: {profileData.address}</p>

      {/* ✅ Logout Button */}
      <button onClick={handleLogout} style={{ marginTop: "20px", padding: "10px 15px", cursor: "pointer" }}>
        Logout
      </button>
    </div>
  );
};

export default Profile;
