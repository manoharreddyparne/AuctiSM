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


const logout = useCallback(() => {
  //debug
  //console.log(" Logging out user...");
  localStorage.removeItem("authToken"); 
  localStorage.removeItem("user");
  localStorage.removeItem("needsPassword");
  document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  setUser(null);
  setNeedsPassword(false);
  navigate("/login", { replace: true });
}, [navigate]);


const login = async (token, userData) => {
  //debug
  //console.log(" Storing auth token and user data...");

  localStorage.setItem("authToken", token);
  localStorage.setItem("user", JSON.stringify(userData));
  setUser(userData);

  if (userData?.needsPassword) {
    //debug
    //console.warn(" User needs to set a password. Redirecting to reset page.");
    localStorage.setItem("needsPassword", "true");
    navigate("/reset-password", { replace: true });
    return;
  }

  try {
    const response = await axios.get("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profile = response.data;
    //debug
    //console.log(" Profile fetched:", profile);

    setNeedsPassword(profile.needsPassword);
    if (profile.needsPassword) {
      //debig
      //console.warn("Profile indicates password reset needed.");
      localStorage.setItem("needsPassword", "true");
      navigate("/reset-password", { replace: true });
    } else {

      navigate("/mainpage", { replace: true });
    }
  } catch (error) {
    console.error(" Error fetching profile:", error.response?.data || error.message);
    navigate("/login", { replace: true }); 
  }
};

  
  useEffect(() => {
    const token = localStorage.getItem("authToken");
  
    if (!token) {

      //console.warn(" No token found. User is not logged in.");
      setUser(null);
      setLoading(false);
      return;
    }
  
    try {
      const decoded = jwtDecode(token);
      
      if (decoded.exp * 1000 < Date.now()) {
        console.warn(" Token expired. Logging out...");
        logout();
        return;
      }
  
      const storedUser = localStorage.getItem("user");
      let userData = storedUser ? JSON.parse(storedUser) : { id: decoded.userId, email: decoded.email };
  
      if (userData.needsPassword) {

        //debug
        // console.warn(" User needs to reset password.");
        setNeedsPassword(true);
        if (window.location.pathname !== "/reset-password") {
          navigate("/reset-password", { replace: true });
        }
      } else {
        setUser({ id: decoded.userId, email: decoded.email, ...userData });
      }
    } catch (error) {
      console.error(" Invalid token:", error);
      logout();
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
