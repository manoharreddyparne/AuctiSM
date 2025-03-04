const AWS = require("aws-sdk");
require("dotenv").config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    if (!fileName || !fileType) {
      return res.status(400).json({ error: "Missing fileName or fileType" });
    }

    // Generate a unique file key
    const fileKey = `auction-images/${Date.now()}-${fileName}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Expires: 60, // URL expires in 60 seconds
      ContentType: fileType,
    };

    const uploadURL = await s3.getSignedUrlPromise("putObject", params);

    // Return with consistent property names
    res.status(200).json({ uploadURL, fileKey });
  } catch (error) {
    console.error("❌ Error generating pre-signed URL:", error);
    res
      .status(500)
      .json({ error: "Failed to generate pre-signed URL", details: error.message });
  }
};

module.exports = { getPresignedUrl };
