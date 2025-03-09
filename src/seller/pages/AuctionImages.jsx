
import React from "react";

const AuctionImages = ({
  auction,
  currentImageIndex,
  setCurrentImageIndex,
  handleTouchStart,
  handleTouchMove,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleThumbnailClick,
  isEditing,
  editedAuction,
  handleRemoveExistingImage,
  newImages,
  handleNewImageSelect,
  handleRemoveNewImage
}) => {
  return (
    <>
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
            <button
              className="carousel-btn prev-btn"
              onClick={() => setCurrentImageIndex(prev => prev - 1)}
            >
              ‹
            </button>
          )}
          <img
            src={auction.imageUrls[currentImageIndex]}
            alt={`Main view ${currentImageIndex + 1}`}
            className="main-image"
          />
          {currentImageIndex < auction.imageUrls.length - 1 && (
            <button
              className="carousel-btn next-btn"
              onClick={() => setCurrentImageIndex(prev => prev + 1)}
            >
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
   
      {isEditing && (
        <div className="edit-images">
          <h3>Existing Images</h3>
          <div className="image-preview-list">
            {editedAuction.imageUrls.map((url) => (
              <div key={url} className="image-preview">
                <img src={url} alt="Existing" />
                <button type="button" onClick={() => handleRemoveExistingImage(url)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
          <h3>Add New Images</h3>
          <div className="image-preview-list">
            {newImages.map((file, index) => (
              <div key={index} className="image-preview">
                <img src={URL.createObjectURL(file)} alt="New" />
                <button type="button" onClick={() => handleRemoveNewImage(file)}>
                  Remove
                </button>
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
    </>
  );
};

export default AuctionImages;
