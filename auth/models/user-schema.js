'use strict';

/**
 * @module users
 */
/**
 * @requires bcrypt
 * @requires jsonwebtoken
 * @requires mongoose
 */

const bcrypt =  require('bcrypt');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const TOKEN_TIMEOUT = process.env.TOKEN_TIMEOUT || '7d';
const SECRET = process.env.SECRET || 'sd5346dg8adDhZ56w4e';


/**
 * user schema
 * @property {string} username - The account's unique name
 * @property {string} fullName - The user's full name
 * @property {string} password - The account's password
 * @property {string} role - The account's role (admin, writer)
 * @property {string} createdAt - The time the account was created
 */

const users = mongoose.Schema({
  username: { type :String , unique : true, required : true, lowercase:true},
  fullName: { type:String, required:true},
  password:{ type:String, required:true},
  role:{ type:String, lowercase:true, enum:['writer', 'admin'], default:'writer'},
  createdAt:{ type:Date, default:new Date()},
});

let roles = {
  admin: ['read','create','update','delete'],
  writer: ['read','create','update','delete'],
};


/**
 * @method pre - Data Validation
 */

users.pre('save',async function(){
  this.password = await bcrypt.hash(this.password,10);
  let birthDate = this.birthday.split('/');
  if(birthDate[0] > 12 || birthDate[0] < 0 || birthDate[1] > 31 || birthDate[1] < 1 || birthDate[2] > 2020 || birthDate[2] < 1900){
    throw new Error('Please use a valid birth date (MM/DD/YYYY).');
  }
  this.birthday = new Date(birthDate[2],birthDate[1],birthDate[0]).toLocaleDateString();
});


/**
 * @method authenticateBasic 
 * @param {String} username - The account's name
 * @param {String} password - The account's Password
 */

users.statics.authenticateBasic = async function(username,password){
  let theUser = await this.find({username:username});
  let valid = await bcrypt.compare(password,theUser[0].password);
  return valid ? theUser : Promise.reject();
};



// ..............................................

/**
 * @method generateToken
 * @param {String} user - The username
 */

users.statics.generateToken = function(user){
  let token = jwt.sign({username: user.username ,_id:user._id,userRole:user.role ,role:roles[user.role]},SECRET,{expiresIn:TOKEN_TIMEOUT});
  return token;
};

//.................................................

/**
 * @method verifyToken
 * @param {string} token - The user's token
 */

users.statics.verifyToken = function (token){
  return jwt.verify(token,SECRET, async function(err,decoded){
    if(err){
      console.log('This is not a valid token: ' + err);
      return Promise.reject(err);
    }
   
    let username = decoded.username;
    let theUser = await mongoose.model('users',users).find({username:username});

    if(theUser[0]){
      return Promise.resolve(decoded);
    }
    return Promise.reject();
  });
};

module.exports = mongoose.model('users', users);