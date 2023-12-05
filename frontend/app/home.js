
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
                                <div class="like"><img onclick="likeOrDislikePost('${posts[i]._id}', true, '${i}')"
                                             src=${likePNG} id="like-${i}" width="70px" height="100px" class="likeButton"><div>${posts[i].likes.length}</div>
                                     <img onclick="likeOrDislikePost('${posts[i]._id}', false, '${i}')"
                                             src=${dislikePNG} id="dislike-${i}" width="70px" height="100px" class="likeButton"><div>${posts[i].dislikes.length}</div>
                                </div>
                                <div class="comments">
                                    <span style="font-size: 1.8vh"><i class='bx bxs-right-arrow' ></i>&nbsp;Show Comments</span>
                                </div>
                                </div>
                                </div>`
                                articles += article;
                                console.log(articles);
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
                let img = document.getElementById("like-" + index);
                img.src = "./images/like_fill.png";
            }

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

registerTopicButtonHandlers();
fetchUserDetails();
fetchPosts();
