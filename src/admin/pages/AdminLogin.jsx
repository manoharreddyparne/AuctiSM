import React, { useState, useEffect } from "react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "enabled");

  useEffect(() => {
    const interval = setInterval(() => {
      const storedDark = localStorage.getItem("darkMode") === "enabled";
      if (storedDark !== darkMode) {
        setDarkMode(storedDark);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [darkMode]);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Admin Login Attempt:", { email, password });
  };

  return (
    <div style={darkMode ? styles.containerDark : styles.containerLight}>
      <h2 style={darkMode ? styles.titleDark : styles.titleLight}>Admin Panel Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Enter admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={darkMode ? styles.inputDark : styles.inputLight}
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={darkMode ? styles.inputDark : styles.inputLight}
        />
        <button type="submit" style={styles.button}>Login</button>
      </form>
    </div>
  );
};

// Styles for both light and dark modes
const styles = {
  containerLight: {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  containerDark: {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#222",
    boxShadow: "0 0 10px rgba(255, 255, 255, 0.2)",
    textAlign: "center",
  },
  titleLight: { marginBottom: "20px", color: "#333" },
  titleDark: { marginBottom: "20px", color: "#fff" },
  form: { display: "flex", flexDirection: "column" },
  inputLight: {
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
    backgroundColor: "#fff",
    color: "#000",
  },
  inputDark: {
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #555",
    fontSize: "16px",
    backgroundColor: "#333",
    color: "#fff",
  },
  button: {
    padding: "10px",
    marginTop: "10px",
    borderRadius: "5px",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "18px",
    cursor: "pointer",
    border: "none",
  },
};

export default AdminLogin;
