const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Add a new post
router.post('/add', async (req, res) => {
    const postData = req.body;
    try {
        const post = new Post({
            title: postData.title,
            content: { background: postData.background, summary: postData.summary, bias: postData.bias },
            topics: postData.topics,
            urls: postData.urls
        });
        await post.save();
        res.status(201).json({ message: 'Post created successfully', _id: post._id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error adding post', error: error.message });
    }
});


router.get('/topic/:topic', async (req, res) => {
    try {
        // Fetch day old posts 
        console.log()
        const recentPosts = await Post.find({ 
            topics: req.params.topic,
            date: { $gt: new Date(Date.now() - 3*24*60*60*1000) }
        })
        // .sort({
        //     'likes.length': -1, 
        //     'dislikes.length': -1, 
        //     'comments.length': -1, 
        // });

        // Fetch older posts
        const olderPosts = await Post.find({ 
            topics: req.params.topic,
            date: { $gt: new Date(Date.now() - 5*24*60*60*1000) } 
        })
        //.sort({ date: -1 }); // Sort by date in descending order

        // Combine the two arrays, prioritizing recent posts
        const sortedPosts = recentPosts.concat(olderPosts);
        res.json(sortedPosts);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
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

router.get('/all', async (req, res) => {
    try {
        // Fetch recent posts (last 24 hours)
        const recentPosts = await Post.find({
            date: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        // Sort recent posts based on interactions (likes, dislikes, comments)
        recentPosts.sort((a, b) => {
            const scoreA = a.likes.length + a.comments.length - a.dislikes.length;
            const scoreB = b.likes.length + b.comments.length - b.dislikes.length;
            return scoreB - scoreA; // Sort in descending order of score
        });

        // Fetch older posts (older than 24 hours), no change in this logic
        const olderPosts = await Post.find({
            date: { $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }).sort({ date: -1 }); // Sorted by date in descending order

        const sortedPosts = recentPosts.concat(olderPosts);

        res.json(sortedPosts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

router.get("/search/:query", async (req, res) => {
    try {
        const regexQuery = { $regex: req.params.query, $options: "i" };
        const posts = await Post.find({
            $or: [
                { title: regexQuery },
                { 'content.summary': regexQuery }
            ]
        });

        // Sort by likes, then comments, then dislikes
        posts.sort((a, b) => {
            const aScore = a.likes.length - a.dislikes.length + a.comments.length;
            const bScore = b.likes.length - b.dislikes.length + b.comments.length;
            return bScore - aScore;
        });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts' });
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
