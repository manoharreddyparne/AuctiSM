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
//  Clear Local Storage and Session Storage
      localStorage.clear();
      sessionStorage.clear();
//  Clear Cookies
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "") 
          .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"); 
      });

 //  Logout from AuthContext
      logout();

      console.log("✅ All session data cleared.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [logout]); //  logout in dependencies

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

//  Unauthorized error handling
        if (error.response && error.response.status === 401) {
          console.log("🚨 Unauthorized: Clearing token and redirecting...");
          clearStorageAndCookies();
          navigate("/login");
        }
      }
    };

    fetchUserData();
  }, [navigate, clearStorageAndCookies]); //  navigate and clearStorageAndCookies in dependencies

//  Logout function
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

{/*  Logout button */}
      <button onClick={handleLogout} style={{ marginTop: "20px", padding: "10px 15px", cursor: "pointer" }}>
        Logout
      </button>
    </div>
  );
};

export default Profile;
