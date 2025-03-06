import React, { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);
  const navigate = useNavigate();

  // 🔴 Logout function - Clears stored tokens and user data
  const logout = useCallback(() => {
    console.log("🔴 Logging out user...");
    localStorage.removeItem("authToken");  // Ensure token removal
    localStorage.removeItem("user");
    localStorage.removeItem("needsPassword");
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setNeedsPassword(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  // 🟢 Login function - Stores token correctly
  const login = async (token, userData) => {
    console.log("🔵 Storing auth token and user data...");

    // Ensure token is stored correctly
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // 🔍 Check if user needs to set a password
    if (userData?.needsPassword) {
      console.warn("🔴 User needs to set a password. Redirecting to reset page.");
      localStorage.setItem("needsPassword", "true");
      navigate("/reset-password", { replace: true });
      return;
    }

    try {
      // ✅ Fetch updated profile
      const response = await axios.get("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profile = response.data;
      console.log("🟢 Profile fetched:", profile);

      // Update needsPassword based on profile data
      setNeedsPassword(profile.needsPassword);
      if (profile.needsPassword) {
        console.warn("🔴 Profile indicates password reset needed.");
        localStorage.setItem("needsPassword", "true");
        navigate("/reset-password", { replace: true });
      } else {
        navigate("/mainpage", { replace: true });
      }
    } catch (error) {
      console.error("❌ Error fetching profile:", error.response?.data || error.message);
      navigate("/mainpage", { replace: true });
    }
  };

  // 🔍 Check authentication when app starts
  useEffect(() => {
    console.log("🔍 Checking authentication status...");
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("🟢 Decoded token:", decoded);

        if (decoded.exp * 1000 < Date.now()) {
          console.warn("⚠️ Token expired. Logging out...");
          logout();
          return;
        }

        const storedUser = localStorage.getItem("user");
        let userData = storedUser ? JSON.parse(storedUser) : { id: decoded.userId, email: decoded.email };

        // 🔍 If user needs a password reset, redirect
        if (userData.needsPassword) {
          console.warn("🔴 Stored user needs to set a password.");
          setNeedsPassword(true);
          navigate("/reset-password", { replace: true });
        }

        setUser({ id: decoded.userId, email: decoded.email, ...userData });
      } catch (error) {
        console.error("❌ Invalid token:", error);
        logout();
      }
    } else {
      console.warn("⚠️ No token found. User is not logged in.");
      setUser(null);
    }

    setLoading(false);
  }, [logout, navigate]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, login, needsPassword, setNeedsPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
