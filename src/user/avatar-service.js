require('dotenv').config();
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require('../config');

// Setup AWS S3 config
const s3Config = new AWS.S3({
  signatureVersion: 'v4',
  region: 'us-west-1',
  accessKeyId: config.AWS_ACCESS_KEY,
  secretAccessKey: config.AWS_SECRET_KEY,
  Bucket: config.AWS_BUCKET
});

// Makes sure a files type is either jpeg or png
const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Setup multer config
const multerS3Config = multerS3({
  s3: s3Config,
  bucket: config.AWS_BUCKET,
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    // Determines file name on AWS S3 Bucket
    cb(null, `${req.params.userId}-avatar-${new Date().toISOString()}`);
  }
});

// Multi-part upload function to upload avatar to AWS S3 bucket
const upload = multer({
  storage: multerS3Config,
  fileFilter: fileFilter,
  limits: {
    // Limits file uploads to 2MB
    fileSize: 2000000
  },
  onError: function (err, next) {
    next(err);
  },
});

module.exports = upload;