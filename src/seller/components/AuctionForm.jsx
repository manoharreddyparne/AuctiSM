
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
      <h2 className="text-center mb-4">Create Auction</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label className="form-label">Product Name:</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Product Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="form-control"
            rows="3"
          />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Category:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="form-select"
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
          <div className="form-group mb-3">
            <label className="form-label">Specify New Category:</label>
            <input
              type="text"
              name="newCategory"
              value={formData.newCategory}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
        )}
        <div className="form-group mb-3">
          <label className="form-label">Product Images:</label>
          <div
            className="image-dropzone mb-2 p-3"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <span className="plus-sign">+</span>
            <p className="mb-0">Drag & drop images here or click to select</p>
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
          <div className="selected-images d-flex flex-wrap gap-2 mt-2">
            {formData.images.map((file, index) => (
              <div key={index} className="image-preview position-relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                />
                <button
                  type="button"
                  className="remove-image-btn btn btn-danger btn-sm position-absolute top-0 end-0"
                  onClick={() => removeImage(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Base Price:</label>
          <div className="base-price-container d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={decrementPrice}
              className="btn btn-outline-secondary"
            >
              -
            </button>
            <input
              type="number"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleChange}
              required
              className="form-control"
            />
            <button
              type="button"
              onClick={incrementPrice}
              className="btn btn-outline-secondary"
            >
              +
            </button>
          </div>
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Auction Start Date & Time:</label>
          <input
            type="datetime-local"
            name="startDateTime"
            value={formData.startDateTime}
            onChange={handleChange}
            min={minStartDateTime}
            required
            className="form-control"
          />
          {errors.startDateTime && (
            <p className="error">{errors.startDateTime}</p>
          )}
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Auction End Date & Time:</label>
          <input
            type="datetime-local"
            name="endDateTime"
            value={formData.endDateTime}
            onChange={handleChange}
            min={formData.startDateTime || minStartDateTime}
            required
            className="form-control"
          />
          {errors.endDateTime && (
            <p className="error">{errors.endDateTime}</p>
          )}
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Create Auction
        </button>
      </form>
    </div>
  );
};

export default AuctionForm;
