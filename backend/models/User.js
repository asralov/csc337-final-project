/*
* File: User.js 
* Authors: Ryder Rhoads and Michael Evans 
* Description: This file contains the schema for a user object.
*/
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    salt: String,
    email: String,
    lastLogin: String, // date and time represented as string
    profilePicture: String, // path to profile picture
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
            //idk how to do this yet
        }]
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
