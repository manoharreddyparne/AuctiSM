// src/seller/pages/AuctionDetail.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadImagesToS3, deleteImageFromS3 } from "../../utils/uploadS3"; // Make sure deleteImageFromS3 is implemented or stubbed
import "./AuctionDetail.css";
import ConfirmDeleteModal from "../../shared_components/ConfirmDeleteModal";

const AuctionDetail = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAuction, setEditedAuction] = useState(null);
  const [countdown, setCountdown] = useState("");
  // New state for image editing
  const [newImages, setNewImages] = useState([]);         // Files added in edit mode
  const [removedImages, setRemovedImages] = useState([]);     // URLs marked for deletion

  // For swipe/drag support
  const dragStartXRef = useRef(null);
  const isDraggingRef = useRef(false);

  const categories = ["Electronics", "Fashion", "Home", "Books", "Other"];

  // Fetch auction details
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auctions/${auctionId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAuction(data);
          setEditedAuction(data); // initialize edit fields
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

  // Determine auction status
  const getAuctionStatus = () => {
    if (!auction) return "";
    const now = new Date();
    const startTime = new Date(auction.startDateTime);
    const endTime = new Date(auction.endDateTime);
    if (now >= endTime) {
      return "completed";
    } else if (now >= startTime) {
      return "started";
    } else {
      return "upcoming";
    }
  };

  const auctionStatus = getAuctionStatus();

  // Countdown timer: if auction hasn't started, count down to start;
  // if started, count down to end; if ended, show completed.
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
          // Auction has started; count down to end time.
          let remaining = endTime - now;
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

  // Image navigation functions
  const nextImage = () => {
    if (auction && currentImageIndex < auction.imageUrls.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const prevImage = () => {
    if (auction && currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  // Touch and mouse swipe handlers
  const handleTouchStart = (e) => {
    dragStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!dragStartXRef.current) return;
    const diffX = dragStartXRef.current - e.touches[0].clientX;
    if (diffX > 50) {
      nextImage();
      dragStartXRef.current = null;
    } else if (diffX < -50) {
      prevImage();
      dragStartXRef.current = null;
    }
  };

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || dragStartXRef.current === null) return;
    const diffX = dragStartXRef.current - e.clientX;
    if (diffX > 50) {
      nextImage();
      isDraggingRef.current = false;
    } else if (diffX < -50) {
      prevImage();
      isDraggingRef.current = false;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    dragStartXRef.current = null;
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  // Handle changes in edit form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedAuction((prev) => ({ ...prev, [name]: value }));
  };

  const incrementPrice = () => {
    const currentPrice = parseInt(editedAuction.basePrice || "0", 10);
    setEditedAuction((prev) => ({ ...prev, basePrice: (currentPrice + 100).toString() }));
  };
  
  const decrementPrice = () => {
    const currentPrice = parseInt(editedAuction.basePrice || "0", 10);
    const newPrice = Math.max(0, currentPrice - 100);
    setEditedAuction((prev) => ({ ...prev, basePrice: newPrice.toString() }));
  };
  
  // Handle removal of an existing image
  const handleRemoveExistingImage = (url) => {
    // Remove image from editedAuction.imageUrls and mark for deletion
    setEditedAuction((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((imgUrl) => imgUrl !== url)
    }));
    setRemovedImages((prev) => [...prev, url]);
    // Adjust currentImageIndex if needed
    if (currentImageIndex >= editedAuction.imageUrls.length - 1) {
      setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
    }
  };


  // Handle selection of new images
  const handleNewImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
  };

  // Handle removal of a newly added image (before upload)
  const handleRemoveNewImage = (file) => {
    setNewImages((prev) => prev.filter((f) => f !== file));
  };

  // Handle Save: validate dates, upload new images, delete removed images, and update auction
  const handleSave = async () => {
    const now = new Date();
    const newStart = new Date(editedAuction.startDateTime);
    const newEnd = new Date(editedAuction.endDateTime);
    if (auctionStatus === "upcoming" && newStart < now) {
      alert("Start date/time cannot be in the past.");
      return;
    }
    if (newEnd <= newStart) {
      alert("End date/time must be after the start date/time.");
      return;
    }

    // Upload new images if any
    let newImageUrls = [];
    if (newImages.length > 0) {
      newImageUrls = await uploadImagesToS3(newImages);
    }

    // Optionally delete images marked for removal from S3
    // (Assuming deleteImageFromS3 returns a promise)
    for (const url of removedImages) {
      try {
        await deleteImageFromS3(url);
      } catch (error) {
        console.error("Error deleting image from S3:", error);
      }
    }

    // Build final images array: existing images (after removal) + newly uploaded images
    const finalImageUrls = [...editedAuction.imageUrls, ...newImageUrls];

    const updatedAuctionData = {
      ...editedAuction,
      imageUrls: finalImageUrls
    };

    try {
      const res = await fetch(`http://localhost:5000/api/auctions/${auctionId}`, {
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
        // Reset new and removed images arrays
        setNewImages([]);
        setRemovedImages([]);
        alert("Auction updated successfully");
      } else {
        console.error("Error updating auction");
      }
    } catch (error) {
      console.error("Error updating auction", error);
    }
  };

  // Handle delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

const handleDelete = async () => {
  setIsDeleteModalOpen(true); // Open the confirmation modal
};

const confirmDelete = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/auctions/${auctionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (res.ok) {
      alert("Auction deleted successfully");
      navigate("/mainpage/my-auctions");
    } else {
      console.error("Error deleting auction");
    }
  } catch (error) {
    console.error("Error deleting auction", error);
  } finally {
    setIsDeleteModalOpen(false); // Close the modal after deletion attempt
  }
};


  if (loading) return <p>Loading...</p>;
  if (!auction) return <p>Auction not found.</p>;

  return (
    <div className="auction-detail">
      <h1>{auction.productName}</h1>
      <div className="countdown">
        <strong>Auction Status: </strong> {countdown}
      </div>
      {/* Image Gallery */}
      <div
        className="image-gallery"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="main-image-container">
          {currentImageIndex > 0 && (
            <button className="carousel-btn prev-btn" onClick={prevImage}>
              ‹
            </button>
          )}
          <img
            src={auction.imageUrls[currentImageIndex]}
            alt={`Main view ${currentImageIndex + 1}`}
            className="main-image"
          />
          {currentImageIndex < auction.imageUrls.length - 1 && (
            <button className="carousel-btn next-btn" onClick={nextImage}>
              ›
            </button>
          )}
        </div>
        <div className="dot-indicators">
          {auction.imageUrls.map((_, index) => (
            <span
              key={index}
              className={`dot ${currentImageIndex === index ? "active" : ""}`}
              onClick={() => handleThumbnailClick(index)}
            />
          ))}
        </div>
      </div>
      {/* Edit Images Section (visible in edit mode) */}
      {isEditing && (
        <div className="edit-images">
          <h3>Existing Images</h3>
          <div className="image-preview-list">
            {editedAuction.imageUrls.map((url) => (
              <div key={url} className="image-preview">
                <img src={url} alt="Existing" />
                <button type="button" onClick={() => handleRemoveExistingImage(url)}>Remove</button>
              </div>
            ))}
          </div>
          <h3>Add New Images</h3>
          <div className="image-preview-list">
            {newImages.map((file, index) => (
              <div key={index} className="image-preview">
                <img src={URL.createObjectURL(file)} alt="New" />
                <button type="button" onClick={() => handleRemoveNewImage(file)}>Remove</button>
              </div>
            ))}
          </div>
          <input
            type="file"
            multiple
            onChange={handleNewImageSelect}
            style={{ marginTop: "10px" }}
          />
        </div>
      )}
      {/* Auction Information / Edit Form */}
      <div className="auction-info">
        {isEditing ? (
          <>
            {auctionStatus === "upcoming" ? (
              <>
                <label>
                  Product Name:
                  <input
                    type="text"
                    name="productName"
                    value={editedAuction.productName}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Description:
                  <textarea
                    name="description"
                    value={editedAuction.description}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Category:
                  <select
                    name="category"
                    value={editedAuction.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {editedAuction.category === "Other" && (
                    <input
                      type="text"
                      name="newCategory"
                      value={editedAuction.newCategory || ""}
                      onChange={handleInputChange}
                      placeholder="Specify new category"
                    />
                  )}
                </label>
                <label>
                  Base Price:
                  <div className="price-adjust">
                    <button type="button" onClick={decrementPrice}>-</button>
                    <input
                      type="number"
                      name="basePrice"
                      value={editedAuction.basePrice}
                      onChange={handleInputChange}
                      style={{ width: "80px" }}
                    />
                    <button type="button" onClick={incrementPrice}>+</button>
                  </div>
                </label>
              </>
            ) : (
              <p><em>You can only extend the auction end time.</em></p>
            )}
            <label>
              Start Date & Time:
              <input
                type="datetime-local"
                name="startDateTime"
                value={new Date(editedAuction.startDateTime).toISOString().slice(0,16)}
                onChange={handleInputChange}
                disabled={auctionStatus !== "upcoming"}
              />
            </label>
            <label>
              End Date & Time:
              <input
                type="datetime-local"
                name="endDateTime"
                value={new Date(editedAuction.endDateTime).toISOString().slice(0,16)}
                onChange={handleInputChange}
              />
            </label>
          </>
        ) : (
          <>
            <p>{auction.description}</p>
            <p>Category: {auction.category}</p>
            <p>Base Price: ₹{auction.basePrice}</p>
            <p>Start: {new Date(auction.startDateTime).toLocaleString()}</p>
            <p>End: {new Date(auction.endDateTime).toLocaleString()}</p>
          </>
        )}
      </div>
      {/* Auction Actions */}
      <div className="auction-actions">
  {isEditing ? (
    <>
      <button onClick={handleSave}>Save Changes</button>
      <button onClick={toggleEdit}>Cancel</button>
    </>
  ) : (
    <>
      {auctionStatus === "upcoming" ? (
        <>
          <button onClick={toggleEdit}>Edit Auction</button>
          <button onClick={handleDelete}>Delete Auction</button>
        </>
      ) : (
        <button onClick={toggleEdit}>Extend Auction End Time</button>
      )}
    </>
  )}

  {/* Confirm Delete Modal */}
  <ConfirmDeleteModal
    isOpen={isDeleteModalOpen}
    onClose={() => setIsDeleteModalOpen(false)}
    onConfirm={confirmDelete}
  />
</div>

    </div>
  );
};

export default AuctionDetail;
