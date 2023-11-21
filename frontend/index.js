const createAcc = document.getElementById("reg-link");
let signUp = false;
// getting main components
const st = document.getElementById("statusTitle");

const btn = document.getElementById("btnBox");
const promt = document.getElementById("logreg-link");

function getCreatePage(){
    st.textContent = "Create Account";
    btn.innerHTML = `<button onclick="addUser();" type="submit" id="btn">
                        Sign Up
                    </button>`;
    promt.innerHTML =  `<p>
                            Already got an account? <button onclick="getLoginPage()" id="reg-link">Login</button>
                        </p>`;
    document.getElementById("user").value = "";
    document.getElementById("password").value = "";
}
function getLoginPage(){
    st.textContent = "Login";
    btn.innerHTML = `<button onclick="loginUser();" type="submit" id="btn">
                        Login
                    </button>`;
    promt.innerHTML =  `<p>
                            Don't have an account? <button onclick="getCreatePage()" id="reg-link">Sign Up</button>
                        </p>`;
    document.getElementById("user").value = "";
    document.getElementById("password").value = "";
}

/**
 * This function get called whenever a user presses the log in button.
 * Sends POST request to the server. If successful, sends the user to 
 * the homepage
 */
function loginUser() {
    let us = document.getElementById('user').value;
    localStorage.setItem("user", us)
    let pw = document.getElementById('password').value;
    let data = { username: us, password: pw };
    let p = fetch('/users/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
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
    let username = document.getElementById('user').value;
    let password = document.getElementById('password').value;
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
