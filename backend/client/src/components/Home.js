import './home.css';
import React from 'react';

const url = 'http://localhost:80';

const Home = () => {
    return (
        <div id="wraper">
            <h2>Lose the Bias!</h2>
            <div id="posts"></div>
        </div>
    );
};

function fetchPosts() {
    fetch(url + '/posts/all')
        .then(res => res.json())
        .then(posts => {
            const postsHTML = posts.map(post => {
                return `<a href="/posts/${post._id}"><h2>${post.title}</h2></a>
                        <p>${post.content}</p>
                        <p>Likes: ${post.likes.length} | Dislikes: ${post.dislikes.length}</p>
                        <p>Topics: ${post.topics.join(', ')}</p>
                        <span><input type="button" value="Like" onclick="likeOrDislikePost('${post._id}', true)">
                        <input type="button" value="Dislike" onclick="likeOrDislikePost('${post._id}', false)"></span>`;
            }).join('');

            // document.getElementById('posts').innerHTML = postsHTML;
        });
}

function fetchPost(postId) {
    fetch(url + `/posts/${postId}`)
        .then(res => res.json())
        .then(post => {
            document.getElementById('post-title').innerHTML = post.title;
            document.getElementById('post-content').innerHTML = post.content;
        });
}       

function likeOrDislikePost(contentId, like) {
    var data = {
        'typeOfContent': 'Post',
        'contentId': contentId,
        'like': like
    };

    fetch(url + '/likes/toggle', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    })
        .then(res => res.json())
        .then(post => {
            fetchPosts();
        });
}

fetchPosts();

export default Home;