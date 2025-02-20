// // users_dashboard/App.jsx
// import React, { useState } from "react";
// import { Routes, Route } from "react-router-dom";
// import UserNavbar from "./UserNavbar";
// import MainPage from "./MainPage";
// import PrivateRoute from "../utils/PrivateRoute";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "../global.css";

// function App() {
//   const [searchQuery, setSearchQuery] = useState("");

//   const isAuthenticated = () => !!localStorage.getItem("token");

//   return (
//     <>
//       <div className="global-background"></div>
//       <UserNavbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
//       <Routes>
//         <Route path="/*" element={<MainPage />} />
//         <Route
//           path="/profile"
//           element={
//             <PrivateRoute isAuthenticated={isAuthenticated}>
//               <h2>User Profile Page</h2>
//             </PrivateRoute>
//           }
//         />
//       </Routes>
//     </>
//   );
// }

// export default App;
