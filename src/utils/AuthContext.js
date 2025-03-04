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

  // Login function – called after successful login (manual or Google)
  // We now check if userData has a 'needsPassword' flag and act accordingly.
  const login = (token, userData) => {
    console.log("🔵 Storing auth token and user data...");
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // Check if the user data indicates a password reset is needed.
    if (userData && userData.needsPassword) {
      console.warn("🔴 User needs to set a password. Redirecting to reset page.");
      localStorage.setItem("needsPassword", "true");
      navigate("/reset-password", { replace: true });
    } else {
      // Optionally, you can still fetch the latest profile:
      axios
        .get("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const { needsPassword: profileNeedsPassword } = response.data;
          setNeedsPassword(profileNeedsPassword);
          if (profileNeedsPassword) {
            console.warn("🔴 (Profile) User needs to set a password. Redirecting to reset page.");
            localStorage.setItem("needsPassword", "true");
            navigate("/reset-password", { replace: true });
          } else {
            navigate("/mainpage", { replace: true });
          }
        })
        .catch((error) => {
          console.error("❌ Error fetching profile:", error);
          // If error, fallback to mainpage
          navigate("/mainpage", { replace: true });
        });
    }

    console.log("🟢 User logged in:", userData);
  };

  // Check authentication on component mount
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
        // If the userData contains a needsPassword flag, update state accordingly.
        if (userData.needsPassword) {
          setNeedsPassword(true);
          console.warn("🔴 Stored user needs to set a password.");
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
