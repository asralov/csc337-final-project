const createAcc = document.getElementById("reg-link");
const st = document.getElementById("statusTitle");
const btn = document.getElementById("btnBox");
const promt = document.getElementById("logreg-link");

/**
 * Sets up the create account page with appropriate content and clears input fields.
 */
function getCreatePage() {
    st.textContent = "Create Account";
    btn.innerHTML = `<button onclick="addUser();" type="submit" id="btn">
                        Sign Up
                    </button>`;
    promt.innerHTML = `<p>
                            Already got an account? <button onclick="getLoginPage()" id="reg-link">Login</button>
                            <a href="./help.html">
                                Need Help?
                            </a>
                        </p>`;
    document.getElementById("user").value = "";
    document.getElementById("password").value = "";
}

/**
 * Renders the login page with appropriate content and resets the input fields.
 */
function getLoginPage() {
    st.textContent = "Login";
    btn.innerHTML = `<button onclick="loginUser();" type="submit" id="btn">
                        Login
                    </button>`;
    promt.innerHTML = `<p>
                            Don't have an account? <button onclick="getCreatePage()" id="reg-link">Sign Up</button>
                            <a href="./help.html">
                                Need Help?
                            </a>
                        </p>`;
    document.getElementById("user").value = "";
    document.getElementById("password").value = "";
}

/**
 * Adds a user by sending a POST request to the server with the provided username and password.
 * If the user is successfully created, a success message is displayed. Otherwise, an error message is displayed.
 */
function addUser() {
    let username = document.getElementById('user').value;
    let password = document.getElementById('password').value;
    let data = { username: username, password: password };

    if (username == "" || password == "")
        return;

    let p = fetch('/login/add', {
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

/**
 * Logs in the user by sending a POST request to the server with the provided username and password.
 * If the login is successful, the user is redirected to the response URL.
 * If the login fails, an error message is displayed.
 */
function loginUser() {
    let username = document.getElementById('user').value;
    let password = document.getElementById('password').value;
    let data = { username: username, password: password };
    localStorage.setItem("user", username);

    console.log(data);

    let p = fetch('/login/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    });

    p.then(response => {
        if (response.ok) {
            window.location.href = response.url;
        } else {
            return response.json();
        }
    }).then(data => {
        window.alert(data.error);
    }).catch(error => {
        console.log(error);
    });
}