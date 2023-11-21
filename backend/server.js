const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');
const authenticate = require('./config/authConfig');

const app = express();
const port = 80;

// MongoDB connection setup
mongoose.connect('mongodb://0.0.0.0:27017/losethebias', { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('MongoDB Connected'))
	.catch(err => console.log(err));

// Use routes
app.set('json spaces', 2);

app.use(cookieParser());    
app.use(express.json());
// app.use('/uploads', authenticate.authenticate, express.static('uploads'));
app.use('/comments', authenticate.authenticate, commentsRouter);
app.use('/posts', authenticate.authenticate, postsRouter);
app.use('/users', authenticate.authenticate, usersRouter);
app.use('/app/*', authenticate.authenticate);
app.get('/app/*', (req, res, next) => {
    next();
});
app.use(express.static('../frontend/')); // TODO change how/where this is served

app.listen(port, () => {
	console.log(`Server is running on port: ${port}`);
});
