/**
 * Adds a post to the server.
 */
function addPost() {
    var title = document.getElementById("postTitle").value;
    var content = document.getElementById("postContent").value;
    var url = '/posts/add';
    var data = {
        'title': title,
        'content': content,
        'topics': ['Business', 'Technology']
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        redirect: 'follow'
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            window.location.href = '/posts/' + result._id;
        })
        .catch(error => console.log('Error adding post', error));
}

/**
 * Adds a comment to a post.
 */
function addComment() {
    var comment = document.getElementById("comment").value;
    var post_id = document.getElementById("postId").value;
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
            response.json();
        })
        .then(result => {
            console.log(result);
            window.location.href = '/posts/' + post_id;
        })
        .catch(error => console.log('Error adding comment', error));
}

/**
 * Adds a reply to a comment.
 */
function addReply() {
    var reply = document.getElementById("reply").value;
    var comment_id = document.getElementById("commentId").value;
    var url = '/comments/reply/' + comment_id;
    var data = {
        'parentId': comment_id,
        'content': reply
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        redirect: 'follow'
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            window.location.href = '/posts/' + result.parentId;
        })
        .catch(error => console.log('Error adding reply', error));
}

/**
 * Deletes a comment.
 */
function deleteComment() {
    var comment_id = document.getElementById("deleteCommentId").value;
    var url = '/comments/delete/' + comment_id;

    fetch(url, {
        method: 'POST',
        redirect: 'follow'
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            window.location.href = '/posts/' + result.parentId;
        })
        .catch(error => console.log('Error deleting comment', error));
}

function addUserTest() {
    let username = document.getElementById('createUsername').value;
    let password = document.getElementById('createPassword').value;
    let data = { username: username, password: password };

    let p = fetch('/users/add', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    });

    p.then(() => {
        window.alert("User " + username + " created!");
    }).catch((error) => {
        console.log(error);
    });
}

function loginUserTest() {
    let username = document.getElementById('loginUsername').value;
    let password = document.getElementById('loginPassword').value;
    let data = { username: username, password: password };

    let p = fetch('/users/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    });

    p.then((response) => {
        console.log(response);
        window.location.href = response.url;
    }).catch((error) => {
        console.log(error);
    });
}

/**
 * Registers event handlers for various actions.
 */
function registerHandlers() {
    document.getElementById("createPost").onclick = addPost;
    document.getElementById("postComment").onclick = addComment;
    document.getElementById("postReply").onclick = addReply;
    document.getElementById("deleteComment").onclick = deleteComment;
    document.getElementById("createUser").onclick = addUserTest;
    document.getElementById("loginUser").onclick = loginUserTest;
}

registerHandlers();