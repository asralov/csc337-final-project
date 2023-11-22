const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Add a new post
router.post('/add', async (req, res) => {
    try {
        const post = new Post(req.body);
        
        await post.save();
        res.status(201).json({ message: 'Post created successfully', _id: post._id });
    } catch (error) {
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

// Get all posts
router.get('/all', async (req, res) => {
    try {
        const posts = await Post.find({});

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
