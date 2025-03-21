
const AWS_BUCKET_NAME = process.env.REACT_APP_AWS_BUCKET_NAME;
const AWS_REGION = process.env.REACT_APP_AWS_REGION;
const BASE_S3_URL = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/`;

export const uploadImagesToS3 = async (images) => {
  try {
    const uploadPromises = images.map(async (file) => {
      try {

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/aws/s3/sign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, fileType: file.type }),
        });

        if (!response.ok) throw new Error(`Failed to get pre-signed URL for: ${file.name}`);

        const { uploadURL, fileKey } = await response.json();
        if (!uploadURL || !fileKey) throw new Error(`Invalid response for: ${file.name}`);


        const uploadResponse = await fetch(uploadURL, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResponse.ok) throw new Error(`Error uploading ${file.name} to S3`);

        return `${BASE_S3_URL}${fileKey}`; 
      } catch (error) {
        console.error(error.message);
        return null; 
      }
    });

    const uploadedImageUrls = await Promise.all(uploadPromises);
    return uploadedImageUrls.filter((url) => url !== null); 
  } catch (error) {
   //debug 
    //console.error("Error in uploadImagesToS3:", error);
    return [];
  }
};

export const deleteImageFromS3 = async (url) => {
  try {
    if (!url.startsWith(BASE_S3_URL)) throw new Error("Invalid S3 URL format");

    const fileKey = url.replace(BASE_S3_URL, "");

    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/aws/s3/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileKey }),
    });

    if (!response.ok) throw new Error(`Failed to delete image from S3, status: ${response.status}`);

    return await response.json(); 
  } catch (error) {

    //debug
    // console.error("Error deleting image from S3:", error);
    throw error;
  }
};
