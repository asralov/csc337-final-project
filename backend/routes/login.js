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

            console.log(hashedPassword);
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
                    { maxAge: 60000 * 10 });
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
