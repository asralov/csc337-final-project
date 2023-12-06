let globalReplies = {};
let postIDs = [];
// function fetchPosts() {
//     fetch("/posts/recent")
//         .then((res) => res.json())
//         .then((posts) => {
//             for (let i = 0; i < posts.length; i++) {
//                 servedPosts.push(posts[i]._id)
//             }
//             createPosts(posts);
//         });
// }

function fetchPosts() {
    fetch("/posts/recent", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postIDs }),
    })
    .then((res) => res.json())
    .then((posts) => {
        for (let i = 0; i < posts.length; i++) {
            postIDs.push(posts[i]._id);
        }
        createPosts(posts);
    });
}

function fetchUserDetails() {
    fetch("/users/" + localStorage.user)
        .then((res) => res.json())
        .then((user) => {
            console.log(user);
            document.getElementById("userPic").src = "../" + user.profilePicture;
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
        typeOfContent: "Post",
        contentId: contentId,
        like: like,
    };

    fetch("/likes/toggle", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => res.json())
        .then((post) => {
            fetchPosts();
        });
}

function checkIfLike(postID, username) {
    return new Promise((resolve, reject) => {
        fetch("/likes/check/" + postID + "/" + username)
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
            fetch("/posts/topic/"+topic, {
                method:'POST',
                headers: {'Content-Type' : 'application/json',},
                body: JSON.stringify({postIDs}),
            })
                .then((response) => {
                    console.log(response);
                    return response.json();
                })
                .then((posts) => {
                    for (let i = 0; i < posts.length; i++) {
                        console.log(posts[i]);
                        postIDs.push(posts[i]._id);
                    }
                    createPosts(posts);
                });
        };
    }
}

function registerHandlers() {
    document
        .getElementById("search-box")
        .addEventListener("keypress", function (e) {
            if (e.key === "Enter") search();
        });
    document.getElementById("search-button").onclick = search;
    document.getElementById("userSettings").onclick = showUserSettings;
    registerTopicButtonHandlers();
}

function toggleReplyInput(commentID) {
    let reply = document.getElementById("reply-" + commentID);
    let replyButton = document.getElementById("addReply-" + commentID);
    if (reply.style.display === "none") {
        reply.style.display = "block";
        replyButton.style.color = "grey";
    } else {
        reply.style.display = "none";
        replyButton.style.color = "#ddd";
    }
}

async function showComments(postID) {
    if (document.getElementById('comments-' + postID) != undefined) {
        document.getElementById('comments-' + postID).remove();
    }
    document.getElementById('commentLabel-' + postID).innerHTML =
        `<span class="toggleComments" onclick="hideComment('${postID}');"><i class='bx bxs-down-arrow' ></i>&nbsp;Hide Comments</span>`;

    content = `<div id="comments-${postID}"><input class="inputComment" id="commentBox-${postID}" type="text" placeholder=" Post a comment...">
                    <button class="inputCommentButton" onclick="addComment('${postID}');">Post!</button>`;

    const response = await fetch('/comments/get/' + postID);
    const comments = await response.json();

    content += await commentCreator(comments, postID)
    
    document.getElementById("post-" + postID).innerHTML += content;
    for (let i = 0; i < comments.length; i++) {
        fetch('/users/' + comments[i].username)
        .then(res => res.json())
        .then(user => {
            document.getElementById(comments[i]._id + "-pfp").src = "../" + user.profilePicture;
        });
    }
}

function addComment(post_id) {
    var comment = document.getElementById("commentBox-" + post_id).value;
    var url = "/comments/add/" + post_id;
    var data = {
        parentId: post_id,
        content: comment,
    };
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        redirect: "follow",
    })
        .then((response) => {
            showComments(post_id);
        })
        .catch((error) => console.log("Error adding comment", error));
}

async function addReply(commentID) {
    const replyText = document.getElementById("reply-" + commentID).getElementsByTagName('input')[0].value;
    var url = '/comments/reply/' + commentID;
    var data = {
        'parentId': commentID,
        'content': replyText
    };
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        redirect: 'follow'
    })
        .then(result => {
            toggleRepliesAfterPost(commentID);
        })
        .catch(error => console.log('Error adding reply', error));
}

async function toggleRepliesAfterPost(commentID) {
    const replies = await checkReplies(commentID);
    console.log(replies);
    globalReplies[commentID] = replies;
    content = `<p class="viewReplies" onclick="showReplies('${commentID}');">Show Replies</p>`;
    document.getElementById("reply-" + commentID).parentNode.innerHTML += content;
    showReplies(commentID);
}

