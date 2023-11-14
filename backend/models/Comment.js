/*
* File: Comment.js 
* Authors: Ryder Rhoads and Michael Evans 
* Description: This file contains the schema for a comment object.
*/
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    isReply: Boolean,
    userID: String, // _id tag of user object
    postID: String, // _id tag of post object
    commentID: String, // _id tag of comment object if it is a reply
    content: String, 
    likes: Number,
    dislikes: Number,
    replies: Array // list of comment IDs
}, {
    timestamps: true,
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
