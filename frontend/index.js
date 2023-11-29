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

function addUser() {
    let username = document.getElementById('user').value;
    let password = document.getElementById('password').value;
    let data = { username: username, password: password };

    let p = fetch('/users/add', {
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

    let p = fetch('/users/login', {
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
        console.alert(error);
    });
}