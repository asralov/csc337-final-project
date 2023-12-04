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
                    image = "/backend/resources/news_default.png";
                }
                let likePNG = "";
                let dislikePNG = "";
                checkIfLike(posts[i]._id, localStorage.user)
                .then(hasUsed => {
                    if (hasUsed.startsWith("NO")) {
                        likePNG = "./images/like_nofill.png"
                        dislikePNG = "./images/dislike_nofill.png"
                    } else if (hasUsed.startsWith("FALSE")) {
                        likePNG = "./images/like_nofill.png"
                        dislikePNG = "./images/dislike_fill.png" 
                    } else {
                        likePNG = "./images/like_fill.png"
                        dislikePNG = "./images/dislike_nofill.png"
                    }
                    console.log(likePNG);
                    console.log(dislikePNG);
                    let content = JSON.parse(posts[i].content);
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
                                <div><a href="#" onclick="likeOrDislikePost('${posts[i]._id}', true, '${i}')"<div>${posts[i].likes.length}</div>>
                                            <img src=${likePNG} id="like-${i}" width="70px" height="100px"></a>
                                    <a href="#" onclick="likeOrDislikePost('${posts[i]._id}', false, '${i}')"<div>${posts[i].dislikes.length}</div>>
                                            <img src=${dislikePNG} id="dislike-${i}" width="70px" height="100px"></a>
                                </div>
                                </div>
                                </div>`
                                articles += article;
                                document.getElementById('post-pannel').innerHTML = articles;
                })
                .catch(error => {
                    console.error("Error checking likes:", error);
                });
                
            }

            
        });
}

function likeOrDislikePost(contentId, like, index) {
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
            if (like) {
                let img = document.getElementById("like-"+index);
                img.src = "./images/like_fill.png";
            }
            fetchPosts();
        });
}
function checkIfLike(postID, username) {
    return new Promise((resolve, reject) => {
        fetch('/likes/check/'+postID+'/'+username)
            .then((response) => {
                return response.text();
            })
            .then((resp) => {
                resolve(resp);
            })
            .catch((error) => {
                console.error("Error checking likes:", error);
                reject(error);
            });
    });
}
fetchPosts();
