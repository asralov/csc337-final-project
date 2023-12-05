/*
 * File: Comment.js
 * Authors: Ryder Rhoads and Michael Evans
 * Description: This file defines the schema for the Comment model using Mongoose. It outlines the structure
 * of a comment object in the database, detailing its characteristics and how it relates to other content, 
 * like posts and other comments.
 *
 * Schema Fields:
 * - isReply: Boolean indicating whether the comment is a reply to another comment. Defaults to false.
 * - username: The username of the user who made the comment. Required field.
 * - parentId: The ID of the parent post or comment that this comment is associated with. Required field.
 * - content: The text content of the comment. Required field.
 * - likes: Array of ObjectIds referencing the Like model, representing likes received by the comment.
 * - dislikes: Array of ObjectIds referencing the Like model, representing dislikes received by the comment.
 * - replies: Array of comments that are replies to this comment.
 * - timestamps: Mongoose option to automatically add createdAt and updatedAt fields to the schema.
 *
 * The schema is used to create the Comment model with Mongoose, enabling interactions with the
 * corresponding 'comments' collection in the database. This model is crucial for handling user interactions 
 * such as commenting on posts and replying to other comments.
 */
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    isReply: { type: Boolean, default: false },
    username: { type: String, required: true },
    parentId: { type: String, required: true }, // _id tag of parent post or comment object
    content: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
    replies: [this] // Array of replies to this comment
}, {
    timestamps: true
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
