
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

  // Poll dark mode from localStorage instantly (0ms interval)
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "enabled");
  useEffect(() => {
    const interval = setInterval(() => {
      const currentDark = localStorage.getItem("darkMode") === "enabled";
      setDarkMode(currentDark);
    }, 0);
    return () => clearInterval(interval);
  }, []);

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

  const addUniqueFiles = (files) => {
    const uniqueFiles = files.filter((file) => {
      return !formData.images.some(
        (existing) => existing.name === file.name && existing.size === file.size
      );
    });
    return uniqueFiles;
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const uniqueFiles = addUniqueFiles(files);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...uniqueFiles] }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const uniqueFiles = addUniqueFiles(files);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...uniqueFiles] }));
  };

  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const incrementPrice = () => {
    const currentPrice = formData.basePrice === "" ? 0 : parseInt(formData.basePrice, 10);
    setFormData((prev) => ({ ...prev, basePrice: (currentPrice + 100).toString() }));
  };

  const decrementPrice = () => {
    const currentPrice = formData.basePrice === "" ? 0 : parseInt(formData.basePrice, 10);
    const newPrice = Math.max(0, currentPrice - 100);
    setFormData((prev) => ({ ...prev, basePrice: newPrice.toString() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let tempErrors = {};
    const now = new Date();
    const start = new Date(formData.startDateTime);
    const end = new Date(formData.endDateTime);

    if (start - now < 60000) {
      tempErrors.startDateTime = "Start date/time must be at least 1 minute from now.";
    }
    if (end <= start) {
      tempErrors.endDateTime = "End date/time must be after the start date/time.";
    }
    if (formData.images.length < 3) {
      tempErrors.images = "Please select at least 3 images.";
    }
    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setIsCreating(true);

    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        console.error("User is not authenticated.");
        setIsCreating(false);
        return;
      }

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

      const uploadedImageUrls = await uploadImagesToS3(formData.images);
      if (uploadedImageUrls.length < 3) {
        console.error("Image upload failed or insufficient images.");
        setIsCreating(false);
        return;
      }

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

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auctions/create`, {
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
      navigate(`/mainpage/my-auctions/${createdAuction._id}`, { replace: true });
    } catch (error) {
      console.error("Error saving auction data:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isCreating) {
    return <LoadingOverlay message="Creating auction, please wait..." />;
  }

  return (
    <div className={`create-auction-container ${darkMode ? "dark" : "light"}`}>
      <button className="back-arrow" onClick={() => navigate("/mainpage/my-auctions")}>
        &#8592; Back to My Auctions
      </button>
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
