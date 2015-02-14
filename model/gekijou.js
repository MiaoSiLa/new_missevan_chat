/**
 * @Title: gekijou.js
 * @Package model
 *
 * @author 腾袭
 * @create 2015/02/14
 * @update 2015/02/14
 * @version 0.1.1
 *
 * @Description:
 */

"use strict";

var util = require('util'),
  _ = require('underscore'),
  validator = require('validator');
var ModelBase = require('./../lib/base');
var ObjectID = require('mongodb').ObjectID;

function Gekijou(data) {
  ModelBase.call(this);

  if (data) {
    this.user_id = data.user_id;
    this.title = data.title;
    this.intro = data.intro;
    this.script = data.script;
  }
}

util.inherits(Gekijou, ModelBase);

Gekijou.prototype.checkScript = function () {
  return true;
};

Gekijou.prototype.save = function *() {
  let newGekijou = {
    user_id: this.user_id,
    title: this.title,
    intro: this.intro,
    script: this.script
  };
  return yield this.collection.save(newMessage);
};


module.exports = Gekijou;

ModelBase.register('gekijou', Gekijou);
