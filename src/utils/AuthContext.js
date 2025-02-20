import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Import navigate

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);
        setUser({ id: decoded.userId, email: decoded.email });
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("authToken");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem("authToken", token);
    try {
      const decoded = jwtDecode(token);
      setUser({ id: decoded.userId, email: decoded.email });
      console.log("User set after login:", { id: decoded.userId, email: decoded.email });
    } catch (error) {
      console.error("Error decoding login token:", error);
      localStorage.removeItem("authToken");
      setUser(null);
    }
  };

  // 🔴 FIX: Move logout inside AuthContext to update state correctly
  const logout = () => {
    localStorage.removeItem("authToken");
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null); // ✅ Update state immediately
    console.log("User logged out successfully.");
    navigate("/"); // ✅ Redirect to login/home after logout
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
