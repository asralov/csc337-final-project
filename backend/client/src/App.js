import React from 'react';
import './App.css';
import Main from './Main';

const url = 'http://localhost:80';

function App() {
  return (
    <div className="App">
      <Main />
    </div>
  );
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
  }).then(data => {
    window.alert(data.error);
  }).catch(error => {
    console.log(error);
  });
}



export default App;
