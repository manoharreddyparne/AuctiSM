const AWS = require("aws-sdk");
const path = require("path");

// Explicitly load the .env file from the project root
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // from .env
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // from .env
  region: process.env.REACT_APP_AWS_REGION, // using REACT_APP_AWS_REGION as desired
});

const getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    if (!fileName || !fileType) {
      return res.status(400).json({ error: "Missing fileName or fileType" });
    }

    // Generate a unique file key for the upload
    const fileKey = `auction-images/${Date.now()}-${fileName}`;
    const params = {
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME, // using REACT_APP_AWS_BUCKET_NAME
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

module.exports = { getPresignedUrl };
