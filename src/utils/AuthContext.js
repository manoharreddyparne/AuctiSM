import React, { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode"; // Use named import instead of default
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);
  const navigate = useNavigate();

  // Login function – called after successful login (manual or Google)
  const login = (token, userData) => {
    console.log("🔵 Storing auth token and user data...");
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // Fetch the complete user profile from backend (which is the source of truth)
    axios
      .get("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const { needsPassword } = response.data;
        setNeedsPassword(needsPassword);
        if (needsPassword) {
          console.warn("🔴 User needs to set a password. Redirecting to reset page.");
          navigate("/reset-password", { replace: true });
        } else {
          navigate("/mainpage", { replace: true });
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching profile:", error);
      });

    console.log("🟢 User logged in:", userData);
  };

  // Logout function
  const logout = useCallback(() => {
    console.log("🔴 Logging out user...");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("needsPassword");
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setNeedsPassword(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  // Check authentication on component mount
  useEffect(() => {
    console.log("🔍 Checking authentication status...");
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("🟢 Decoded token:", decoded);

        // Check token expiration
        if (decoded.exp * 1000 < Date.now()) {
          console.warn("⚠️ Token expired. Logging out...");
          logout();
          return;
        }

        // Retrieve stored user data
        const storedUser = JSON.parse(localStorage.getItem("user"));
        console.log("🟢 Retrieved user data from localStorage:", storedUser);
        setUser({ id: decoded.userId, email: decoded.email, ...storedUser });

        // Fetch profile to get the up-to-date needsPassword flag
        axios
          .get("/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            const { needsPassword } = response.data;
            setNeedsPassword(needsPassword);
            if (needsPassword) {
              console.warn("🔴 User needs to set a password. Redirecting to reset page.");
              navigate("/reset-password", { replace: true });
            }
          })
          .catch((error) => {
            console.error("❌ Error fetching profile:", error);
          });
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
    <AuthContext.Provider
      value={{ user, loading, logout, login, needsPassword, setNeedsPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
