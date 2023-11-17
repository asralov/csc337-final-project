const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const upload = require('../config/multerConfig'); 
const authenticate = require('../config/authConfig'); 
const { PassThrough } = require('stream');

// I was thinking adminAuth will be required to pull user data then userAuth will be required to update user data

// // GET request - get all users
// router.get('/', authenticate.adminAuth(), async (req, res) => {
//     try {
//         const users = await User.find();
//         res.json(users);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// // GET request - get a single user by ID
// router.get('/:id', authenticate.adminAuth(), async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (user) {
//             res.json(user);
//         } else {
//             res.status(404).json({ message: 'User not found' });
//         }
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// // POST request - add a new user
router.post('/add', (req, res) => { 
    console.log("uhuh");
    let username = req.body.username;
    console.log(req.body);
    let password = req.body.password;
    let p = User.find({username: username}).exec()
    p.then((result) => {
      // Checks if the user already exists
      if (result.length != 0) {
        res.end(("USER ALREADY EXISTS"));
      } else {
        let user = new User({username: username});
        user.save();
        res.end('USER SUCCESSFULLY SAVED');
      }
    }).catch((err) => {
      res.end("USER SAVE ERROR");
    })
  });

// POST method. Logs the user into the website.
router.post('/login', (req, res) => { 
    console.log("yessir");
    let u = req.body;
    // Checks if the user is in the database
    let p1 = User.find({username: u.username, password: u.password}).exec();
    p1.then( (results) => { 
      if (results.length == 0) {
        res.end('Coult not find account');
      } else {
        let sid = addSession(u.username);  
        // Creates a cookie with 
        res.cookie("login", 
          {username: u.username, sessionID: sid}, 
          {maxAge: 60000 * 5 });
        res.end('SUCCESS');
      }
    });
  });


// // PUT request - update a user
// router.put('/update/:id', authenticate.userAuth(), async (req, res) => {
//     try {
//         const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json(updatedUser);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });

// // DELETE request - delete a user
// router.delete('/delete/:id', authenticate.userAuth(), async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id);
//         if (user) {
//             res.json({ message: 'User deleted successfully' });
//         } else {
//             res.status(404).json({ message: 'User not found' });
//         }
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

module.exports = router;
