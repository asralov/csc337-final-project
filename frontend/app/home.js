


function fetchPosts() {
    fetch('/posts/all')
        .then(res => res.json())
        .then(posts => {
            createPosts(posts);
    });
}

function fetchUserDetails() {
    fetch('/users/' + localStorage.user)
        .then(res => res.json())
        .then(user => {
            console.log(user);
            document.getElementById('userPic').src = "../" + user.profilePicture;
        });
}

/**
 * Toggles the like or dislike status of a post.
 * 
 * @param {string} contentId - The ID of the post content.
 * @param {boolean} like - Indicates whether the post should be liked or disliked.
 * @param {number} index - The index of the post in the list.
 */
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

function checkIfLike(postID, username) {
    return new Promise((resolve, reject) => {
        fetch('/likes/check/' + postID + '/' + username)
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

/**
 * Registers event handlers for topic buttons.
 */
function registerTopicButtonHandlers() {
    let topicButtons = document.getElementsByClassName("topic-button");
    for (let i = 0; i < topicButtons.length; i++) {
        topicButtons[i].onclick = function () {
            let topic = topicButtons[i].textContent.trim().toLocaleLowerCase();
            fetch('/posts/topic/'+topic)
                .then((response) => {
                    console.log(response);
                    return response.json();
                }).then((posts) => {
                    for (let i = 0; i < posts.length; i++) {
                        console.log(posts[i]);
                    }
                    createPosts(posts);
                });
        }
    }
}

function showComments(postID) {
    if (document.getElementById('comments-'+postID) != undefined) {
        document.getElementById('comments-'+postID).remove();
    }
    document.getElementById('commentLabel-'+postID).innerHTML = 
    `<span style="font-size: 1.8vh" onclick="hideComment('${postID}');"><i class='bx bxs-down-arrow' ></i>&nbsp;Hide Comments</span>`;
    
    content = `<div id="comments-${postID}"><input class="inputComment" id="commentBox-${postID}" type="text" placeholder=" Post a comment...">
                    <button class="inputCommentButton" onclick="addComment('${postID}');">Post!</button>`;
    fetch('/comments/get/'+postID)
        .then((response) => {
            return response.json();
        }).then((comments) => {
            if (comments.length == 0) {
                content += `<div>Be the first to comment!</div>`;
            } else {
                for (let i = 0; i < comments.length; i++) {

                    content += `<div class="commentBox">
                                <div class="commentHead">@<span class="usernamePost"><strong>${comments[i].username}</strong></span> ~ <span class="postDate"><em>${getTime(comments[i].createdAt)}</em></span></div>
                                <div class="commentContent">
                                    ${comments[i].content}`
                    if (comments[i].username == localStorage.user) {
                        content += `<button onclick="deleteComment('${comments[i]._id}','${postID}');">Delete</button>`
                                    }
                    content +=      `<div class="reply">
                                        <input class="reply" type="text" placeholder=" reply...">
                                    </div></div></div>`
                }
            }
            content += `</div>`;
            document.getElementById("post-"+postID).innerHTML += content;
        })
    
}

function addComment(post_id) {
    var comment = document.getElementById("commentBox-"+post_id).value;
    var url = '/comments/add/' + post_id;
    var data = {
        'parentId': post_id,
        'content': comment
    };
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        redirect: 'follow'
    })
        .then(response => {
            showComments(post_id);
        })
        .catch(error => console.log('Error adding comment', error));
}

function deleteComment(commentID, postID) {
    var url = '/comments/delete/' + commentID;
    fetch(url, {
        method: 'POST',
        redirect: 'follow'
    })
    .then(result => {
        showComments(postID);
    })
    .catch(error => console.log('Error deleting comment', error));
}

function getTime(date) {
    let currentTime = Date.now();
    dateObj = new Date(date)
    let dif = (currentTime- dateObj.getTime());
    let seconds = dif / 1000;

    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    if (days >= 1) {
        return days + (days > 1 ? " days ago" : " day ago");
    } else if (hours >= 1) {
        return hours + (hours > 1 ? " hrs ago" : " hr ago");
    } else if (minutes >= 1) {
        return minutes + (minutes > 1 ? " mins ago" : " min ago");
    } else {
        return "Just now";
    }
}

function hideComment(postID) {
    document.getElementById('commentLabel-'+postID).innerHTML = 
    `<span style="font-size: 1.8vh" onclick="showComments('${postID}');"><i class='bx bxs-right-arrow' ></i>&nbsp;Show Comments</span>`;
    if (document.getElementById('comments-'+postID) != undefined) {
        document.getElementById('comments-'+postID).remove();
    }
}

function search() {
    const query = document.getElementById('search-box').value
    fetch('/posts/search/'+query)
    .then((response) => {
        console.log(response);
        return response.json();
    }).then((result) => {
        createPosts(result);
    })
}

function showUserSettings() {
    let userPic = document.getElementById('userPic').src;
    let userName = localStorage.getItem('user');
    document.getElementById('searchEngine').innerHTML = `<input type="text" id="search-box" placeholder="Search...">
                                                            <button onclick="search()"><i class='bx bx-search-alt'></i></button>
                                                            <button id="userSettings" onclick="hideUserSettings();">
                                                            <img src="" id="userPic">
                                                        </button>`
    let content = `<div id="userSettingsBox">
                        <div>
                        <button id="close" onclick="hideUserSettings();"><i class='bx bx-x'></i></button>
                        </div>
                        <div style="display: flex;
                                    gap: 4%;">
                        <img src=${userPic} id="userPicSettings">   
                        <h2>@${userName}</h2>
                        </div><br>
                        <div>
                        <label for="fName">First Name</label>
                        <input class="userN" type="text" name="fName">
                        <button class="addBtn"><i class='bx bx-plus' ></i></button>
                        </div><br>
                        <div>
                        <label for="lName">Last Name</label>
                        <input class="userN" type="text" name="lName">
                        <button class="addBtn"><i class='bx bx-plus' ></i></button>
                        </div><br>
                    </div>`;
    
    document.body.innerHTML += content;

    fetchUserDetails();
}

function hideUserSettings() {
    console.log("here");
    document.getElementById('userSettingsBox').remove();
    document.getElementById('searchEngine').innerHTML = `<input type="text" id="search-box" placeholder="Search...">
                                                        <button onclick="search()"><i class='bx bx-search-alt'></i></button>
                                                        <button id="userSettings" onclick="showUserSettings();">
                                                        <img src="" id="userPic">
                                                        </button>`

    fetchUserDetails();
}

function createPosts(posts) {
    let articles = ""
    if (posts.length == 0) document.getElementById('post-pannel').innerHTML = articles;
    for (let i = 0; i < posts.length; i++) {
        let topics = ""
        for (let j = 0; j < posts[i].topics.length; j++) {
            topics += posts[i].topics[j] + " ";
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
            let content = posts[i].content;
            let article = `<div class="post-boxes" id="post-${posts[i]._id}">
                        <div class="article">
                        <h1>${posts[i].title}</h1>
                        <i>${posts[i].date}</i><br>
                        <i>Topics:${topics}</i>
                        <hr>
                        <h2>Background</h2>
                        <p>${content.background}</p>
                        <h2>Summary</h2>
                        <p>${content.summary}</p>
                        <h2>Bias</h2>
                        <p>${content.bias}</p>
                        <div class="like"><img onclick="likeOrDislikePost('${posts[i]._id}', true)"
                                        src=${likePNG} id="like-${i}" class="likeButton"><div>${posts[i].likes.length}</div>
                                <img onclick="likeOrDislikePost('${posts[i]._id}', false)"
                                        src=${dislikePNG} id="dislike-${i}" class="likeButton"><div>${posts[i].dislikes.length}</div>
                        </div>
                        
                        <div class="comments" id="commentLabel-${posts[i]._id}">
                            <span style="font-size: 1.8vh" onclick="showComments('${posts[i]._id}');"><i class='bx bxs-right-arrow' ></i>&nbsp;Show Comments</span>
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
}
registerTopicButtonHandlers();
fetchUserDetails();
fetchPosts();
