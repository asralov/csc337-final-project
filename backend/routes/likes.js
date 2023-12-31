/**
 * File Name: likes.js
 * Authors: Ryder Rhoads and Michael Evans
 * Description: This file contains Express routes for managing likes and dislikes on posts and comments.
 * It includes functionality for toggling likes/dislikes, retrieving like/dislike counts, and checking 
 * if a user has liked a specific post. The routes interact with Like, Post, and User models to manage 
 * like-related data in the database.
 * 
 * Routes:
 * POST /likes/toggle - Toggle a like or dislike on a post or comment.
 * GET /likes/get/:contentType/:postId - Get the number of likes and dislikes for a post or comment.
 * GET /likes/check/:postID/:username - Check if a user has liked a specific post.
 *
 * Functions:
 * likePost(content, likeOrDislike, user) - Handles the logic for liking a post.
 * dislikePost(content, likeOrDislike, user) - Handles the logic for disliking a post.
 */

const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const Post = require('../models/Post');
const User = require('../models/User');

// Add or toggle a like or dislike to a post or comment
router.post('/toggle', async (req, res) => {
    const { typeOfContent, contentId, like } = req.body;
    const username = req.cookies.login.username;

    try {
        let likeOrDislike = await Like.findOne({ typeOfContent, contentId, username });

        if (likeOrDislike)
            likeOrDislike.like = like;
        else
            likeOrDislike = new Like({ typeOfContent, contentId, username, like });

        await likeOrDislike.save();

        const content = typeOfContent == 'Post' ? await Post.findById(contentId) : await Comment.findById(contentId);
        const user = await User.findOne({ username: username });

        like ? likePost(content, likeOrDislike, user) : dislikePost(content, likeOrDislike, user);

        await user.save();
        await content.save();

        res.status(201).json({ message: 'Like/Dislike added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error processing request', error: error.message });
    }
});

// Get the number of likes and dislikes for a post or comment
router.get('/get/:contentType/:postId', async (req, res) => {
    const contentType = req.params.contentType;
    const postId = req.params.postId;

    if (contentType != 'Post' && contentType != 'Comment')
        return res.status(400).json({ message: 'Invalid content type' });

    try {
        const likeCount = await Like.countDocuments({ typeOfContent: contentType, contentId: postId, like: true });
        const dislikeCount = await Like.countDocuments({ typeOfContent: contentType, contentId: postId, like: false });

        res.status(200).json({ likes: likeCount, dislikes: dislikeCount });
    } catch (error) {
        res.status(500).json({ message: 'Error counting likes/dislikes', error: error.message });
    }
});

router.get('/check/:postID/:username', async (req, res) => {
    const postID = req.params.postID;
    const user = req.params.username;
    Like.find({contentId: postID, username: user}).exec()
    .then((result) => {
        if (result.length > 0 ) {
            if (result[0].like) {
                res.end("TRUE");
            } else {
                res.end("FALSE");
            }
        } else {
            res.end("NO INTERACTION")
        }
    }).catch((err) => {
        res.status(500).json({ message: 'Error checking liked post', error: err.message });
    })

});

/**
 * Likes a post and updates the content and user accordingly.
 * If the user has already liked the content, the like is removed.
 * If the user has already disliked the content, the dislike is removed.
 * @param {Object} content - The content object to be updated.
 * @param {Object} likeOrDislike - The like or dislike object to be added or removed.
 * @param {Object} user - The user object whose likes are to be updated.
 */
function likePost(content, likeOrDislike, user) {
    // If the user has already liked the content, remove the like
    if (!content.likes.includes(likeOrDislike._id))
        content.likes.push(likeOrDislike._id);
    else {
        content.likes = content.likes.filter(likeId => likeId.toString() != likeOrDislike._id.toString());
        let p = Like.findOneAndDelete({ typeOfContent: likeOrDislike.typeOfContent, contentId: likeOrDislike.contentId, username: likeOrDislike.username });

        p.then(result => {
            console.log(result);
        });
    }

    // Remove the dislike if the user has already disliked the content
    content.dislikes = content.dislikes.filter(dislikeId => dislikeId.toString() != likeOrDislike._id.toString());

    // Add content to user's list of likes, or remove it if user is unliking
    if (!user.likes.includes(likeOrDislike._id))
        user.likes.push(likeOrDislike._id);
    else
        user.likes = user.likes.filter(likeId => likeId.toString() != likeOrDislike._id.toString());
}

/**
 * Dislikes a post and updates the content and user accordingly.
 * If the user has already disliked the content, the dislike is removed.
 * If the user has already liked the content, the like is removed.
 * @param {Object} content - The content object to be updated.
 * @param {Object} likeOrDislike - The like or dislike object to be added or removed.
 * @param {Object} user - The user object whose likes are to be updated.
 */
function dislikePost(content, likeOrDislike, user) {
    // If the user has already disliked the content, remove the dislike
    if (!content.dislikes.includes(likeOrDislike._id))
        content.dislikes.push(likeOrDislike._id);
    else {
        content.dislikes = content.dislikes.filter(dislikeId => dislikeId.toString() != likeOrDislike._id.toString());
        let p = Like.findOneAndDelete({ typeOfContent: likeOrDislike.typeOfContent, contentId: likeOrDislike.contentId, username: likeOrDislike.username });

        p.then(result => {
            console.log(result);
        });
    }

    // Remove the like if the user has already liked the content
    content.likes = content.likes.filter(likeId => likeId.toString() != likeOrDislike._id.toString());

    // Remove content from user's list of likes
    if (user.likes.includes(likeOrDislike._id))
        user.likes = user.likes.filter(likeId => likeId.toString() != likeOrDislike._id.toString());
}

module.exports = router;