function checkReplies(commentID) {
    return fetch('/comments/get/replies/' + commentID)
        .then((response) => {
            return response.json();
        })
        .catch((err) => {
            console.log(err);
        });
}

async function commentCreator(comments, postID) {
    let content = ``
    if (comments.length == 0) {
        content += `<div>Be the first to comment!</div>`;
    } else {
        content += '<div>';
        for (let i = 0; i < comments.length; i++) {
            if (document.getElementById("commentBox-"+comments[i]._id) !== null) {
                continue;
            }
            const replies = await checkReplies(comments[i]._id);

            content += `<div class="commentBox" id="commentBox-${comments[i]._id}">
                <div class="commentHead">
                    <img id="${comments[i]._id}-pfp" class="commentUserPic">
                    <p class="commentUsername">@${comments[i].username}</p>
                    <p class="commentDate">${getTime(comments[i].createdAt)}
                </div>
                <div class="commentContent">
                    ${comments[i].content}
                    <div class="actionButtons">
                        <p id="addReply-${comments[i]._id}" class="replyText" onclick="toggleReplyInput('${comments[i]._id}');">Reply</p>`;

            if (replies.length > 0) {
                globalReplies[comments[i]._id] = replies;
                content += `<p class="viewReplies" onclick="showReplies('${comments[i]._id}');">Show Replies</p>`;
            }

            if (comments[i].username == localStorage.user) {
                content += `<p class="deleteText" onclick="deleteComment('${comments[i]._id}','${postID}');">Delete</p>`;
            }

            content += `
                    </div>
                    <div class="reply" id="reply-${comments[i]._id}" style="display: none;">
                        <input class="reply" type="text" placeholder="Reply..." style="color: black">
                        <button onclick="addReply('${comments[i]._id}');">Post</button>
                    </div>
                    </div>
                    </div>`;
        }
        content += '</div>';
        return content
    }
    return content;
}

async function showReplies(postID) {
    let comments = globalReplies[postID];
    let content = await commentCreator(comments, postID)
    document.getElementById("reply-" + postID).innerHTML += content;
    for (let i = 0; i < comments.length; i++) {
        fetch('/users/' + comments[i].username)
        .then(res => res.json())
        .then(user => {
            document.getElementById(comments[i]._id + "-pfp").src = "../" + user.profilePicture;
        });
    }
    toggleReplyInput(postID);
}

function deleteComment(commentID, postID) {
    var url = "/comments/delete/" + commentID;
    fetch(url, {
        method: "POST",
        redirect: "follow",
    })
        .then((result) => {
            showComments(postID);
        })
        .catch((error) => console.log("Error deleting comment", error));
}

function getTime(date) {
    let currentTime = Date.now();
    dateObj = new Date(date);
    let dif = currentTime - dateObj.getTime();
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
    document.getElementById(
        "commentLabel-" + postID
    ).innerHTML = `<span class="toggleComments" onclick="showComments('${postID}');"><i class='bx bxs-right-arrow' ></i>&nbsp;Show Comments</span>`;
    if (document.getElementById("comments-" + postID) != undefined) {
        document.getElementById("comments-" + postID).remove();
    }
}

function search() {
    const query = document.getElementById("search-box").value;
    fetch("/posts/search/" + query)
        .then((response) => {
            console.log(response);
            return response.json();
        })
        .then((result) => {
            createPosts(result);
        });
}

