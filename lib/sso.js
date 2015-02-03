'use strict';

/**
*
* Author: tengattack
* Update: 2015/02/03
*
*/

var config = require('./../config');
var request = require('request'),
  _ = require('underscore');
var common = require('./common');

function ypost(url, form) {
  return function (callback) {
    request.post({ url: url, form: form }, function (err, res, body) {
      if (err) {
        return callback(err);
      }
      callback(err, body);
    });
  };
}

function SSOConnect() {

}

SSOConnect.User = function (user, token, expire) {
  var u = _.clone(user);

  u.id = parseInt(user.user_id);

  u.user_id = undefined;
  delete u.user_id;

  u.token = token;
  u.expire = expire;
  
  return u;
};

SSOConnect.prototype.request = function *(action, msg) {
  //TODO: add ip
  var auth = common.make_auth(msg);
  var url = config['sso'].url + action;
  var body = yield ypost(url, {auth: auth});
  var r = { code: -2 };
  try {
    r = JSON.parse(body);
  } catch (e) {
    r.message = body;
  }
  return r;
};

SSOConnect.prototype.session = function *(token) {
  return yield this.request('session', { token: token });
};

SSOConnect.prototype.login = function *(email, password, maxAgeType) {
  maxAgeType = maxAgeType || 0;
  return yield this.request('login', {
    email: email,
    password: password,
    maxAgeType: maxAgeType
  });
};

module.exports = SSOConnect;
