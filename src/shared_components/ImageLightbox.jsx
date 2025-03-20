import React, { useState, useEffect, useRef, useCallback } from "react";
import Modal from "react-bootstrap/Modal";

const ImageLightbox = ({ images, initialIndex = 0, onClose, darkMode, productTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartX = useRef(null);
  const mouseStartX = useRef(null);
  const isMouseDown = useRef(false);

  const nextImage = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowRight") nextImage();
      else if (event.key === "ArrowLeft") prevImage();
      else if (event.key === "Escape") onClose();
    },
    [nextImage, prevImage, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);


  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    const touchEndX = event.changedTouches[0].clientX;
    const deltaX = touchStartX.current - touchEndX;
    if (deltaX > 50) nextImage();
    else if (deltaX < -50) prevImage();
  };

  const handleMouseDown = (event) => {
    isMouseDown.current = true;
    mouseStartX.current = event.clientX;
  };

  const handleMouseUp = (event) => {
    if (!isMouseDown.current) return;
    const deltaX = mouseStartX.current - event.clientX;
    if (deltaX > 50) nextImage();
    else if (deltaX < -50) prevImage();
    isMouseDown.current = false;
  };

  return (
    <Modal show onHide={onClose} centered size="lg" className="fade modal show">
      <div className={`modal-dialog modal-lg modal-dialog-centered ${darkMode ? "modal-dark" : ""}`}>
        <div className={`modal-content ${darkMode ? "modal-dark-content" : ""}`}>
          <Modal.Header closeButton>
            <Modal.Title>{productTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body
            className={`d-flex flex-column align-items-center justify-content-center ${darkMode ? "lightbox-dark" : ""}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            style={{ width: "100%", height: "80vh", overflow: "hidden" }}
          >
            {images.length > 0 && (
              <>
                <img
                  src={images[currentIndex]}
                  alt={`Slide ${currentIndex + 1}`}
                  className="lightbox-image"
                />
                <div className="image-indicator">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </Modal.Body>
        </div>
      </div>
      <style>
        {`
          .lightbox-image {
            width: auto;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            border-radius: 8px;
            display: block;
          }
          .modal-body {
            display: flex;
            align-items: center;
            justify-content: center;
            max-width: 90vw;
            max-height: 80vh;
            overflow: hidden;
          }
          .image-indicator {
            position: absolute;
            bottom: 15px;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            padding: 5px 10px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: bold;
          }
          .lightbox-dark {
            background-color: black !important;
            color: white;
            border-radius: 8px;
            padding: 10px;
            transition: background-color 0.3s ease, color 0.3s ease;
          }
          .modal-dark .modal-content,
          .modal-dark-content {
            background-color: #121212 !important;
            color: white !important;
            border: none !important;
            transition: background-color 0.3s ease, color 0.3s ease;
          }
          @media (max-width: 768px) {
            .lightbox-image {
              max-width: 95vw;
              max-height: 75vh;
            }
          }
        `}
      </style>
    </Modal>
  );
};

export default ImageLightbox;
