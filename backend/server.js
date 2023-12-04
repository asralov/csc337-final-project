const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authenticator = require('./config/authConfig');
const loginRouter = require('./routes/login');
const uploadRouter = require('./routes/uploads');
const commentsRouter = require('./routes/comments');
const likesRouter = require('./routes/likes');
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');

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
app.use('/login', loginRouter);
app.use('/uploads', authenticator.authenticate, express.static('uploads'), uploadRouter);
app.use('/comments', authenticator.authenticate, commentsRouter);
app.use('/likes', authenticator.authenticate, likesRouter);
app.use('/posts', authenticator.authenticate, postsRouter);
app.use('/users', authenticator.authenticate, usersRouter);
app.use('/app/*', authenticator.authenticate);
app.get('/app/*', (req, res, next) => {
    next();
});
app.use(express.static('../frontend/')); // TODO change how/where this is served

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
