
const aboutPg = document.getElementById("aboutPage");
aboutPg.addEventListener('click', ()=>{
    window.location.href = "./about.html"
});

const helpPg = document.getElementById("helpPage");
helpPg.addEventListener('click', ()=>{
    window.location.href = "./help.html"
});

const userSettings = document.getElementById("userSettings");
userSettings.addEventListener('click', showSettings);

function showSettings(){
    // need to work on the function that would show the user settings 
    
}

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
                    console.log("here");
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
                    console.log(content);
                    let article = `<div class="post-boxes" id="post-${posts[i]._id}">
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
                                <div class="like"><img onclick="likeOrDislikePost('${posts[i]._id}', true)"
                                             src=${likePNG} id="like-${i}" width="70px" height="100px" class="likeButton"><div>${posts[i].likes.length}</div>
                                     <img onclick="likeOrDislikePost('${posts[i]._id}', false)"
                                             src=${dislikePNG} id="dislike-${i}" width="70px" height="100px" class="likeButton"><div>${posts[i].dislikes.length}</div>
                                </div>
                                <div class="comments" id="commentLabel-${posts[i]._id}>
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
            let topic = topicButtons[i].textContent.trim();

            // TODO: change this to redirect to a page with the topic as a parameter
            // Probably just recycle the fetchPosts function with added params
        }
    }
}

function showComments(postID) {
    if (document.getElementById('comments-'+postID) != undefined) {
        document.getElementById('comments-'+postID).remove();
    }
    // document.getElementById('commentLabel-'+postID).innerHTML = 
    // `<span style="font-size: 1.8vh" onclick="hideComment('${postID}');"><i class='bx bxs-right-arrow' ></i>&nbsp;Hide Comments</span>`;
    
    content = `<div id="comments-${postID}"><input id="commentBox-${postID}" type="text" placeholder="Post a comment...">
                    <button onclick="addComment('${postID}');" style="width: 50px; height: 30px">Post!</button>`;
    fetch('/comments/get/'+postID)
        .then((response) => {
            return response.json();
        }).then((comments) => {
            if (comments.length == 0) {
                content += `<div>Be the first to comment!</div>`;
            } else {
                for (let i = 0; i < comments.length; i++) {
                    console.log(comments[i]);
                    content += `<div>
                                <div>@${comments[i].username}  ${getTime(comments[i].createdAt)}</div>
                                <div>${comments[i].content}</div>
                                </div>`
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
            console.log(response);
            response.json();
        })
        .then(result => {
            console.log(result);
            showComments(post_id);
        })
        .catch(error => console.log('Error adding comment', error));
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
    `<span style="font-size: 1.8vh" onclick="showComments('${posts[i]._id}');"><i class='bx bxs-right-arrow' ></i>&nbsp;Show Comments</span>`;
    if (document.getElementById('comments-'+postID) != undefined) {
        document.getElementById('comments-'+postID).remove();
    }
}
registerTopicButtonHandlers();
fetchUserDetails();
fetchPosts();
