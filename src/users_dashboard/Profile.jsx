import React, { useEffect, useState } from "react";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // Function to fetch user data from protected route
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken"); // Retrieve the JWT token from localStorage

      if (token) {
        try {
          const response = await fetch("http:/localhost:3000/api/profile", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`, // Sending the token in Authorization header
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Authentication failed");
          }

          const data = await response.json();
          setProfileData(data); // Store the fetched profile data
        } catch (error) {
          console.error("Error fetching profile:", error); // Handle any errors
        }
      } else {
        console.log("No token found");
      }
    };

    fetchUserData(); // Call the function to fetch data when the component mounts
  }, []); // Empty dependency array ensures it only runs once when the component mounts

  // Display loading state or profile data
  if (!profileData) return <div>Loading...</div>;

  return (
    <div>
      <h2>Profile</h2>
      <p>Name: {profileData.name}</p>
      <p>Email: {profileData.email}</p>
    </div>
  );
};

export default Profile;
