const express = require('express');
const router = express.Router();
const dynamicUpload = require('../multerConfig');

// Post a profile picture for a user
router.post('/profilePicture/:id', dynamicUpload.single('profilePicture'), async (req, res) => {
    if (req.fileValidationError) {
        return res.status(400).json({ message: req.fileValidationError });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.profilePicture = req.file.path;
        const updatedUser = await user.save();
        res.json({ message: 'Profile picture updated successfully', user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;