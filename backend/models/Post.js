/*
* File: Post.js 
* Authors: Ryder Rhoads and Michael Evans 
* Description: This file contains the schema for a post object.
*/
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    date: { type: Date, default: Date.now() }, // Date of post creation
    topics: [String], // Array of topics/tags (see topics.txt)
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    urls: [String], // Array of urls this post was constructed from
}, {
    timestamps: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
