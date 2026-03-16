const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

// Multer storage configuration (memory storage for Cloudinary upload)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if ([...allowedImageTypes, ...allowedDocTypes].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, WEBP) and documents (PDF, DOC, DOCX) are allowed.'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload to Cloudinary
const uploadToCloudinary = (buffer, folder = 'artisan-marketplace', resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation: resourceType === 'image' ? [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' }
        ] : undefined
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Middleware for single image upload
const uploadSingleImage = (fieldName) => {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      if (!req.file) {
        return next();
      }

      try {
        const result = await uploadToCloudinary(req.file.buffer, 'artisan-marketplace/profiles');
        req.cloudinaryUrl = result.secure_url;
        req.cloudinaryPublicId = result.public_id;
        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error uploading image'
        });
      }
    }
  ];
};

// Middleware for multiple image uploads
const uploadMultipleImages = (fieldName, maxCount = 5) => {
  return [
    upload.array(fieldName, maxCount),
    async (req, res, next) => {
      if (!req.files || req.files.length === 0) {
        return next();
      }

      try {
        const uploadPromises = req.files.map(file => 
          uploadToCloudinary(file.buffer, 'artisan-marketplace/portfolio')
        );
        
        const results = await Promise.all(uploadPromises);
        req.cloudinaryUrls = results.map(result => ({
          url: result.secure_url,
          publicId: result.public_id
        }));
        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error uploading images'
        });
      }
    }
  ];
};

// Middleware for mixed file uploads (images and documents)
const uploadMixedFiles = (fields) => {
  return [
    upload.fields(fields),
    async (req, res, next) => {
      if (!req.files) {
        return next();
      }

      try {
        req.uploadedFiles = {};

        for (const [fieldName, files] of Object.entries(req.files)) {
          const uploadPromises = files.map(file => {
            const isImage = file.mimetype.startsWith('image/');
            const folder = isImage ? 'artisan-marketplace/images' : 'artisan-marketplace/documents';
            return uploadToCloudinary(file.buffer, folder, isImage ? 'image' : 'raw');
          });

          const results = await Promise.all(uploadPromises);
          req.uploadedFiles[fieldName] = results.map(result => ({
            url: result.secure_url,
            publicId: result.public_id,
            originalName: files.find(f => f.buffer)?.originalname
          }));
        }

        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error uploading files'
        });
      }
    }
  ];
};

module.exports = {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  uploadMixedFiles,
  uploadToCloudinary
};
