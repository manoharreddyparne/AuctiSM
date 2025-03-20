import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../utils/AuthContext"; 

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const { logout } = useContext(AuthContext); 
  const navigate = useNavigate();


  const clearStorageAndCookies = useCallback(() => {
    try {

      localStorage.clear();
      sessionStorage.clear();

      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "") 
          .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"); 
      });

      logout();

      console.log("✅ All session data cleared.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [logout]); 

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.log("❌ No token found, redirecting to login...");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Profile data received:", response.data);
        setProfileData(response.data);
      } catch (error) {
        console.error("❌ Error fetching profile:", error);

        if (error.response && error.response.status === 401) {
          console.log("🚨 Unauthorized: Clearing token and redirecting...");
          clearStorageAndCookies();
          navigate("/login");
        }
      }
    };

    fetchUserData();
  }, [navigate, clearStorageAndCookies]);

  const handleLogout = () => {
    clearStorageAndCookies();
    navigate("/login");
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

      <button onClick={handleLogout} style={{ marginTop: "20px", padding: "10px 15px", cursor: "pointer" }}>
        Logout
      </button>
    </div>
  );
};

export default Profile;
