/*
 * File: Like.js
 * Authors: Ryder Rhoads and Michael Evans
 * Description: This file defines the schema for the Like model using Mongoose. It represents the structure
 * of a 'like' or 'dislike' action on a piece of content (either a Post or Comment) in the database.
 *
 * Schema Fields:
 * - typeOfContent: Specifies the type of content that is being liked or disliked, e.g., 'Post' or 'Comment'.
 * - contentId: The unique identifier of the post or comment that the like/dislike action is associated with.
 * - username: The username of the user who performed the like/dislike action.
 * - like: A Boolean value indicating the nature of the action; 'true' for a like, 'false' for a dislike.
 * - timestamps: Mongoose option to automatically add createdAt and updatedAt fields to the schema.
 *
 * The schema is utilized to create the Like model with Mongoose, enabling interaction with the
 * corresponding 'likes' collection in the database. This model helps track user reactions to various
 * types of content within the application.
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
