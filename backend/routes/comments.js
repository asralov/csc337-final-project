/**
 * File Name: comments.js
 * Authors: Ryder Rhoads and Michael Evans
 * Description: This file contains the Express routes for handling operations related to comments on posts. 
 * It includes functionality for adding, replying to, deleting comments, and retrieving comments and replies. 
 * The routes interact with Post, Comment, and User models to manage comment-related data in the database.
 * 
 * Routes: 
 * POST /comments/add/:postId - Add a comment to a post.
 * POST /comments/reply/:commentId - Add a reply to a comment.
 * POST /comments/delete/:commentId - Delete a comment or reply.
 * GET /comments/get/:postId - Get all comments for a specific post.
 * GET /comments/get/replies/:commentId - Get all replies for a specific comment.
 */

const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

// Add a comment to a post
router.post('/add/:postId', async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (!post)
        return;

    const comment = new Comment(req.body);
    comment.username = req.cookies.login.username;
    comment.parentId = post._id;

    post.comments.push(comment);
    await comment.save();
    await post.save();

    const user = await User.findOne({ username: comment.username });
    user.comments.push(comment._id);
    await user.save();
    res.end("ADDED!");
});

// Add a reply to a comment
router.post('/reply/:commentId', async (req, res) => {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment)
        return;

    const reply = new Comment(req.body);
    reply.username = req.cookies.login.username;
    reply.isReply = true;
    reply.parentId = comment._id;

    comment.replies.push(reply._id);
    await reply.save();
    await comment.save();

    const user = await User.findOne({ username: reply.username });
    user.comments.push(reply._id);
    await user.save();
});

// Delete a comment
router.post('/delete/:commentId', async (req, res) => {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment)
        return;

    if (comment.isReply) {
        // Remove the reply from the parent comment
        const parentComment = await Comment.findById(comment.parentId);
        parentComment.replies = parentComment.replies.filter(replyId => replyId.toString() != comment._id.toString());
        await parentComment.save();
    } else {
        // Remove the comment from the parent post
        const post = await Post.findById(comment.parentId);
        post.comments = post.comments.filter(commentId => commentId.toString() != comment._id.toString());
        await post.save();
    }

    // Delete all replies to the comment
    for (let i = 0; i < comment.replies.length; i++)
        await Comment.findByIdAndDelete(comment.replies[i]);

    // Delete the comment from the user's list of comments
    const user = await User.findOne({ username: comment.username });
    user.comments = user.comments.filter(commentId => commentId.toString() != comment._id.toString());

    await user.save();
    await Comment.findByIdAndDelete(req.params.commentId);
    res.end("DELETED!")
});

// Get all comments for a post
router.get('/get/:postId', async (req, res) => {
    const post = await Post.findById(req.params.postId);
    const comments = await Comment.find({ _id: { $in: post.comments } });
    res.json(comments);
});

// Get all replies for a comment
router.get('/get/replies/:commentId', async (req, res) => {
    const comment = await Comment.findById(req.params.commentId);
    const replies = await Comment.find({ _id: { $in: comment.replies } });
    res.json(replies);
});

module.exports = router;