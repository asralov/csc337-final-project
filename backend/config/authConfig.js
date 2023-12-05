/* Authors: Ryder Rhoads and Michael Evans
 * File: authConfig.js
 * Description: This file creates a custom authentication system for managing user sessions in the application. 
 * It includes functions to add and remove sessions, a scheduled task to clean up expired sessions, and middleware 
 * for authenticating requests based on sessions or tokens.
 *
 * Key Components:
 * - sessions: An object that stores active user sessions, keyed by username.
 * 
 * Functions:
 * - addSession(username): Adds a new session for a given user and returns the session ID.
 * - removeSessions(): Regularly invoked function to clear expired sessions from the 'sessions' object.
 * - removeSession(sid): Removes a specific session based on the session ID.
 * - authenticate(req, res, next): Middleware to authenticate requests. It supports both token-based 
 *   and cookie-based authentication methods.
 * 
 * The 'authenticate' middleware can be used in Express routes to secure endpoints, ensuring that only 
 * authenticated users can access them. The session handling functions help manage user sessions, providing 
 * a basic level of security and user tracking.
 *
 * A scheduled interval is set to invoke the 'removeSessions' function every 2000 milliseconds (2 seconds), 
 * ensuring that expired sessions are regularly cleaned up.
 */

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
    // Token-based authentication
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        if (token == 'Python_Script_Secret_Key') {
            next();
        } else {
            res.redirect('/');
        }
    } else {
        // Cookie-based authentication (as you already implemented)
        let cookies = req.cookies;
        if (cookies && cookies.login && cookies.login.username) {
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
}

setInterval(removeSessions, 2000);

module.exports = { router, authenticate, addSession, removeSession };