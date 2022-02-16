const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Post = require('../../models/Post');
const validatePostInput = require('../../validation/posts');

router.get("/test", (req, res) => {
  res.json({msg: "This is the post route"});
})

router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: 'No posts found' }));
});

router.get('/user/:user_id', (req, res) => {
  Post.find({user: req.params.user_id})
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err =>
      res.status(404).json({ nopostsfound: 'No posts found from that user' })
    );
});

router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
      .then(post => res.json(post))
      .catch(err =>
          res.status(404).json({ nopostfound: 'No post found with that ID' })
      );
});

router.post('/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
      
    if (!isValid) {
      return res.status(400).json(errors);
    }

    // remember to import your Post model from Mongoose
    const newPost = new Post({
      title: req.body.title,
      body: req.body.body,
      date: req.body.date,
      author: req.body.author
    });

    newPost
      .save()
      .then(savedPost => res.json(savedPost))
      .catch(err => console.log(err));
  }
);

module.exports = router;