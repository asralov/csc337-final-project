/*
 * File: Post.js
 * Authors: Ryder Rhoads and Michael Evans
 * Description: This file defines the schema for the Post model using Mongoose. It outlines the structure
 * of a post object in the database, detailing various aspects like content, metadata, and user interactions.
 *
 * Schema Fields:
 * - title: Title of the post.
 * - content: An object containing background information, summary, and bias of the post. Stored as strings.
 * - imageSource: A verbal description or source of the image associated with the post.
 * - imageURL: URL for the image related to the post, with a default placeholder image.
 * - date: Date of post creation, defaults to the current date and time.
 * - topics: Array of strings representing topics or tags associated with the post.
 * - likes: Array of ObjectIds referencing the Like model, representing likes received by the post.
 * - dislikes: Array of ObjectIds referencing the Like model, representing dislikes received by the post.
 * - comments: Array of ObjectIds referencing the Comment model, representing comments made on the post.
 * - urls: Array of URLs used as references or sources in constructing the post.
 * - timestamps: Mongoose option to automatically add createdAt and updatedAt fields to the schema.
 *
 * The schema is used to create the Post model with Mongoose, facilitating interactions with the
 * corresponding 'posts' collection in the database.
 */
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    // using string since had some problems using the actual object element 
    content: {background: String, summary: String, bias: String},
    imageSource: String, // Verbal image source
    imageURL: { type: String, default: '../resources/news_default.png' }, // Image URL
    date: { type: Date, default: Date.now() }, // Date of post creation
    topics: [String], // Array of topics/tags (see topics.txt)
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    urls: [String], // Array of urls this post was constructed from
}, {
    timestamps: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
