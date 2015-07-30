"use strict";

var util = require('util'),
  _ = require('underscore'),
  validator = require('validator');
var ModelBase = require('./../lib/base');
var ObjectID = require('mongodb').ObjectID;

function GekijouStatus(data) {
  ModelBase.call(this);

  if (data) {
    this.set(data);
  }
}

util.inherits(GekijouStatus, ModelBase);

GekijouStatus.fields = ['_id', 'gekijou_id', 'user_id', 'good', 'favorite'];

GekijouStatus.prototype.set = function (data) {
  if (data) {
    for (let field of GekijouStatus.fields) {
      this[field] = data[field];
    }
  } else {
    for (let field of GekijouStatus.fields) {
      delete this[field];
    }
  }
};

GekijouStatus.prototype.valueOf = function () {
  var value = {};
  for (let field of GekijouStatus.fields) {
    value[field] = this[field];
  }
  return value;
};

GekijouStatus.prototype.ensureIndex = function *() {
  yield this.collection.ensureIndex({
    gekijou_id: 1, user_id: 1
  }, { background: true, w: 1 });
};

GekijouStatus.prototype.getStatus = function *(gekijou_id, user_id) {
  var gs = yield this.collection.findOne({
    gekijou_id: new ObjectID(gekijou_id),
    user_id: user_id
  });
  if (gs) {
    this.set(gs);
  } else {
    this.gekijou_id = new ObjectID(gekijou_id);
    this.user_id = user_id;
  }
  return gs;
};

GekijouStatus.prototype.save = function *() {
  let gs = this.valueOf();
  delete gs._id;
  if (!gs.good) {
    gs.good = false;
  }
  if (!gs.favorite) {
    gs.favorite = false;
  }
  return yield this.collection.save(gs);
};

GekijouStatus.prototype.setFavorite = function *(gekijou_id, user_id, fav) {
  var status = yield this.getStatus(gekijou_id, user_id);
  var r;
  this.favorite = !!fav;
  if (status && status._id) {
    if (status.favorite == this.favorite) {
      return false;
    }
    r = yield this.update({ favorite: this.favorite });
  } else {
    r = yield this.save();
  }
  return r;
};

GekijouStatus.prototype.setGood = function *(gekijou_id, user_id, goo) {
  var status = yield this.getStatus(gekijou_id, user_id);
  var r;
  this.good = !!goo;
  if (status && status._id) {
    if (status.good == this.good) {
      return false;
    }
    r = yield this.update({ good: this.good });
  } else {
    r = yield this.save();
  }
  return r;
};

GekijouStatus.prototype.removeByGekijouId = function *(gekijou_id) {
  return yield this.collection.remove({ gekijou_id: new ObjectID(gekijou_id) });
};

module.exports = GekijouStatus;

ModelBase.register('gekijoustatus', GekijouStatus);
