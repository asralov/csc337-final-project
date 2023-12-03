function fetchPosts() {
    fetch('/posts/all')
        .then(res => res.json())
        .then(posts => {
            let articles = ""
            for (let i = 0; i < posts.length; i++) {
                let topics = ""
                for (let j = 0; j < posts[i].topics.length; j++) {
                    topics += posts[i].topics[j] + " ";
                }
                let image = posts[i].image;
                if (image == undefined) {
                    image = "./images/news_default.png";
                }
                let content = JSON.parse(posts[i].content);
                console.log(content);
                let article = `<div class="post-boxes">
                                <div class="article">
                                <h1>${posts[i].title}</h1>
                                <i>${posts[i].date}</i><br>
                                <i>Topics:${topics}</i><hr>
                                <img src="${image}" width="700px" height="450px">
                                <h3 id="img-source">Source: (Need to implement)</h3>
                                <hr>
                                <h2>Background</h2>
                                <p>${content.background}</p>
                                <h2>Summary</h2>
                                <p>${content.summary}</p>
                                <h2>Bias</h2>
                                <p>Need to implement</p>
                                </div>
                                </div>`
                articles += article;
            }

            // const postsHTML = posts.map(post => {
            //     return `<h2>${post.title}</h2>
            //             <p>${post.content}</p>
            //             <p>Likes: ${post.likes.length} | Dislikes: ${post.dislikes.length}</p>
            //             <p>Topics: ${post.topics.join(', ')}</p>
            //             <span><input type="button" value="Like" onclick="likeOrDislikePost('${post._id}', true)">
            //             <input type="button" value="Dislike" onclick="likeOrDislikePost('${post._id}', false)"></span>`;
            // }).join('');
            document.getElementById('post-pannel').innerHTML = articles;
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
