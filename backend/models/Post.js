/*
* File: Post.js 
* Authors: Ryder Rhoads and Michael Evans 
* Description: This file contains the schema for a post object.
*/
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    topic, String, //limited list of topics which can be found in topics.txt
    likes: Number,
    dislikes: Number,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    urls: Array, // list of URLs that the 
}, {
    timestamps: true,
});

const Post = mongoose.model('Comment', postSchema);

module.exports = Post;
