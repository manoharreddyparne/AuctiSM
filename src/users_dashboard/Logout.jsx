// users_dashboard/Logout.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Perform logout operations (e.g., clearing tokens, etc.)
    // localStorage.clear();
    // sessionStorage.clear();

    navigate("/login"); // Redirect user to login after logging out
  }, [navigate]);

  return <div>Logging out...</div>;
};

export default Logout;
