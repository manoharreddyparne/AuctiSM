import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// import App from "./App";
import { AuthProvider } from "./utils/AuthContext"; // ✅ Ensure Auth Context is wrapped
import App from "./seller/App"; // ✅ Import Seller App
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
