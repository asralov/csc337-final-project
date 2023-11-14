/*
* File: Like.js 
* Authors: Ryder Rhoads and Michael Evans 
* Description: This file contains the schema for a like object.
*/
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    typeOfContent: String, // Post or Comment
    contentId: String, // id of the post or comment
    userId: String, // id of the user who liked the post or comment
    like: Boolean, // true if the user liked the post or comment, false if the user disliked the post or comment
    display: Boolean // true if the like is displayed, false if the like was removed
    }, {
    timestamps: true,
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
