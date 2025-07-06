// the below code is not deleted, but it is not being used in the current context
// it is a complete code for a Dashboard component that was previously used

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Button } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import AuctionCard from "../default_dashboard/jsx/AuctionCard";
// import LoginModal from "../shared_components/LoginModal";
// import Contact from "../pages/Contact"; 
// import "../css/Dashboard.css"; 

// const Dashboard = () => {
//   const [auctions, setAuctions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("darkMode") === "enabled");

//   const navigate = useNavigate();

//   const updateDarkMode = () => {
//     const mode = localStorage.getItem("darkMode") === "enabled";
//     setIsDarkMode(mode);
//   };

//   useEffect(() => {
//     window.addEventListener("storage", updateDarkMode);

//     const originalSetItem = localStorage.setItem;
//     localStorage.setItem = function (key, value) {
//       originalSetItem.apply(this, arguments);
//       if (key === "darkMode") updateDarkMode();
//     };

//     return () => {
//       window.removeEventListener("storage", updateDarkMode);
//       localStorage.setItem = originalSetItem;
//     };
//   }, []);

//   useEffect(() => {
//     const fetchAuctions = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auctions/public`);
//         setAuctions(response.data);
//       } catch (error) {
//         console.error("Error fetching auctions:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAuctions();
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     setIsLoggedIn(!!token);
//   }, []);

//   useEffect(() => {
//     document.body.classList.toggle("dark-mode", isDarkMode);
//   }, [isDarkMode]);

//   const computeStatus = (auction) => {
//     const now = new Date();
//     const start = new Date(auction.startDateTime);
//     const end = new Date(auction.endDateTime);
//     if (now < start) return "upcoming";
//     if (now >= start && now < end) return "ongoing";
//     return "completed";
//   };

//   const categorizedAuctions = { ongoing: [], upcoming: [], completed: [] };
//   auctions.forEach((auction) => {
//     const status = computeStatus(auction);
//     categorizedAuctions[status].push(auction);
//   });

//   const handleAuctionClick = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     const auctionId = e.target.closest(".auction-item")?.id;

//     if (!isLoggedIn) {
//       setShowLoginModal(true);
//     } else if (auctionId) {
//       navigate(`/auction-detail/${auctionId}`);
//     }
//   };

//   const handleModalYes = () => {
//     setShowLoginModal(false);
//     navigate("/login");
//   };

//   if (loading) return <p>Loading auctions...</p>;

//   return (
//     <div className={`dashboard-container ${isDarkMode ? "dark-mode" : ""}`}>
//       <div className="global-background"></div>
//       <h2 className="dashboard-title">Dashboard</h2>

//       {["ongoing", "upcoming", "completed"].map((status) => (
//         <section key={status} className="auctions-section">
//           <h3 className="section-heading">
//             {status.charAt(0).toUpperCase() + status.slice(1)} Auctions (
//             {categorizedAuctions[status].length})
//           </h3>
//           <div className="auction-list">
//             {categorizedAuctions[status].length > 0 ? (
//               categorizedAuctions[status].map((auction) => (
//                 <div id={auction._id} key={auction._id} className="auction-item">
//                   <Button
//                     variant="link"
//                     type="button"
//                     onClick={handleAuctionClick}
//                     style={{
//                       padding: 0,
//                       textDecoration: "none",
//                       width: "100%",
//                       height: "100%",
//                       display: "block",
//                     }}
//                   >
//                     <AuctionCard auction={auction} isDarkMode={isDarkMode} />
//                   </Button>
//                 </div>
//               ))
//             ) : (
//               <p>No {status} auctions available.</p>
//             )}
//           </div>
//         </section>
//       ))}

//       {/* ✅ Contact Section */}
//       <div className="contact-section">
//         <Contact />
//       </div>

//       {/* ✅ Footer */}
//       <footer
//         style={{
//           backgroundColor: "#000",
//           color: "#fff",
//           padding: "10px 0",
//           textAlign: "center",
//           width: "100%",
//           marginTop: "40px",
//         }}
//       >
//       </footer>

//       {/* ✅ Login Modal */}
//       <LoginModal
//         show={showLoginModal}
//         onYes={handleModalYes}
//         onCancel={() => setShowLoginModal(false)}
//       />
//     </div>
//   );
// };

// export default Dashboard;
