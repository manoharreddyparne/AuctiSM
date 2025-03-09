const AWS = require("aws-sdk");
const path = require("path");


require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
  region: process.env.REACT_APP_AWS_REGION, 
});

const getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    if (!fileName || !fileType) {
      return res.status(400).json({ error: "Missing fileName or fileType" });
    }

  // Create a new key for the image
    const fileKey = `auction-images/${Date.now()}-${fileName}`;
    const params = {
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
      Key: fileKey,
      Expires: 60, // URL expires in 60 seconds
      ContentType: fileType,
    };

    const uploadURL = await s3.getSignedUrlPromise("putObject", params);
    res.status(200).json({ uploadURL, fileKey });
  } catch (error) {
    console.error("❌ Error generating pre-signed URL:", error);
    res.status(500).json({
      error: "Failed to generate pre-signed URL",
      details: error.message,
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { fileKey } = req.body;
    if (!fileKey) {
      return res.status(400).json({ error: "Missing fileKey" });
    }
    const params = {
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
      Key: fileKey,
    };

    await s3.deleteObject(params).promise();
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting image from S3:", error);
    res.status(500).json({ error: "Failed to delete image", details: error.message });
  }
};

module.exports = { getPresignedUrl, deleteImage };
