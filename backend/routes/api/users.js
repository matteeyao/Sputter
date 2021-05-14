const express = require("express");
const router = express.Router();

const User = require('../../models/User');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken'); /* (1) */
const keys = require('../../config/keys');

router.post('/register', (req, res) => { /* (2) */
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    /* Check to make sure nobody has already registered with a duplicate email */
    User.findOne({ handle: req.body.handle }).then(user => {
        if (user) {
            /* Throw a 400 error if the email address already exists */
            errors.handle = "A user has already registered with this address";
            return res.status(400).json(errors);
        } else {
            /* Otherwise create a new user */
            const newUser = new User({
                handle: req.body.handle,
                email: req.body.email,
                password: req.body.password
            })

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => {
                            const payload = { id: user.id, handle: user.handle };

                            jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
                                res.json({
                                    success: true,
                                    token: "Bearer " + token
                                });
                            });
                        })
                        .catch(err => console.log(err));
                });
            });
        }
    });
});

router.post('/login', (req, res) => { /* (4) */
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const handle = req.body.handle;
    const password = req.body.password;

    User.findOne({ handle }).then(user => {
        if (!user) {
            errors.handle = "This user does not exist";
            return res.status(400).json(errors);
        }

        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                const payload = { id: user.id, handle: user.handle };

                jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
                    res.json({
                        success: true,
                        token: "Bearer " + token
                    });
                });
            } else {
                errors.password = "Incorrect password";
                return res.status(400).json(errors);
            }
        });
    });
});

router.get("/test", (req, res) => res.json({ msg: "This is the users route" }));

module.exports = router;

/*----------------------------------------------------------------------------*/

/*
(1) Let's setup our JSON web token so that our users can actually sign in and
access protected routes.

(2) The code block will return an error if there is already a user registered 
with that email. Assuming that there is no user with that email, we can then 
save the user in the database. But first, we do not want to store the password 
in plain text. Instead, we want to store the user with a salted and encrypted 
password hash.

The callback for every Express route requires a request and response as
arguments 

(3) Let's use bcrypt to salt and hash our new user's password before storing it 
in the database and saving the user (make sure to put this in the 'else' 
statement in the previous code block):

(4) Login Functionality: The login functions very similar to how it does in
rails. It will compare the user inputted password w/ the salted and hashed
password in the database. If the password is incorrect, it will return a status
400 error.

(5) We want to return a signed web token w/ each `login` or `register` request
in order to "sign the user in" on the frontend. Later, we will learn what to do
w/ the signed token in order for the user's information to persist across
multiple requests to the backend.
*/