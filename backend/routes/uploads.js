/**
 * File Name: uploads.js
 * Authors: Ryder Rhoads and Michael Evans
 * Description: This file contains the Express route for uploading and processing user profile pictures. 
 * It utilizes the multer middleware for handling file uploads and the Sharp library for image processing. 
 * The route allows users to upload a profile picture, which is then resized and saved in a specific format. 
 * Additional functionality includes handling file storage and deletion of old profile picture.
 * 
 * Routes:
 * POST /uploads/profilePicture - Upload and process a user's profile picture.
 *
 * External Modules:
 * multer - Used for handling multipart/form-data for uploading files.
 * sharp - Used for image processing (resizing and changing format).
 * fs - Used for file system operations (deletion of files).
 */
const express = require('express');
const router = express.Router();
const dynamicUpload = require('../config/multerConfig');
const User = require('../models/User');
const sharp = require('sharp');
const fs = require('fs');

// Post a profile picture for a user
router.post('/profilePicture', dynamicUpload.single('profilePicture'), async (req, res) => {
    const user = await User.findOne({ username: req.cookies.login.username });

    if (!user)
        return res.status(404).send('User not found');

    if (!req.file)
        return res.redirect('/app/home.html');

    const newPath = 'uploads/pfps/' + req.file.filename;

    sharp(req.file.path)
        .resize(200, 200)
        .toFormat("jpg")
        .jpeg({ quality: 90 })
        .toFile(newPath, async (err) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error processing image');
            }

            // Delete the original file
            fs.unlink(req.file.path, (err) => {
                if (err) console.log('Error deleting original file:', err);
            });

            // Delete old profile picture if it's not the default
            const defaultPfp = 'uploads/default_pfp.png';
            if (user.profilePicture && user.profilePicture !== defaultPfp && fs.existsSync(user.profilePicture)) {
                fs.unlink(user.profilePicture, (err) => {
                    if (err) console.log('Error deleting old profile picture:', err);
                });
            }

            user.profilePicture = newPath;
            await user.save();

            res.redirect('/app/home.html');
        });
});


module.exports = router;