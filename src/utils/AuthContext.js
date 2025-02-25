import React, { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false); // ✅ Track password reset status
  const navigate = useNavigate();

  // ✅ Login function - Handles Google login response
  const login = (token, userData, needsPasswordFlag = false) => {
    console.log("🔵 Storing auth token...");

    if (!token || !userData || !userData.email) {
      console.error("❌ Invalid login data received:", { token, userData });
      return;
    }

    try {
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));

      if (needsPasswordFlag) {
        console.log("🔴 User needs to set a password. Storing flag...");
        localStorage.setItem("needsPassword", "true"); // Store flag in localStorage
      } else {
        localStorage.removeItem("needsPassword");
      }

      setUser(userData);
      setNeedsPassword(needsPasswordFlag); // ✅ Update state

      console.log("🟢 User logged in:", userData);

      console.log("🚀 Redirecting to /mainpage...");
      setTimeout(() => {
        navigate("/mainpage", { replace: true });
      }, 500);
    } catch (error) {
      console.error("❌ Error storing login data:", error);
    }
  };

  // ✅ Logout function
  const logout = useCallback(() => {
    console.log("🔴 Logging out user...");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("needsPassword"); // ✅ Clear password reset flag
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setNeedsPassword(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  // ✅ Check authentication on page load
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

        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser({ id: decoded.userId, email: decoded.email, ...storedUser });

        const needsPasswordFlag = localStorage.getItem("needsPassword") === "true";
        setNeedsPassword(needsPasswordFlag); // ✅ Restore password reset state

        if (needsPasswordFlag) {
          console.warn("🔴 User needs to set a password. Showing reset modal.");
        }

      } catch (error) {
        console.error("❌ Invalid token:", error);
        logout();
      }
    } else {
      console.warn("⚠️ No token found. User is not logged in.");
      setUser(null);
    }

    setLoading(false);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, login, needsPassword, setNeedsPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
