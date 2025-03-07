// src/utils/uploadS3.js
export const uploadImagesToS3 = async (images) => {
  const uploadedImageUrls = [];
  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    const response = await fetch("http://localhost:5000/api/aws/s3/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type
      })
    });
    if (!response.ok) {
      console.error("Failed to get pre-signed URL for:", file.name);
      continue;
    }
    const { uploadURL, fileKey } = await response.json();
    if (!uploadURL || !fileKey) {
      console.error("Invalid response for:", file.name);
      continue;
    }
    const uploadResponse = await fetch(uploadURL, {
      method: "PUT",
      headers: {
        "Content-Type": file.type
      },
      body: file
    });
    if (uploadResponse.ok) {
      // Construct the S3 file URL using fileKey and the REACT_APP_ variables
      const s3Url = `https://${process.env.REACT_APP_AWS_BUCKET_NAME}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/${fileKey}`;
      uploadedImageUrls.push(s3Url);
    } else {
      console.error("Error uploading image to S3:", file.name);
    }
  }
  return uploadedImageUrls;
};

export const deleteImageFromS3 = async (url) => {
  // Extract the fileKey from the URL.
  // Assuming URL format: https://{bucket}.s3.{region}.amazonaws.com/{fileKey}
  const parts = url.split("/");
  const fileKey = parts[parts.length - 1];

  try {
    const response = await fetch("http://localhost:5000/api/aws/s3/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fileKey })
    });
    if (!response.ok) {
      console.error("Failed to delete image from S3, status:", response.status);
      throw new Error("Failed to delete image from S3");
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting image from S3:", error);
    throw error;
  }
};
