/*
* File: Like.js 
* Authors: Ryder Rhoads and Michael Evans 
* Description: This file contains the schema for a like object.
*/
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    typeOfContent: String, // Post or Comment
    contentId: String, // id of the post or comment
    username: String, // username of who liked the post or comment
    like: Boolean // true if the user liked the post or comment, false if the user disliked the post or comment
}, {
    timestamps: true,
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
