const express = require('express');
const router = express.Router();

let sessions = {};

/**
 * Adds a new session for a given user.
 * @param {string} username - The username of the user to add a session for.
 * @returns {number} The session ID for the newly added session.
 */
function addSession(username) {
    let sid = Math.floor(Math.random() * 1000000000);
    let now = Date.now();
    sessions[username] = { sid: sid, time: now };

    return sid;
}

/**
 * Removes expired sessions from the sessions object.
 */
function removeSessions() {
    console.log(sessions);
    let now = Date.now();
    let usernames = Object.keys(sessions);

    usernames.forEach(username => {
        console.log(now - sessions[username].time);
        if (now - sessions[username].time > 60000 * 10) {
            delete sessions[username];
        }
    });
}

/**
 * Removes a session from the sessions object based on the provided session ID.
 * @param {string} sid - The session ID to be removed.
 */
function removeSession(sid) {
    let usernames = Object.keys(sessions);

    usernames.forEach(username => {
        if (sessions[username].sid == sid) {
            delete sessions[username];
        }
    });
}

/**
 * Middleware function to authenticate user session.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
function authenticate(req, res, next) {
    let cookies = req.cookies;
    console.log(req.cookies);

    if (cookies && cookies.login && cookies.login.username) {
        console.log(cookies.login);
        let username = cookies.login.username;

        if (sessions[username] && sessions[username].sid == cookies.login.sessionID) {
            next();
        } else {
            res.redirect('/');
        }
    } else {
        res.redirect('/');
    }
}

setInterval(removeSessions, 2000);

module.exports = { router, authenticate, addSession, removeSession };