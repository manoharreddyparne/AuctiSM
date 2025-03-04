const express = require("express");
const router = express.Router();
const awsUploadController = require("./awsUploadController");

// Route to get a pre-signed URL for S3 upload
router.post("/s3/sign", awsUploadController.getPresignedUrl);

module.exports = router;
