const express = require("express");
const router = express.Router();
const awsUploadController = require("./awsUploadController");

// Route to get a presigned URL to upload an image to S3
router.post("/s3/sign", awsUploadController.getPresignedUrl);

// Route to delete an image from S3
router.delete("/s3/delete", awsUploadController.deleteImage);

module.exports = router;
