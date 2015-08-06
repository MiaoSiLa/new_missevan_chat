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
var GekijouScript = require('./../lib/gekijouscript');
var ObjectID = require('mongodb').ObjectID;

const ONE_PAGE = 30;

function Gekijou(data) {
  ModelBase.call(this);

  if (data) {
    this.set(data);
  }
}

util.inherits(Gekijou, ModelBase);

Gekijou.fields = ['_id', 'user_id', 'username', 'title', 'intro', 'cover', 'script',
  'checked', 'created_time', 'updated_time', 'plays', 'goods', 'favorites'];

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
  var ei1 =  this.collection.ensureIndex({
    created_time: -1
  }, { background: true, w: 1 });
  var ei2 =  this.collection.ensureIndex({
    plays: -1
  }, { background: true, w: 1 });

  yield [ei1, ei2];
};

Gekijou.prototype.checkScript = function () {
  if (!this.script) {
    return false;
  }
  var pass = false;
  try {
    var gs = new GekijouScript();
    pass = gs.parse(this.script);
  } catch (e) {
    pass = false;
  }
  return pass;
};

Gekijou.prototype.getCharaIds = function () {
  if (!this.script) {
    return false;
  }
  // TODO: add check
  return true;
};

Gekijou.prototype.getPageCount = function *() {
  return Math.ceil((yield this.count({checked: 1})) / ONE_PAGE);
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

Gekijou.prototype.getPop = function *() {
  var r = yield this.cache.get('pop');
  if (r === null) {
    r = yield this.collection.find({checked: 1})
      .sort({plays: -1}).limit(5).toArray();
    yield this.cache.set('pop', r);
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
  let counter_keys = ['plays', 'goods', 'favorites'];
  for (var i = 0; i < counter_keys.length; i++) {
    let k = counter_keys[i];
    if (!g[k]) {
      g[k] = 0;
    }
  }
  return yield this.collection.save(g);
};

Gekijou.prototype.update = function *(v) {
  let g;
  if (v) {
    g = v;
  } else {
    g = this.valueOf();
    delete g._id;
  }
  g.updated_time = new Date();
  return yield this.collection.update({ _id: new ObjectID(this._id) }, { $set: g });
};

Gekijou.prototype.playCount = function *() {
  return yield this.collection.update({ _id: new ObjectID(this._id) }, { $inc: { plays: 1 } });
};

Gekijou.prototype.goodCount = function *(add) {
  return yield this.collection.update({ _id: new ObjectID(this._id) },
    { $inc: { goods: (add ? 1 : -1) } });
};

Gekijou.prototype.favoriteCount = function *(add) {
  return yield this.collection.update({ _id: new ObjectID(this._id) },
    { $inc: { favorites: (add ? 1 : -1) } });
};

module.exports = Gekijou;

ModelBase.register('gekijou', Gekijou);
