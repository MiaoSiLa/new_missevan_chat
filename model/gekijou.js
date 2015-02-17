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

const ONE_PAGE = 30;

function Gekijou(data) {
  ModelBase.call(this);

  this.set(data);
}

util.inherits(Gekijou, ModelBase);

Gekijou.fields = ['_id', 'user_id', 'username', 'title', 'intro', 'cover', 'script',
  'checked', 'created_time', 'updated_time', 'plays'];

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

Gekijou.prototype.ensureIndex = function *() {
  yield this.collection.ensureIndex({
    created_time: -1
  }, { background: true, w: 1 });
};

Gekijou.prototype.checkScript = function () {
  if (!this.script) {
    return false;
  }
  return true;
};

Gekijou.prototype.getPageCount = function *() {
  return Math.ceil((yield this.count()) / ONE_PAGE);
};

Gekijou.prototype.getByPage = function *(page) {
  if (page <= 0) {
    return [];
  }
  page--; //for index
  var r = yield this.cache.get('page/' + page);
  if (r === null) {
    r = yield this.collection.find({checked: 1})
      .sort({created_time: -1}).skip(page * ONE_PAGE).limit(ONE_PAGE).toArray();
    yield this.cache.set('page/' + page, r);
  }
  return r;
};

Gekijou.prototype.save = function *() {
  let g = this.valueOf();
  delete g._id;
  // 默认审核通过
  if (!g.checked) {
    g.checked = 1;
  }
  if (!g.created_time) {
    g.created_time = new Date();
    g.updated_time = new Date();
  }
  if (!g.plays) {
    g.plays = 0;
  }
  return yield this.collection.save(g);
};

Gekijou.prototype.update = function *() {
  let g = this.valueOf();
  delete g._id;
  g.updated_time = new Date();
  return yield this.collection.update({ _id: new ObjectID(this._id) }, { $set: g });
};

Gekijou.prototype.playCount = function *() {
  return yield this.collection.update({ _id: new ObjectID(this._id) }, { $inc: { plays: 1 } });
};

module.exports = Gekijou;

ModelBase.register('gekijou', Gekijou);
