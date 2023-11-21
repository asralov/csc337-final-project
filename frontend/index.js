const createAcc = document.getElementById("reg-link");
let signUp = false;
// getting main components
const st = document.getElementById("statusTitle");

const btn = document.getElementById("btnBox");
const promt = document.getElementById("logreg-link");

function getCreatePage(){
    st.textContent = "Create Account";
    btn.innerHTML = `<button onclick="addUserTest();" type="submit" id="btn">
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
    btn.innerHTML = `<button onclick="loginUserTest();" type="submit" id="btn">
                        Login
                    </button>`;
    promt.innerHTML =  `<p>
                            Don't have an account? <button onclick="getCreatePage()" id="reg-link">Sign Up</button>
                        </p>`;
    document.getElementById("user").value = "";
    document.getElementById("password").value = "";
}
