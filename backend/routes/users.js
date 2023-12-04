const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single user by username
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });

        if (user) {
            const htmlData = `
                <h1>${user.username}</h1>
                ${user.firstName && user.lastName ? `<p>${user.firstName} ${user.lastName}</p>` : ''}
                <img src="../${user.profilePicture}" alt="Profile Picture">
            `;
            res.send(htmlData);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a user
router.post('/update/:username', async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { username: req.params.username },
            req.body,
            { new: true }
        );

        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a user
router.delete('/delete/:username', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ username: req.params.username });

        if (user) {
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
