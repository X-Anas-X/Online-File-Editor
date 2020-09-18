'use strict';

/**
 * schema for story
 * @module storiesSchema
 */

/**
  * @property {String} createdBy - The user who created the post
  * @property {String} title - The post title
  * @property {String} story - The story
  * @property {String} createdAt - The time the post was created
  */


const mongoose = require('mongoose');


const stories = mongoose.Schema({
  createdBy : { type: String, required: true , default:'anonymous' },
  title : { type: String, required: true },
  image: { type: String, required: true , default: 'https://lunawood.com/wp-content/uploads/2018/02/placeholder-image.png' },
  story : { type: String, required: true },
  createdAt:{ type:String, default:new Date().toLocaleString()},
  
});

module.exports = mongoose.model('story', stories);