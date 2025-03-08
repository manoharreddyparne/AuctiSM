// src/seller/services/auctionService.js

/**
 * Fetch auctions for the logged-in seller.
 * @param {string} authToken - JWT authentication token
 * @returns {Array} List of auction objects or an empty array if error occurs.
 */
export const fetchSellerAuctions = async (authToken) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auctions/myAuctions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        return await response.json();
      } else {
        console.error("Failed to fetch auctions. Status:", response.status);
        return [];
      }
    } catch (error) {
      console.error("Error fetching auctions:", error);
      return [];
    }
  };
  