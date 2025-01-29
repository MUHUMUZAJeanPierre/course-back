const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'uploads', // Cloudinary folder name
        format: async (req, file) => 'png', // Change format if needed
        public_id: (req, file) => `${Date.now()}-${file.originalname}`
    },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
