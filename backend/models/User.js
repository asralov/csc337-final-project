/*
 * File: User.js
 * Authors: Ryder Rhoads and Michael Evans
 * Description: This file defines the schema for the User model using Mongoose. It outlines the structure 
 * of a user object in the database, including the user's authentication details, personal information, 
 * and interaction data.
 *
 * Schema Fields:
 * - username: Unique identifier for the user.
 * - password: Hashed password for user authentication.
 * - firstName: User's first name.
 * - lastName: User's last name.
 * - salt: Cryptographic salt used in hashing the password.
 * - lastLogin: Timestamp of the user's last login, defaults to the current date and time.
 * - profilePicture: URL to the user's profile picture, defaults to a standard image.
 * - interests: Object containing arrays that track user interests based on input, comments, likes, and views.
 *     - userInput: Array of strings indicating user's self-declared interests.
 *     - comments: Array of objects tracking the types of posts the user comments on and the frequency.
 *     - likes: Array of objects tracking the types of posts the user likes and the frequency.
 *     - views: Array of objects tracking the types of posts the user views and the frequency.
 * - comments: Array of ObjectIds referencing the Comment model, representing comments made by the user.
 * - likes: Array of ObjectIds referencing the Like model, representing likes made by the user.
 * - timestamps: Mongoose option to automatically add createdAt and updatedAt fields to the schema.
 *
 * The schema is used to create the User model with Mongoose, which facilitates interaction with the
 * corresponding 'users' collection in the database.
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    firstName: String,
    lastName: String,
    salt: String,
    // email: { type: String, unique: true },
    lastLogin: { type: Date, default: Date.now() },
    profilePicture: { type: String, default: 'uploads/default_pfp.png' },
    interests: {
        userInput: Array, // list of strings that the user is interested in 
        comments: [{ // list of posts that the user has commented on to imply interest
            type: String, // type of post
            count: Number, // number of comments on that type of post 
        }],
        likes: [{ // list of comments that the user has liked to imply interest
            type: String, // type of post
            count: Number, // number of likes on that type of post
        }],
        views: [{
            type: String, // type of post
            count: Number, // number of views on that type of post
        }]
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
