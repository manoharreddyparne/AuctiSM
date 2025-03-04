import React, { useState, useRef, useEffect } from "react";
import "./CreateAuction.css";

// Debug logs to check environment variables
console.log("Bucket:", process.env.REACT_APP_AWS_BUCKET_NAME);
console.log("Region:", process.env.REACT_APP_AWS_REGION);

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
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const categories = ["Electronics", "Fashion", "Home", "Books", "Other"];

  // Set minimum datetime for auction start as current datetime
  useEffect(() => {
    const now = new Date();
    const isoString = now.toISOString().slice(0, 16);
    setMinStartDateTime(isoString);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For basePrice, keep it as string so the field can be cleared
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

  // Increment and decrement for base price (treat empty string as 0)
  const incrementPrice = () => {
    const currentPrice = formData.basePrice === "" ? 0 : parseInt(formData.basePrice, 10);
    setFormData((prev) => ({ ...prev, basePrice: (currentPrice + 100).toString() }));
  };

  const decrementPrice = () => {
    const currentPrice = formData.basePrice === "" ? 0 : parseInt(formData.basePrice, 10);
    const newPrice = Math.max(0, currentPrice - 100);
    setFormData((prev) => ({ ...prev, basePrice: newPrice.toString() }));
  };

  // Helper function to upload images to S3 via pre-signed URLs
  const uploadImagesToS3 = async (images) => {
    const uploadedImageUrls = [];
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      // Request pre-signed URL from the backend (adjust URL for production as needed)
      const response = await fetch("http://localhost:5000/api/aws/s3/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type
        })
      });
      if (!response.ok) {
        console.error("Failed to get pre-signed URL for:", file.name);
        continue;
      }
      // Destructure both uploadURL and fileKey from the response
      const { uploadURL, fileKey } = await response.json();
      if (!uploadURL || !fileKey) {
        console.error("Invalid response for:", file.name);
        continue;
      }
      // Upload file directly to S3 using the pre-signed URL
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        headers: {
          "Content-Type": file.type
        },
        body: file
      });
      if (uploadResponse.ok) {
        // Construct the S3 file URL using fileKey (not the original file name)
        const s3Url = `https://${process.env.REACT_APP_AWS_BUCKET_NAME}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/${fileKey}`;
        uploadedImageUrls.push(s3Url);
      } else {
        console.error("Error uploading image to S3:", file.name);
      }
    }
    return uploadedImageUrls;
  };

  // Modified handleSubmit to upload images after auction creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    let tempErrors = {};
    const now = new Date();
    const start = new Date(formData.startDateTime);
    const end = new Date(formData.endDateTime);

    if (start.getTime() - now.getTime() < 60000) {
      tempErrors.startDateTime =
        "Start date/time must be at least 1 minute before creating the auction";
    }
    if (end <= start) {
      tempErrors.endDateTime = "End date/time must be after start date/time.";
    }
    if (formData.images.length < 3) {
      tempErrors.images = "Please select at least 3 images.";
    }
    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    // Convert basePrice to number when needed
    const auctionData = {
      ...formData,
      basePrice: parseInt(formData.basePrice, 10) || 0
    };

    console.log("Auction Data:", auctionData);

    // Upload images to S3 and retrieve their URLs
    const uploadedImageUrls = await uploadImagesToS3(formData.images);
    console.log("Uploaded Image URLs:", uploadedImageUrls);

    // Optionally, you can now include these URLs in your auctionData object
    // or send them to your backend to update your auction record.

    // Show success message
    setSubmissionSuccess(true);

    // Clear the form
    setFormData(initialState);
    setIsOther(false);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  // After submission, automatically revert back to the create auction form after 3 seconds
  useEffect(() => {
    if (submissionSuccess) {
      const timer = setTimeout(() => {
        setSubmissionSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submissionSuccess]);

  if (submissionSuccess) {
    return (
      <div className="create-auction-container">
        <h2>Auction Submitted Successfully!</h2>
        <p>You will be redirected to create a new auction shortly...</p>
      </div>
    );
  }

  return (
    <div className="create-auction-container">
      <h2>Create Auction</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name:</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Product Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Category:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        {isOther && (
          <div className="form-group">
            <label>Specify New Category:</label>
            <input
              type="text"
              name="newCategory"
              value={formData.newCategory}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label>Product Images:</label>
          <div
            className="image-dropzone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <span className="plus-sign">+</span>
            <p>Drag & drop images here or click to select</p>
            <input
              type="file"
              ref={fileInputRef}
              name="images"
              onChange={handleImageSelect}
              multiple
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>
          {errors.images && <p className="error">{errors.images}</p>}
          <div className="selected-images">
            {formData.images.map((file, index) => (
              <div key={index} className="image-preview">
                <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => removeImage(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Base Price:</label>
          <div className="base-price-container">
            <button type="button" onClick={decrementPrice}>
              -
            </button>
            <input
              type="number"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleChange}
              required
            />
            <button type="button" onClick={incrementPrice}>
              +
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>Auction Start Date & Time:</label>
          <input
            type="datetime-local"
            name="startDateTime"
            value={formData.startDateTime}
            onChange={handleChange}
            min={minStartDateTime}
            required
          />
          {errors.startDateTime && (
            <p className="error">{errors.startDateTime}</p>
          )}
        </div>
        <div className="form-group">
          <label>Auction End Date & Time:</label>
          <input
            type="datetime-local"
            name="endDateTime"
            value={formData.endDateTime}
            onChange={handleChange}
            min={formData.startDateTime || minStartDateTime}
            required
          />
          {errors.endDateTime && (
            <p className="error">{errors.endDateTime}</p>
          )}
        </div>
        <button type="submit">Create Auction</button>
      </form>
    </div>
  );
};

export default CreateAuction;
