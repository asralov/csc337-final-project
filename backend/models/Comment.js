/*
* File: Comment.js 
* Authors: Ryder Rhoads and Michael Evans 
* Description: This file contains the schema for a comment object.
*/
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    isReply: { type: Boolean, default: false },
    username: { type: String, required: true },
    parentId: { type: String, required: true }, // _id tag of parent post or comment object
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    replies: [String] // Array of _id tags of reply comment objects
}, {
    timestamps: true
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
