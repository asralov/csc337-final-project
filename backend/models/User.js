/*
* File: User.js 
* Authors: Ryder Rhoads and Michael Evans 
* Description: This file contains the schema for a user object.
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
    profilePicture: { type: String, default: '../resources/default_pfp.png' },
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
