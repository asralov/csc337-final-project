const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticator = require('../config/authConfig');

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
        const user = await User.find({ username: req.params.username });

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new user
router.post('/add', async (req, res) => {
    let user = req.body;
    let p = User.find({ username: user.username }).exec();

    p.then(results => {
        if (results.length == 0) {
            let newUser = new User(user);
            newUser.save();
            res.end('User created');
        } else {
            res.end('User already exists');
        }
    }).catch(error => {
        res.end(error);
    });
});

// User login
router.post('/login', async (req, res) => {
    let user = req.body;
    let p = User.find({ username: user.username, password: user.password }).exec();

    p.then(results => {
        if (results.length == 0) {
            res.status(401).json({ error: 'Invalid username or password' });
        } else {
            let sid = authenticator.addSession(user.username);

            res.cookie("login",
                { username: user.username, sessionID: sid },
                { maxAge: 60000 * 2 });
            res.redirect('/app/home.html');
        }
    });

    console.log(p);
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
