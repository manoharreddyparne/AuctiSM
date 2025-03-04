import React from "react";
import CreateAuction from "./CreateAuction";

const SellerDashboard = () => {
  return (
    <div className="seller-dashboard">
      <h1>Seller Dashboard</h1>
      {/* Render the Create Auction Form */}
      <CreateAuction />
    </div>
  );
};

export default SellerDashboard;
