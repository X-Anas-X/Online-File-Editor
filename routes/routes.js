'use strict';

/**
 * @module Routes
 * @requires express
 * @requires basicAuth
 * @requires story-model
 * @requires authorize
 * @requires beare-auth
 * 
 */
const express = require('express');
const router = express.Router();
const user = require('../auth/models/user-schema');
const story = require('../lib/models/story/story-model');
const basicAuth = require('../auth/middleware/basic');
const bearerMiddleware = require('../auth/middleware/bearer-auth');
const permissions = require('../auth/middleware/authorize');


// ***************--- The Signin/Signup Routes ---***************

router.post('/signup', signup);
router.get('/signin', basicAuth, signin);
router.get('/users', bearerMiddleware, permissions('delete'), getUsers);


// ***************--- The API Routes ---***************

router.get('/story', getStory);
router.get('/story/:user', getStoryUser);
router.post('/story', bearerMiddleware, postStory);
router.put('/story/:id', bearerMiddleware, permissions('update'), putStory);
router.delete('/story/:id', bearerMiddleware, permissions('delete'), deleteStory);


// ***************--- The API Functions story ---***************

/**
 * @function getStory
 * @param {object} req The request object that will ask for the list of story.
 * @param {object} res The response object with the list of story.
 * @param {function} next The next function that is responsible for the middlewares.
 */
function getStory(req, res, next){
  story
    .get()
    .then(data => {res.status(200).json(data);})
    .catch(next);
}

/**
 * @function getStoryUser
 * @param {object} req The request object that will ask for the list of story from one user.
 * @param {object} res The response object with the list of story from one user.
 * @param {function} next The next function that is responsible for the middlewares.
 */
function getStoryUser(req, res, next){
  story
    .get(req.params.user)
    .then((data) => res.status(200).json(data))
    .catch(next);
}
    
/**
 * @function postStory
 * @param {object} req The request object that will create a new post in story.
 * @param {object} res The response object with the new post in story.
 * @param {function} next The next function that is responsible for the middlewares.
 */
function postStory(req, res, next){
  req.body.createdBy = req.user.username;
  story
    .post(req.body)
    .then(data => {
      res.status(201).json(data);})
    .catch(next);
}
   
/**
 * @function putStory
 * @param {object} req The request object that will update a post.
 * @param {object} res The response object with the updated post.
 * @param {function} next The next function that is responsible for the middlewares.
 * @description The users are only allowed to update their own posts, while admins can update anyone's post, pass the ID in the route.
 */
function putStory(req, res, next){
  story
    .put(req.params.id, req.body)
    .then(data => res.status(200).json(data))
    .catch(next);
  
}

/**
 * @function deleteStory
 * @param {object} req The request object that will delete a post.
 * @param {object} res The response object with the deleted post.
 * @param {function} next The next function that is responsible for the middlewares.
 * @description The users are only allowed to delete their own posts, while admins can delete anyone's post, pass the ID in the route.
 */

function deleteStory(req, res, next){
  story
    .delete(req.params.id)
    .then(data => { res.status(200).json(data);})
    .catch(next);

}   


// *************** Sign up Functions ***************

/**
 * @function signup
 * @param {object} req The request object that will create a new user.
 * @param {object} res The response object with the username and the token.
 * @param {function} next The next function that is responsible for the middlewares.
 */

function signup (req,res,next){
  user
    .create(req.body)
    .then(result =>{
      let answer = {};
      answer.token = user.generateToken(result);
      answer.user = { username:result.username, password:result.password };
      res.status(201).json(answer);
    }).catch(next);
}
  

/**
 * @function signin
 * @param {object} req The request object that will login to an account using basic authentication.
 * @param {object} res The response object with the JSON web token.
 * @param {function} next The next function that is responsible for the middlewares.
 */

function signin(req,res,next){
  console.log(req.token);
  res.cookie('token', req.token);
  let answer = {};
  answer.token = req.token;
  answer.user = {username: req.theUserInfo.username, password: req.theUserInfo.password};
  res.status(200).json(answer);
}


/**
 * @function getUsers
 * @param {object} req The request object that will ask for list of users.
 * @param {object} res The response object with the new post in goals.
 * @param {function} next The next function that is responsible for the middlewares.
 */
function getUsers(req,res,next){
  user.find({})
    .then(result=>{
      res.status(200).json(result);
    }).catch(next);
}

module.exports = router;

