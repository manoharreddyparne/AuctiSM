const express = require("express");
const router = express.Router();
const awsUploadController = require("./awsUploadController");

router.post("/s3/sign", awsUploadController.getPresignedUrl);

router.delete("/s3/delete", awsUploadController.deleteImage);

module.exports = router;
