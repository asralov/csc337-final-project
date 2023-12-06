/**
 * File Name: posts.js
 * Authors: Ryder Rhoads and Michael Evans
 * Description: This file contains Express routes for managing posts in the application. It includes routes 
 * for adding new posts, fetching posts based on various criteria like topics, search queries, and post ID, 
 * editing and deleting posts. It uses the Post model to interact with the database and manage post data.
 * 
 * Routes:
 * POST /posts/add - Add a new post with detailed content.
 * POST /posts/edit/:id - Edit the content of an existing post.
 * DELETE /posts/delete/:id - Delete a post by its ID.
 * GET /posts/recent - Fetch 50 recent posts, sorted by interactions
 * GET /posts/search/:query - Search for posts based on a query string.
 * GET /posts/topic/:topic - Fetch posts filtered by a specific topic.
 * GET /posts/:id - Fetch a single post by its ID.
 */
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Add new post 
router.post('/add', async (req, res) => {
    const postData = req.body;
    console.log(req.body);
    try {
        const post = new Post({
            title: postData.title,
            content: {
                background: postData.content.background,
                summary: postData.content.summary,
                bias: postData.content.bias
            },
            topics: postData.topics,
            urls: postData.urls,
            imageURL: postData.imageURL,
            imageSource: postData.imageSource
        });
        await post.save();
        res.status(201).json({ message: 'Post created successfully', _id: post._id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error adding post', error: error.message });
    }
});

// Edit an existing post
router.post('/edit/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post)
            return res.status(404).json({ message: 'Post not found' });

        post.title = req.body.title;
        post.content = req.body.content;

        await post.save();
        res.json({ message: 'Post updated successfully', post });
    } catch (error) {
        res.status(500).json({ message: 'Error updating post', error });
    }
});

// Delete a post
router.delete('/delete/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post)
            return res.status(404).json({ message: 'Post not found' });

        await post.remove();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error });
    }
});

// Get 50 most recent posts
router.post('/recent', async (req, res) => {
    try {
        const { postIDs } = req.body;

        // Modify the query to exclude posts that are already in the postIDs array
        const posts = await Post.aggregate([
            { $match: { _id: { $nin: postIDs.map(id => mongoose.Types.ObjectId(id)) } } }, // Matches IDs and makes sure they are not in using nin
            { $sort: { date: -1 } }, 
            { $limit: 50 },
            {
                $addFields: {
                    interactionScore: { 
                        $sum: [{ $size: "$likes" }, { $size: "$dislikes" }, { $size: "$comments" }]
                    }
                }
            },
            { $sort: { interactionScore: -1 } }
        ]);

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
});



// Get posts based on a search query
router.get('/search/:query', async (req, res) => {
    try {
        const queryRegex = new RegExp(req.params.query, 'i');

        const posts = await Post.aggregate([
            {
                $match: {
                    $or: [
                        { title: { $regex: queryRegex } },
                        { "content.summary": { $regex: queryRegex } },
                        { "content.background": { $regex: queryRegex } },
                        { "content.bias": { $regex: queryRegex } },
                        { topics: { $regex: queryRegex } }
                    ]
                }
            },
            { $sort: { date: -1 } }, 
            { $limit: 50 }, 
            {
                $addFields: {
                    totalInteractions: { 
                        $sum: [
                            { $size: "$likes" }, 
                            { $size: "$dislikes" }, 
                            { $size: "$comments" }
                        ] 
                    }
                }
            },
            { $sort: { totalInteractions: -1 } }
        ]);

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
});

// Get posts filtered by topic
router.post('/topic', async (req, res) => {
    try {
        topic = req.body.topic;
        const topicRegex = new RegExp(topic, 'i'); 

        const posts = await Post.aggregate([
            {
                $match: {
                    topics: { $regex: topicRegex }
                }
            },
            { $sort: { date: -1 } }, 
            { $limit: 50 }, 
            {
                $addFields: {
                    totalInteractions: { 
                        $sum: [
                            { $size: "$likes" }, 
                            { $size: "$dislikes" }, 
                            { $size: "$comments" }
                        ] 
                    }
                }
            },
            { $sort: { totalInteractions: -1 } }
        ]);

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
});

// Get a single post by ID
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post)
            return res.status(404).json({ message: 'Post not found' });

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post', error });
    }
});

module.exports = router;
