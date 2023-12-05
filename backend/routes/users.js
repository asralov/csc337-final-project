/**
 * File Name: users.js
 * Authors: Ryder Rhoads and Michael Evans
 * Description: This file contains Express routes for basic CRUD (Create, Read, Update, Delete) operations 
 * on user data. It uses the User model to interact with the database. The routes support fetching all users, 
 * retrieving a specific user by username, updating user information, and deleting a user.
 * 
 * Routes:
 * GET /users/ - Retrieve all users.
 * GET /users/:username - Fetch a single user by username.
 * POST /users/update/:username - Update details of a specific user.
 * DELETE /users/delete/:username - Delete a user by username.
 */

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
            res.send(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get first name of username
router.get('/fname/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });

        if (user) {
            res.send(user.firstName);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get last name of username
router.get('/lname/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });

        if (user) {
            res.send(user.lastName);
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

// Update first name
router.post('/edit/fname', async (req, res) => {
    try {
        const userToFind = await User.find(
            { username: req.body.username },
        ).exec()
        .then((result) => {
            if (result.length != 0) {
                result[0].firstName = req.body.name;
                result[0].save();
                res.json({ message: 'First name updated successfully' });
            }
        }).catch((error) => {
            res.status(500).json({ error: 'Internal server error' });
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update last name
router.post('/edit/lname', async (req, res) => {
    try {
        const userToFind = await User.find(
            { username: req.body.username },
        ).exec()
        .then((result) => {
            if (result.length != 0) {
                result[0].lastName = req.body.name;
                result[0].save();
                res.json({ message: 'First name updated successfully' });
            }
        }).catch((error) => {
            res.status(500).json({ error: 'Internal server error' });
        });
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