function showUserSettings() {
    let userPic = document.getElementById("userPic").src;
    let userName = localStorage.getItem("user");
    document.getElementById(
        "searchEngine"
    ).innerHTML = `<input type="text" id="search-box" placeholder="Search...">
                                                            <button id="search-button" class="searchBtn">
                                                                <img src="./images/search.png" alt="searchLogo"> 
                                                            </button>
                                                            <button id="userSettings" onclick="hideUserSettings();">
                                                            <img src="" id="userPic">
                                                        </button>`;
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
                        <input id="fname" class="userN" type="text" name="fName" value=${getFirstName(
        userName
    )}>
                        <button onclick="editFName('${userName}')" class="addBtn"> Save </button>
                        </div><br>
                        <div>
                        <label for="lName">Last Name</label>
                        <input id="lname" class="userN" type="text" name="lName" value=${getLastName(
        userName
    )}>
                        <button onclick="editLName('${userName}')" class="addBtn"> Save </button>
                        </div><br>
                        <div>
                            <form action="/uploads/profilePicture" method="post" enctype="multipart/form-data">
                                <input type="file" name="profilePicture" id="uploadFile">
                                <button id="uploadBtn" type="submit">Upload</button>
                            </form>
                        </div>
                    </div>`;

    document.body.innerHTML += content;

    fetchUserDetails();
}

function hideUserSettings() {
    console.log("here");
    document.getElementById("userSettingsBox").remove();
    document.getElementById(
        "searchEngine"
    ).innerHTML = `<input type="text" id="search-box" placeholder="Search...">
                                                        <button id="search-button" class="searchBtn">
                                                            <img src="./images/search.png" alt="searchLogo"> 
                                                        </button>
                                                        <button id="userSettings" onclick="showUserSettings();">
                                                        <img src="" id="userPic">
                                                        </button>`;

    fetchUserDetails();
}

function createPosts(posts) {
    let articles = "";
    if (posts.length == 0)
        document.getElementById("post-pannel").innerHTML = articles;
    for (let i = 0; i < posts.length; i++) {
        
        
        let topicsArr = posts[i].topics[0].split(',');
        topicsArr = topicsArr.map(topic => {
            const words = topic.trim().split(' ');
            const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
            return capitalizedWords.join(' ');
        });
        let topics = topicsArr.join(', ');
        let likePNG = "";
        let dislikePNG = "";

        checkIfLike(posts[i]._id, localStorage.user)
            .then((hasUsed) => {
                if (hasUsed.startsWith("NO")) {
                    likePNG = "./images/like_nofill.png";
                    dislikePNG = "./images/dislike_nofill.png";
                } else if (hasUsed.startsWith("FALSE")) {
                    likePNG = "./images/like_nofill.png";
                    dislikePNG = "./images/dislike_fill.png";
                } else {
                    likePNG = "./images/like_fill.png";
                    dislikePNG = "./images/dislike_nofill.png";
                }
                let content = posts[i].content;
                let dateObj = new Date(posts[i].date)
                let article = `<div class="post-boxes" id="post-${posts[i]._id}">
                        <div class="article">
                        <h1>${posts[i].title}</h1>
                        <i>${dateObj.toLocaleDateString()}</i><br>
                        <i>Topics: ${topics}</i>
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
                            <span class="toggleComments" onclick="showComments('${posts[i]._id}');"><i class='bx bxs-right-arrow' ></i>&nbsp;Show Comments</span>
                        </div>
                        </div>
                        </div>`;
                articles += article;

                document.getElementById("post-pannel").innerHTML = articles;
                document.getElementById("post-pannel").innerHTML += `<button id="loadMore" onclick="loadMoreContent();">Load More</button>`
            })
            .catch((error) => {
                console.error("Error checking likes:", error);
            });
    }
}

function loadMoreContent() {
    console.log("here");
    fetchPosts();
}

function getFirstName(user) {
    fetch("/users/fname/" + user)
        .then((result) => {
            console.log(result);
            return result.text();
        })
        .then((name) => {
            document.getElementById("fname").value = name;
        });
}

function getLastName(user) {
    fetch("/users/lname/" + user)
        .then((result) => {
            console.log(result);
            return result.text();
        })
        .then((name) => {
            document.getElementById("lname").value = name;
        });
}

function editFName(user) {
    let newFName = document.getElementById("fname").value;
    let data = { username: user, name: newFName };
    let p = fetch("/users/edit/fname", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    });

    p.then((response) => {
        if (response.ok) {
            console.log("user updated successfully");
        }
    });
}

function editLName(user) {
    let newFName = document.getElementById("lname").value;
    let data = { username: user, name: newFName };
    let p = fetch("/users/edit/lname", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    });

    p.then((response) => {
        if (response.ok) {
            console.log("user updated successfully");
        }
    });
}

function uploadProfilePicture() {
    let file = document.getElementById('uploadFile').files[0];
    let data = new FormData();
    data.append('file', file);

    let p = fetch('/uploads/profilePicture', {
        method: 'POST',
        body: data
    });

    // p.then((response) => {
    //     console.log("here");
    //     hideUserSettings();
    //     showUserSettings()

    // }).catch((error) => {
    //     console.log(error);
    // });
}

registerHandlers();
fetchUserDetails();
fetchPosts();
