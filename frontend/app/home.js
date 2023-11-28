function fetchPosts() {
    fetch('/posts/all')
        .then(res => res.json())
        .then(posts => {
            const postsHTML = posts.map(post => {
                return `<h2>${post.title}</h2>
                        <p>${post.content}</p>
                        <p>Likes: ${post.likes.length} | Dislikes: ${post.dislikes.length}</p>
                        <p>Topics: ${post.topics.join(', ')}</p>
                        <span><input type="button" value="Like" onclick="likeOrDislikePost('${post._id}', true)">
                        <input type="button" value="Dislike" onclick="likeOrDislikePost('${post._id}', false)"></span>`;
            }).join('');

            document.getElementById('posts').innerHTML = postsHTML;
        });
}

function likeOrDislikePost(contentId, like) {
    var data = {
        'typeOfContent': 'Post',
        'contentId': contentId,
        'like': like
    };

    fetch('/likes/toggle', {
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
