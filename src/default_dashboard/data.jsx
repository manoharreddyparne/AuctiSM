// data.jsx
const auctionData = [
  // Ongoing Auctions
  {
    id: 1,
    productName: "Vintage car",
    basePrice: 150,
    endDate: "2025-02-20",
    status: "ongoing",
    imageUrls: [
      "https://my-auction-images-2025.s3.us-east-1.amazonaws.com/static_images/1st.jpeg"
    ],
    bid: 170000,
  },
  {
    id: 2,
    productName: "Gold Necklace",
    basePrice: 800,
    endDate: "2025-02-27",
    status: "ongoing",
    imageUrls: [
      "https://my-auction-images-2025.s3.us-east-1.amazonaws.com/static_images/2nd.jpeg"
    ],
    bid: 900,
  },
  {
    id: 3,
    productName: "Samsung SSD",
    basePrice: 2000,
    endDate: "2025-02-25",
    status: "ongoing",
    imageUrls: [
      "https://my-auction-images-2025.s3.us-east-1.amazonaws.com/static_images/3rd.jpeg"
    ],
    bid: 2100,
  },
  {
    id: 4,
    productName: "Vintage Watch",
    basePrice: 150,
    endDate: "2025-02-20",
    status: "ongoing",
    imageUrls: [
      "https://my-auction-images-2025.s3.us-east-1.amazonaws.com/static_images/4th.jpeg"
    ],
    bid: 170,
  },
  {
    id: 5,
    productName: "Gold Necklace",
    basePrice: 800,
    endDate: "2025-02-27",
    status: "ongoing",
    imageUrls: [
      "https://my-auction-images-2025.s3.us-east-1.amazonaws.com/static_images/5th.jpeg"
    ],
    bid: 900,
  },
  {
    id: 6,
    productName: "Samsung SSD",
    basePrice: 2000,
    endDate: "2025-02-25",
    status: "ongoing",
    imageUrls: [
      "https://my-auction-images-2025.s3.us-east-1.amazonaws.com/static_images/6th.jpeg"
    ],
    bid: 2100,
  },
  {
    id: 24,
    productName: "Vintage car",
    basePrice: 150,
    endDate: "2025-02-20",
    status: "ongoing",
    imageUrls: [
      "https://my-auction-images-2025.s3.us-east-1.amazonaws.com/static_images/1st.jpeg"
    ],
    bid: 170000,
  },

  // Recent Auctions
  {
    id: 7,
    productName: "Vintage car - Recent",
    basePrice: 160,
    endDate: "2025-03-10",
    status: "recent",
    imageUrls: [
      "https://my-auction-images-2025.s3.us-east-1.amazonaws.com/static_images/1st.jpeg"
    ],
    bid: 175000,
  },
  {
    id: 8,
    productName: "Gold Necklace - Recent",
    basePrice: 850,
    endDate: "2025-03-12",
    status: "recent",
    imageUrls: [
      "https://my-auction-images-2025.s3.us-east-1.amazonaws.com/static_images/2nd.jpeg"
    ],
    bid: 950,
  },
  {
    id: 9,
    productName: "Samsung SSD - Recent",
    basePrice: 2100,
    endDate: "2025-03-15",
    status: "recent",
    imageUrls: [
      "https://my-auction-images-2025.s3.us-east-1.amazonaws.com/static_images/3rd.jpeg"
    ],
    bid: 2200,
  },

  // Top Bid This Month
  {
    id: 10,
    productName: "Vintage Watch - Top Bid",
    basePrice: 155,
    endDate: "2025-03-05",
    status: "top-bid-this-month",
    imageUrls: [
      "https://my-auction-images-2025.s3.us-east-1.amazonaws.com/static_images/4th.jpeg"
    ],
    bid: 180,
  },
  {
    id: 11,
    productName: "Gold Necklace - Top Bid",
    basePrice: 820,
    endDate: "2025-03-07",
    status: "top-bid-this-month",
    imageUrls: [
      "https://my-auction-images-2025.s3.us-east-1.amazonaws.com/static_images/5th.jpeg"
    ],
    bid: 920,
  },
  {
    id: 12,
    productName: "Samsung SSD - Top Bid",
    basePrice: 2050,
    endDate: "2025-03-09",
    status: "top-bid-this-month",
    imageUrls: [
      "https://my-auction-images-2025.s3.us-east-1.amazonaws.com/static_images/6th.jpeg"
    ],
    bid: 2150,
  },
  {
    id: 13,
    productName: "Vintage car - Winner",
    basePrice: 150,
    endDate: "2025-01-20",
    status: "winner-last-month",
    imageUrls: [
      "https://my-auction-images-2025.s3.us-east-1.amazonaws.com/static_images/1st.jpeg"
    ],
    bid: 170000,
    winner: "Manohar reddy",
  },
  {
    id: 14,
    productName: "Gold Necklace - Winner",
    basePrice: 800,
    endDate: "2025-01-27",
    status: "winner-last-month",
    imageUrls: [
      "https://my-auction-images-2025.s3.us-east-1.amazonaws.com/static_images/2nd.jpeg"
    ],
    bid: 900,
    winner: "Rohith Yadav",
  }
];

export default auctionData;
