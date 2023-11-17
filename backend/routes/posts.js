const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.post('/add', async (req, res) => {
    const post = new Post(req.body);
    post.userId = req.session.userId;
    await post.save();
});

module.exports = router;