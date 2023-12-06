/**
 * Authors: Ryder Rhoads and Michael Evans
 * File: server.js
 * Description: Main entry point for the application.
 * This script sets up the server, connects to MongoDB, and configures middleware and routes for handling 
 * different aspects of the application like user authentication, file uploads, comments, likes, posts, 
 * and user management.
 */

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authenticator = require('./config/authConfig');
const loginRouter = require('./routes/login');
const uploadRouter = require('./routes/uploads');
const http = require('http');
const https = require('https');
const commentsRouter = require('./routes/comments');
const likesRouter = require('./routes/likes');
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');
const app = express();
const fs = require('fs');

// HTTPS Certificate
//const privateKey = fs.readFileSync('/etc/letsencrypt/live/losethebias.com/privkey.pem', 'utf8');
//const certificate = fs.readFileSync('/etc/letsencrypt/live/losethebias.com/cert.pem', 'utf8');
//const ca = fs.readFileSync('/etc/letsencrypt/live/losethebias.com/chain.pem', 'utf8');
//const credentials = {
//	key: privateKey,
//	cert: certificate,
//	ca: ca
//};

// MongoDB connection setup
mongoose.connect('mongodb://127.0.0.1:27017/losethebias', { useNewUrlParser: true, useUnifiedTopology: true })
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
app.use('/favicon.ico', express.static('resources/favicon.ico'));
app.use(express.static('../frontend/'));

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});

//httpsServer.listen(443, () => {
//	console.log('HTTPS Server running on port 443');
//});
