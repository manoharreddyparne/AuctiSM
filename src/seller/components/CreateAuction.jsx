// src/seller/components/CreateAuction.jsx
import React, { useState, useRef, useEffect } from "react";
import "./CreateAuction.css";
import { jwtDecode } from "jwt-decode";
import AuctionForm from "./AuctionForm";
import { uploadImagesToS3 } from "../../utils/uploadS3";
import LoadingOverlay from "../../shared_components/LoadingOverlay";
import { useNavigate } from "react-router-dom";

const CreateAuction = () => {
  const initialState = {
    productName: "",
    description: "",
    category: "",
    newCategory: "",
    basePrice: "",
    startDateTime: "",
    endDateTime: "",
    images: []
  };

  const [formData, setFormData] = useState(initialState);
  const [isOther, setIsOther] = useState(false);
  const [errors, setErrors] = useState({});
  const [minStartDateTime, setMinStartDateTime] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Set minimum datetime for auction start as current datetime
  useEffect(() => {
    const now = new Date();
    const isoString = now.toISOString().slice(0, 16);
    setMinStartDateTime(isoString);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "category") {
      setIsOther(value === "Other");
    }
  };

  // Filter out duplicate images based on name and size.
  const addUniqueFiles = (files) => {
    const uniqueFiles = files.filter((file) => {
      return !formData.images.some(
        (existing) => existing.name === file.name && existing.size === file.size
      );
    });
    return uniqueFiles;
  };

  // Handle image selection from file dialog
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const uniqueFiles = addUniqueFiles(files);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...uniqueFiles] }));
  };

  // Handle drag and drop for images
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const uniqueFiles = addUniqueFiles(files);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...uniqueFiles] }));
  };

  // Remove selected image by index
  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Increment and decrement for base price
  const incrementPrice = () => {
    const currentPrice = formData.basePrice === "" ? 0 : parseInt(formData.basePrice, 10);
    setFormData((prev) => ({ ...prev, basePrice: (currentPrice + 100).toString() }));
  };

  const decrementPrice = () => {
    const currentPrice = formData.basePrice === "" ? 0 : parseInt(formData.basePrice, 10);
    const newPrice = Math.max(0, currentPrice - 100);
    setFormData((prev) => ({ ...prev, basePrice: newPrice.toString() }));
  };

  // Submission handler that validates and uploads images before sending auction data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    let tempErrors = {};
    const now = new Date();
    const start = new Date(formData.startDateTime);
    const end = new Date(formData.endDateTime);

    // Validate Start Date & Time
    if (start - now < 60000) {
      tempErrors.startDateTime = "Start date/time must be at least 1 minute from now.";
    }
    // Validate End Date & Time
    if (end <= start) {
      tempErrors.endDateTime = "End date/time must be after the start date/time.";
    }
    // Validate Image Count
    if (formData.images.length < 3) {
      tempErrors.images = "Please select at least 3 images.";
    }
    // If any validation errors exist, stop form submission
    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setIsCreating(true); // Show loading overlay

    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        console.error("User is not authenticated.");
        setIsCreating(false);
        return;
      }

      // Decode JWT securely to extract user ID
      let userId;
      try {
        const decodedToken = jwtDecode(authToken);
        userId = decodedToken.userId;
      } catch (error) {
        console.error("Invalid JWT token:", error);
        setIsCreating(false);
        return;
      }
      if (!userId) {
        console.error("User ID missing in token.");
        setIsCreating(false);
        return;
      }

      // Upload images to S3 using the utility function
      const uploadedImageUrls = await uploadImagesToS3(formData.images);
      if (uploadedImageUrls.length < 3) {
        console.error("Image upload failed or insufficient images.");
        setIsCreating(false);
        return;
      }

      // Prepare auction data
      const auctionData = {
        sellerId: userId,
        productName: formData.productName,
        description: formData.description,
        category: formData.category === "Other" ? formData.newCategory : formData.category,
        basePrice: parseInt(formData.basePrice, 10) || 0,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        imageUrls: uploadedImageUrls
      };

      const response = await fetch("http://localhost:5000/api/auctions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(auctionData)
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Failed to save auction data. Server Response:", errorDetails);
        throw new Error("Failed to save auction data.");
      }

      const createdAuction = await response.json();
      // Redirect to the auction detail page after creation
      navigate(`/mainpage/my-auctions/${createdAuction._id}`, { replace: true });
    } catch (error) {
      console.error("Error saving auction data:", error);
    } finally {
      setIsCreating(false); // Hide loading overlay
    }
  };

  if (isCreating) {
    return <LoadingOverlay message="Creating auction, please wait..." />;
  }

  return (
    <div className="create-auction-container">
      {/* Back Arrow Button */}
      <button className="back-arrow" onClick={() => navigate("/mainpage/my-auctions")}>
        &#8592; Back to My Auctions
      </button>
      {/* AuctionForm should contain the title if needed */}
      <AuctionForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleImageSelect={handleImageSelect}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        removeImage={removeImage}
        incrementPrice={incrementPrice}
        decrementPrice={decrementPrice}
        errors={errors}
        minStartDateTime={minStartDateTime}
        fileInputRef={fileInputRef}
        isOther={isOther}
      />
    </div>
  );
};

export default CreateAuction;
