import React from "react";

const Pagination = ({ visibleItems, totalItems, onLoadMore }) => {
  return (
    <>
      {visibleItems < totalItems && (
        <div className="text-center mt-3">
          <span
            onClick={() => onLoadMore(Math.min(visibleItems + 7, totalItems))}
            className="text-primary fw-bold"
            style={{ cursor: "pointer", display: "block", padding: "10px" }}>
            {visibleItems + 7 < totalItems ? "See More..." : "see Last"}
          </span>
        </div>
      )}
    </>
  );
};

export default Pagination;
