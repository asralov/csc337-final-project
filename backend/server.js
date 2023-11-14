// Basic example
const express = require('express');
const mongoose = require('mongoose');
const usersRouter = require('./routes/users'); 
const postsRouter = require('./routes/posts'); 
const commentsRouter = require('./routes/comments'); 

const app = express();
const port = 3000;

app.use(express.json()); 

// MongoDB connection setup
mongoose.connect('mongodb://localhost/ostaa', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Use routes
app.use('/users', usersRouter);
app.use('/comments', commentsRouter);
app.use('/posts', postsRouter);



app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
