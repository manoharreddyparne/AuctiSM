// src/seller/components/AuctionForm.jsx
import React from "react";
import "./CreateAuction.css";

const AuctionForm = ({
  formData,
  handleChange,
  handleSubmit,
  handleImageSelect,
  handleDragOver,
  handleDrop,
  removeImage,
  incrementPrice,
  decrementPrice,
  errors,
  minStartDateTime,
  fileInputRef,
  isOther
}) => {
  const categories = ["Electronics", "Fashion", "Home", "Books", "Other"];

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

export default AuctionForm;
