/* Authors: Ryder Rhoads and Michael Evans
 * File: multerConfig.js
 * Description: This file configures 'multer', a middleware for handling multipart/form-data, 
 * primarily used for uploading files. The configuration specifies the storage location, file 
 * naming convention, file size limits, and a filter for accepting only image files (jpg, jpeg, png).
 *
 * Key Components:
 * - fileFilter: Function to restrict uploads to only image files (jpg, jpeg, png). If a non-image file 
 *   is uploaded, it returns an error.
 * - storage: Multer disk storage configuration to define the destination and filename for uploaded files. 
 *   The filename includes a unique suffix and retains the original file extension.
 * - upload: The multer instance with defined storage, file size limit (100 MB), and file filter. This 
 *   instance is used as middleware in routes where file uploading is required.
 *
 * The configured multer instance is then exported and can be used in Express routes to handle file uploads.
 */
const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.cookies.login.username + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100 MB max file size
    },
    fileFilter: fileFilter
});

module.exports = upload;
