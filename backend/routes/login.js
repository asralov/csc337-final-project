/**
 * File Name: login.js
 * Authors: Ryds Rhoads and Michael Evans
 * Description: This file contains Express routes for user authentication. It includes routes for 
 * adding new users, user login, and logout. The user data is managed using the User model, and 
 * password hashing is implemented for security. The routes also handle session management using 
 * custom authenticator middleware.
 * 
 * Routes:
 * POST /login/add - Add a new user with hashed password.
 * POST /login/login - Authenticate user login, create session, and set login cookie.
 * POST /login/logout - Terminate user session and clear login cookie.
 *
 * External Modules:
 * crypto - Used for generating random salt and hashing passwords.
 * authenticator - Custom middleware for session management.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticator = require('../config/authConfig');
const crypto = require('crypto');

// Add a new user
router.post('/add', async (req, res) => {
    let user = req.body;
    let p = User.find({ username: user.username }).exec();

    p.then(results => {
        if (results.length == 0) {
            const salt = crypto.randomBytes(16).toString('hex');
            const hashedPassword = crypto
                .pbkdf2Sync(user.password, salt, 10000, 64, 'sha512')
                .toString('hex');
            let newUser = new User({
                username: user.username,
                salt: salt,
                password: hashedPassword
            });
            newUser.save();
            res.end('User created');
        } else {
            res.status(404).json({ message: 'User already exists' });
        }
    }).catch(error => {
        res.end(error);
    });
});

// User login
router.post('/login', async (req, res) => {
    let user = req.body;
    let p = User.find({ username: user.username }).exec();

    p.then(results => {
        if (results.length == 0) {
            res.status(401).json({ error: 'User does not exist' });
        } else {
            const storedUser = results[0];
            const hashedEnteredPassword = crypto
                .pbkdf2Sync(user.password, storedUser.salt, 10000, 64, 'sha512')
                .toString('hex');
            // Checks if the given password matches the hashed password in database
            if (hashedEnteredPassword === storedUser.password) {
                let sid = authenticator.addSession(user.username);

                res.cookie("login",
                    { username: user.username, sessionID: sid },
                    { maxAge: 60000 * 60 });
                res.redirect('/app/home.html');
            } else {
                res.status(401).json({ error: 'Invalid password' });
            }
        }
    }).catch(error => {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.post('/logout', (req, res) => {
    authenticator.removeSession(req.cookies.login.sessionID);
    res.clearCookie('login');
    res.redirect('/');
});

module.exports = router;
