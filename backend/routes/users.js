const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const upload = require('../config/multerConfig'); 
const authenticate = require('../config/authConfig'); 
const { PassThrough } = require('stream');

// I was thinking adminAuth will be required to pull user data then userAuth will be required to update user data

// GET request - get all users
router.get('/', authenticate.adminAuth(), async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET request - get a single user by ID
router.get('/:id', authenticate.adminAuth(), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST request - add a new user
router.post('/add', authenticate.adminAuth(), async (req, res) => {
    //Still working on this function kinda need to figure out how to add a profile picture
    // And how the req body will look like
});


// PUT request - update a user
router.put('/update/:id', authenticate.userAuth(), async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE request - delete a user
router.delete('/delete/:id', authenticate.userAuth(), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
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
