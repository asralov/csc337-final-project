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
        return;

    sharp(req.file.path)
        .resize(200, 200)
        .toFormat("jpg")
        .jpeg({ quality: 90 })
        .toFile('uploads/pfps/' + req.file.filename);

    user.profilePicture = 'uploads/pfps/' + req.file.filename;

    await user.save();

    // TODO delete the original file
    // fs.unlink(req.file.path, (err) => {
    //     if (err)
    //         console.log(err);
    // });

    // TODO delete old pfp if user had uploaded one before

    res.redirect('/users/' + user.username);
});

module.exports = router;