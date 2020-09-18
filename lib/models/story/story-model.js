'use strict';

const schema = require('./story-schema');
const Model = require('./model');

class Story extends Model{
  constructor(){
    super(schema);
  }
}

module.exports = new Story(schema);