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

  this.set(data);
}

util.inherits(Gekijou, ModelBase);

Gekijou.fields = ['_id', 'user_id', 'title', 'intro', 'script'];

Gekijou.prototype.set = function (data) {
  if (data) {
    for (let field of Gekijou.fields) {
      this[field] = data[field];
    }
  } else {
    for (let field of Gekijou.fields) {
      delete this[field];
    }
  }
};

Gekijou.prototype.valueOf = function () {
  var value = {};
  for (let field of Gekijou.fields) {
    value[field] = this[field];
  }
  return value;
};

Gekijou.prototype.checkScript = function () {
  if (!this.script) {
    return false;
  }
  return true;
};

Gekijou.prototype.save = function *() {
  let g = this.valueOf();
  delete g._id;
  return yield this.collection.save(g);
};

Gekijou.prototype.update = function *() {
  let g = this.valueOf();
  delete g._id;
  return yield this.collection.update({ _id: new ObjectID(this._id) }, { $set: g });
};


module.exports = Gekijou;

ModelBase.register('gekijou', Gekijou);
