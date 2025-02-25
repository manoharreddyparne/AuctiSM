import React, { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";  // Corrected import
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Added for making API requests

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false); // Track password reset status
  const navigate = useNavigate();

  // Login function - Handles Google login response
  const login = (token, userData) => {
    console.log("🔵 Storing auth token...");

    if (!token || !userData || !userData.email) {
      console.error("❌ Invalid login data received:", { token, userData });
      return;
    }

    try {
      // Store the token and user data in localStorage
      console.log("🟢 Storing token and user data...");
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Update state with the user data
      setUser(userData);

      // Fetch the needsPassword flag from the backend
      axios.get("/api/profile", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        const { needsPassword } = response.data;
        setNeedsPassword(needsPassword);  // Set the needsPassword state based on backend response

        // Store the needsPassword flag in localStorage
        if (needsPassword) {
          localStorage.setItem("needsPassword", "true");
          navigate("/reset-password", { replace: true });  // Redirect to reset password if needed
        } else {
          localStorage.removeItem("needsPassword");
          navigate("/mainpage", { replace: true });  // Redirect to main page if no reset needed
        }
      })
      .catch(error => {
        console.error("❌ Error fetching profile:", error);
      });

      console.log("🟢 User logged in:", userData);

    } catch (error) {
      console.error("❌ Error storing login data:", error);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    console.log("🔴 Logging out user...");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("needsPassword"); // Clear password reset flag
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setNeedsPassword(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  // Check authentication on page load
  useEffect(() => {
    console.log("🔍 Checking authentication status...");

    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token); // Decode the JWT token
        console.log("🟢 Decoded token:", decoded);

        // Check if the token has expired
        if (decoded.exp * 1000 < Date.now()) {
          console.warn("⚠️ Token expired. Logging out...");
          logout();
          return;
        }

        // Retrieve the stored user data and update the state
        const storedUser = JSON.parse(localStorage.getItem("user"));
        console.log("🟢 Retrieved user data from localStorage:", storedUser);

        // Set the user state with the decoded token and stored user data
        setUser({ id: decoded.userId, email: decoded.email, ...storedUser });

        // Fetch the needsPassword flag from the backend
        axios.get("/api/profile", {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
          const { needsPassword } = response.data;
          setNeedsPassword(needsPassword);  // Set the needsPassword state based on backend response

          if (needsPassword) {
            console.warn("🔴 User needs to set a password. Showing reset modal.");
            navigate("/reset-password", { replace: true });  // Redirect immediately to reset password page
          }

        })
        .catch(error => {
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
    <AuthContext.Provider value={{ user, loading, logout, login, needsPassword, setNeedsPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
