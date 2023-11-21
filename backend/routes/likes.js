const express = require('express');
const router = express.Router();
const Like = require('../models/Like');

// Like or Dislike Content
router.post('/add', async (req, res) => {
    const { typeOfContent, contentId, userId, like } = req.body;

    try {
        let existingLike = await Like.findOne({ typeOfContent, contentId, userId });

        if (existingLike) {
            existingLike.like = like;
            existingLike.display = true;
            await existingLike.save();
        } else {
            const newLike = new Like({ typeOfContent, contentId, userId, like, display: true });
            await newLike.save();
        }

        res.status(200).json({ message: 'Your response has been recorded' });
    } catch (error) {
        res.status(500).json({ message: 'Error processing request', error: error.message });
    }
});

// Remove Like or Dislike
router.post('/remove', async (req, res) => {
    const { typeOfContent, contentId, userId } = req.body;

    try {
        let like = await Like.findOne({ typeOfContent, contentId, userId });

        if (like) {
            like.display = false;
            await like.save();
            res.status(200).json({ message: 'Like/Dislike removed' });
        } else {
            res.status(404).json({ message: 'Like/Dislike not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error processing request', error: error.message });
    }
});

// Get Likes/Dislikes for a specific content
router.get('/:contentID', async (req, res) => {
    const contentID = req.params.contentID;
    const { typeOfContent, like } = req.query; 

    try {
        const filter = {
            contentId: contentID,
            display: true
        };

        if (typeOfContent === 'Post' || typeOfContent === 'Comment') {
            filter.typeOfContent = typeOfContent;
        } else {
            return res.status(400).json({ message: 'Invalid typeOfContent' });
        }
        if (like !== undefined) {
            filter.like = like === 'true';
        }

        const likesOrDislikes = await Like.find(filter);

        res.status(200).json(likesOrDislikes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching likes/dislikes', error: error.message });
    }
});


// Count Likes and Dislikes for a specific post
router.get('/count/:postID', async (req, res) => {
    const postID = req.params.postID;

    try {
        const likesCount = await Like.countDocuments({ typeOfContent: 'Post', contentId: postID, like: true, display: true });
        const dislikesCount = await Like.countDocuments({ typeOfContent: 'Post', contentId: postID, like: false, display: true });

        res.status(200).json({ likes: likesCount, dislikes: dislikesCount });
    } catch (error) {
        res.status(500).json({ message: 'Error counting likes/dislikes', error: error.message });
    }
});


module.exports = router;
