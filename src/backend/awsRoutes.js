const express = require("express");
const router = express.Router();
const awsUploadController = require("./awsUploadController");

// Route to get a pre-signed URL for S3 upload
router.post("/s3/sign", awsUploadController.getPresignedUrl);

// New route to delete an image from S3
router.delete("/s3/delete", awsUploadController.deleteImage);

module.exports = router;
