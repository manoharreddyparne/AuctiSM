// src/seller/pages/AuctionDetail.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadImagesToS3, deleteImageFromS3 } from "../../utils/uploadS3";
import "./AuctionDetail.css";
import ConfirmDeleteModal from "../../shared_components/ConfirmDeleteModal";
import LoadingOverlay from "../../shared_components/LoadingOverlay";
import AuctionImages from "./AuctionImages";
import AuctionForm from "./AuctionForm";
import BidUpdates from "../components/BidUpdates";
import BidRanking from "../../users_dashboard/BidRanking";

// Helper function to format a date as "YYYY-MM-DDTHH:mm" in local time.
const formatDateTimeLocal = (dateInput) => {
  const dt = new Date(dateInput);
  const pad = (n) => (n < 10 ? "0" + n : n);
  const year = dt.getFullYear();
  const month = pad(dt.getMonth() + 1);
  const day = pad(dt.getDate());
  const hours = pad(dt.getHours());
  const minutes = pad(dt.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const AuctionDetail = () => {
  // Always call hooks at the top
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");

  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "enabled");
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAuction, setEditedAuction] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [newImages, setNewImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const dragStartXRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Dark mode polling (hooks are always called)
  useEffect(() => {
    const interval = setInterval(() => {
      setDarkMode(localStorage.getItem("darkMode") === "enabled");
    }, 0);
    return () => clearInterval(interval);
  }, []);

  // Fetch auction details and convert date/time fields using the helper
  useEffect(() => {
    if (!auctionId) {
      console.error("Error: Auction ID is missing from the URL.");
      return;
    }
    const fetchAuction = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auctions/${auctionId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          data.startDateTime = formatDateTimeLocal(data.startDateTime);
          data.endDateTime = formatDateTimeLocal(data.endDateTime);
          setAuction(data);
          setEditedAuction(data);
        } else {
          console.error("Error fetching auction", response.status);
        }
      } catch (error) {
        console.error("Error fetching auction", error);
      }
      setLoading(false);
    };
    fetchAuction();
  }, [auctionId, authToken]);

  const getAuctionStatus = () => {
    if (!auction) return "";
    const now = new Date();
    const startTime = new Date(auction.startDateTime);
    const endTime = new Date(auction.endDateTime);
    if (now >= endTime) return "completed";
    if (now >= startTime) return "started";
    return "upcoming";
  };

  const auctionStatus = getAuctionStatus();

  // Countdown timer
  useEffect(() => {
    if (auction) {
      const timer = setInterval(() => {
        const now = new Date();
        const startTime = new Date(auction.startDateTime);
        const endTime = new Date(auction.endDateTime);
        if (now >= endTime) {
          setCountdown("Auction Completed");
          clearInterval(timer);
        } else if (now < startTime) {
          let remaining = startTime - now;
          const years = Math.floor(remaining / (1000 * 60 * 60 * 24 * 365));
          remaining -= years * (1000 * 60 * 60 * 24 * 365);
          const months = Math.floor(remaining / (1000 * 60 * 60 * 24 * 30));
          remaining -= months * (1000 * 60 * 60 * 24 * 30);
          const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
          remaining -= days * (1000 * 60 * 60 * 24);
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          remaining -= hours * (1000 * 60 * 60);
          const minutes = Math.floor(remaining / (1000 * 60));
          remaining -= minutes * (1000 * 60);
          const seconds = Math.floor(remaining / 1000);
          let display = "";
          if (years > 0) display += `${years}y `;
          if (months > 0) display += `${months}mo `;
          if (days > 0 || (!years && !months)) display += `${days}d `;
          display += `${hours}h ${minutes}m ${seconds}s`;
          setCountdown("Auction Starts In: " + display);
        } else {
          let remaining = new Date(auction.endDateTime) - now;
          const years = Math.floor(remaining / (1000 * 60 * 60 * 24 * 365));
          remaining -= years * (1000 * 60 * 60 * 24 * 365);
          const months = Math.floor(remaining / (1000 * 60 * 60 * 24 * 30));
          remaining -= months * (1000 * 60 * 60 * 24 * 30);
          const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
          remaining -= days * (1000 * 60 * 60 * 24);
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          remaining -= hours * (1000 * 60 * 60);
          const minutes = Math.floor(remaining / (1000 * 60));
          remaining -= minutes * (1000 * 60);
          const seconds = Math.floor(remaining / 1000);
          let display = "";
          if (years > 0) display += `${years}y `;
          if (months > 0) display += `${months}mo `;
          if (days > 0 || (!years && !months)) display += `${days}d `;
          display += `${hours}h ${minutes}m ${seconds}s`;
          setCountdown("Auction Started. Ends In: " + display);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [auction]);

  // Delete auction functions
  const handleDelete = async () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auctions/${auctionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        navigate("/mainpage/my-auctions");
      } else {
        console.error("Error deleting auction");
      }
    } catch (error) {
      console.error("Error deleting auction", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Save auction changes handler
  const handleSaveChanges = async () => {
    const now = new Date();
    const newStart = new Date(editedAuction.startDateTime);
    const newEnd = new Date(editedAuction.endDateTime);
    if (auctionStatus === "upcoming" && newStart < now) return;
    if (newEnd <= newStart) return;
    setIsSaving(true);
    let newImageUrls = [];
    if (newImages.length > 0) {
      newImageUrls = await uploadImagesToS3(newImages);
    }
    for (const url of removedImages) {
      try {
        await deleteImageFromS3(url);
      } catch (error) {
        console.error("Error deleting image from S3:", error);
      }
    }
    const finalImageUrls = [...editedAuction.imageUrls, ...newImageUrls];
    const updatedAuctionData = { ...editedAuction, imageUrls: finalImageUrls };
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auctions/${auctionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedAuctionData),
      });
      if (res.ok) {
        const updated = await res.json();
        setAuction(updated);
        setEditedAuction(updated);
        setIsEditing(false);
        setNewImages([]);
        setRemovedImages([]);
      } else {
        console.error("Error updating auction");
      }
    } catch (error) {
      console.error("Error updating auction", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!auction) return <p>Auction not found.</p>;

  return (
    <div className={`auction-detail ${darkMode ? "dark" : "light"}`}>
      <div className="header-section">
        <button className="back-arrow" onClick={() => navigate("/mainpage/my-auctions")}>
          &#8592; Back to Auctions
        </button>
        <div className="product-name-container">
          <h1>{auction.productName}</h1>
        </div>
      </div>
      <div className="countdown">
        <strong>Auction Status: </strong> {countdown}
      </div>

      {/* Seller bid monitoring: display BidUpdates and BidRanking side by side */}
      <div className="bid-info-container">
        <div className="bid-updates-wrapper">
        <BidUpdates auctionId={auctionId} authToken={authToken} registrations={auction.registeredUsers} />

        </div>
        <div className="bid-ranking-wrapper">
          {auction.bids && auction.bids.length > 0 && (
            <BidRanking bids={auction.bids} registrations={auction.registeredUsers} />
          )}
        </div>
      </div>

      {/* Auction Images */}
      <AuctionImages 
        auction={auction}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
        dragStartXRef={dragStartXRef}
        isDraggingRef={isDraggingRef}
        handleTouchStart={(e) => { dragStartXRef.current = e.touches[0].clientX; }}
        handleTouchMove={(e) => {
          if (!dragStartXRef.current) return;
          const diffX = dragStartXRef.current - e.touches[0].clientX;
          if (diffX > 50) { 
            setCurrentImageIndex((prev) => prev + 1); 
            dragStartXRef.current = null; 
          } else if (diffX < -50) { 
            setCurrentImageIndex((prev) => prev - 1); 
            dragStartXRef.current = null; 
          }
        }}
        handleMouseDown={(e) => { isDraggingRef.current = true; dragStartXRef.current = e.clientX; }}
        handleMouseMove={(e) => {
          if (!isDraggingRef.current || dragStartXRef.current === null) return;
          const diffX = dragStartXRef.current - e.clientX;
          if (diffX > 50) { 
            setCurrentImageIndex((prev) => prev + 1); 
            isDraggingRef.current = false; 
          } else if (diffX < -50) { 
            setCurrentImageIndex((prev) => prev - 1); 
            isDraggingRef.current = false; 
          }
        }}
        handleMouseUp={() => { isDraggingRef.current = false; dragStartXRef.current = null; }}
        handleThumbnailClick={(index) => setCurrentImageIndex(index)}
      />

      {/* Auction editing form for the seller */}
      <AuctionForm 
        isEditing={isEditing}
        toggleEdit={() => setIsEditing((prev) => !prev)}
        auctionStatus={auctionStatus}
        editedAuction={editedAuction}
        handleInputChange={(e) => {
          const { name, value } = e.target;
          setEditedAuction((prev) => ({ ...prev, [name]: value }));
        }}
        decrementPrice={() => {
          const currentPrice = parseInt(editedAuction.basePrice || "0", 10);
          const newPrice = Math.max(0, currentPrice - 100);
          setEditedAuction((prev) => ({ ...prev, basePrice: newPrice.toString() }));
        }}
        incrementPrice={() => {
          const currentPrice = parseInt(editedAuction.basePrice || "0", 10);
          setEditedAuction((prev) => ({ ...prev, basePrice: (currentPrice + 100).toString() }));
        }}
        auction={auction}
        countdown={countdown}
        handleSave={handleSaveChanges}
        handleDelete={handleDelete}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
      {isSaving && <LoadingOverlay message="Saving changes, please wait..." />}
      {isDeleting && <LoadingOverlay message="Deleting auction, please wait..." />}
    </div>
  );
};

export default AuctionDetail;
