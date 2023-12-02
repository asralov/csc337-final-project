import React from "react";
import '../index.css';

const url = "http://localhost:80";

const Login = () => {
    return (
        <div id="wraper">
            <div id="form-box">
                <h2 id="statusTitle">
                    Login
                </h2>
                <form action="#">
                    <div id="input-box-username">
                        <input type="text" id="user" required />
                        <label htmlFor="user">
                            Username
                        </label>
                        <i className='bx bxs-user'></i>
                    </div>
                    <div id="input-box-password">
                        <input type="password" id="password" required />
                        <label htmlFor="password">
                            Password
                        </label>
                        <i className='bx bxs-lock-alt' ></i>
                    </div>
                    <div id="btnBox">
                        <button type="submit" id="btn" onClick={loginUser}>
                            Login
                        </button>
                    </div>
                    <div id="logreg-link">
                        <p>
                            Don't have an account? <button id="reg-link">Sign Up</button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}

function addUser() {
    let username = document.getElementById('user').value;
    let password = document.getElementById('password').value;
    let data = { username: username, password: password };

    if (username == "" || password == "")
        return;

    let p = fetch(url + '/users/add', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    });

    p.then(resonse => {
        if (resonse.ok) {
            window.alert("User " + username + " created!");
        } else {
            window.alert("User already exists!");
        }
    }).catch((error) => {
        console.log(error);
    });
}

function loginUser() {
    let username = document.getElementById('user').value;
    let password = document.getElementById('password').value;
    let data = { username: username, password: password };

    console.log(data);

    let p = fetch(url + '/users/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    });

    p.then(response => {
        console.log(response);
        if (response.ok) {
            window.location.href = '/home'
        } else {
            return response.json();
        }
    // }).then(data => {
    //     window.alert(data.error);
    }).catch(error => {
        console.log(error);
    });
}

export default Login;