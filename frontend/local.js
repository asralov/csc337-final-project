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
        'userId': 'mike',
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
            console.log("LOL");
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
        'userId': 'mike',
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
        method: 'GET',
        redirect: 'follow'
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            window.location.href = '/posts/' + result.parentId;
        })
        .catch(error => console.log('Error deleting comment', error));
}

/**
 * Registers event handlers for various actions.
 */
function registerHandlers() {
    document.getElementById("createPost").onclick = addPost;
    document.getElementById("postComment").onclick = addComment;
    document.getElementById("postReply").onclick = addReply;
    document.getElementById("deleteComment").onclick = deleteComment;
}

registerHandlers();


/**
 * This function get called whenever a user presses the log in button.
 * Sends POST request to the server. If successful, sends the user to 
 * the homepage
 */
function loginUser() {
    let us = document.getElementById('user').value;
    localStorage.setItem("user", us)
    let pw = document.getElementById('password').value;
    let data = {username: us, password: pw};
    let p = fetch('/users/login', {
      method: 'POST', 
      body: JSON.stringify(data),
      headers: {"Content-Type": "application/json"}
    });
    p.then((response) => {
      return response.text();
    }).then((text) => {
      console.log(text);
      if (text.startsWith('SUCCESS')) {
        window.location.href = '/app/home.html';
      } else {
        alert('FAILED');
      }
    });
  }

  function addUser() {
    let us = document.getElementById('user').value;
    let pw = document.getElementById('password').value;
    let data = {username: us, password: pw};
    // Encodes the password for protection
    let p = fetch('/users/add', {
        method: 'POST', 
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
      });
    p.then((response) => {
      return response.text();
    }).then((text) => { 
       window.alert(text);
    }).catch((err) => {
      console.log("yiker" + err);
    });
  }