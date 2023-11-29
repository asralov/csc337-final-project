const express = require('express');
const router = express.Router();
const dynamicUpload = require('../config/multerConfig');
const User = require('../models/User');

// Post a profile picture for a user
router.post('/profilePicture', dynamicUpload.single('profilePicture'), async (req, res) => {
    const user = await User.findOne({ username: req.cookies.login.username });

    if (!user)
        return;

    user.profilePicture = req.file.path;
    await user.save();

    res.redirect('/users/' + user.username);
});

module.exports = router;