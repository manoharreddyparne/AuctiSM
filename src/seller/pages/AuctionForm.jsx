import React from "react";

const AuctionForm = ({
  isEditing,
  toggleEdit,
  auctionStatus,
  editedAuction,
  handleInputChange,
  decrementPrice,
  incrementPrice,
  auction,
  countdown,
  handleSave,
  handleDelete,
}) => {
  return (
    <>
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
                    {["Electronics", "Fashion", "Home", "Books", "Other"].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
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
                    <button type="button" onClick={decrementPrice}>
                      -
                    </button>
                    <input
                      type="number"
                      name="basePrice"
                      value={editedAuction.basePrice}
                      onChange={handleInputChange}
                      style={{ width: "80px" }}
                    />
                    <button type="button" onClick={incrementPrice}>
                      +
                    </button>
                  </div>
                </label>
                <label>
                  Start Date & Time:
                  <input
                    type="datetime-local"
                    name="startDateTime"
                    value={editedAuction.startDateTime}
                    onChange={handleInputChange}
                    disabled={auctionStatus !== "upcoming"}
                  />
                </label>
              </>
            ) : (
              <p>
                <em>You can only extend the auction end time.</em>
              </p>
            )}
            <label>
              End Date & Time:
              <input
                type="datetime-local"
                name="endDateTime"
                value={editedAuction.endDateTime}
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
      </div>
    </>
  );
};

export default AuctionForm;
