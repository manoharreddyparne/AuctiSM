import React, { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fix: Wrap logout in useCallback to avoid dependency issues
  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    console.log("User logged out.");
    navigate("/login"); // Redirect to login page
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser({ id: decoded.userId, email: decoded.email });
        }
      } catch (error) {
        console.error("Invalid token, logging out:", error);
        logout(); // ✅ Now safely used inside useEffect
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [logout]); // ✅ Fix: Added `logout` to dependency array

  const login = (token, userData) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));

    try {
      jwtDecode(token); // ✅ Fix: Removed unused `decoded` variable
      setUser(userData); // Store full user details
      console.log("User logged in:", userData);
    } catch (error) {
      console.error("Error decoding login token:", error);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
