// src/utils/uploadS3.js

const AWS_BUCKET_NAME = process.env.REACT_APP_AWS_BUCKET_NAME;
const AWS_REGION = process.env.REACT_APP_AWS_REGION;
const BASE_S3_URL = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/`;

export const uploadImagesToS3 = async (images) => {
  try {
    const uploadPromises = images.map(async (file) => {
      try {
        // Get pre-signed URL
        const response = await fetch("http://localhost:5000/api/aws/s3/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, fileType: file.type }),
        });

        if (!response.ok) throw new Error(`Failed to get pre-signed URL for: ${file.name}`);

        const { uploadURL, fileKey } = await response.json();
        if (!uploadURL || !fileKey) throw new Error(`Invalid response for: ${file.name}`);

        // Upload file to S3
        const uploadResponse = await fetch(uploadURL, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResponse.ok) throw new Error(`Error uploading ${file.name} to S3`);

        return `${BASE_S3_URL}${fileKey}`; // Construct and return uploaded image URL
      } catch (error) {
        console.error(error.message);
        return null; // Return null for failed uploads
      }
    });

    const uploadedImageUrls = await Promise.all(uploadPromises);
    return uploadedImageUrls.filter((url) => url !== null); // Filter out failed uploads
  } catch (error) {
    console.error("Error in uploadImagesToS3:", error);
    return [];
  }
};

export const deleteImageFromS3 = async (url) => {
  try {
    if (!url.startsWith(BASE_S3_URL)) throw new Error("Invalid S3 URL format");

    const fileKey = url.replace(BASE_S3_URL, ""); // Extract fileKey from the URL

    const response = await fetch("http://localhost:5000/api/aws/s3/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileKey }),
    });

    if (!response.ok) throw new Error(`Failed to delete image from S3, status: ${response.status}`);

    return await response.json(); // Return success response
  } catch (error) {
    console.error("Error deleting image from S3:", error);
    throw error;
  }
};
