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
const SSO_COOKIE_NAME = config['sso'].token_cookie_name ? config['sso'].token_cookie_name : 'token';

function ypost(url, form, cookie) {
  return function (callback) {
    //var postdata = { url: url, form: form };
    var reqopts = {
      url: url,
      headers: {
        'User-Agent': 'gekijou-module'
      }
    };

    if (cookie) {
      var j = request.jar();
      var jcookie = request.cookie(SSO_COOKIE_NAME + '=' + encodeURIComponent(cookie));
      j.setCookie(jcookie, config['sso'].url);
      reqopts.jar = j;
    }
    request.get(reqopts, function (err, res, body) {
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

  u.id = parseInt(user.id);

  //u.user_id = undefined;
  //delete u.user_id;

  u.iconurl = u.avatar_url;

  u.token = token;
  u.expire = expire;

  return u;
};

SSOConnect.prototype.request = function *(action, msg, token) {
  //TODO: add ip
  var auth = common.make_auth(msg);
  var url = config['sso'].url + action;
  var body = yield ypost(url, {auth: auth}, token);
  var r = { code: -2 };
  try {
    r = JSON.parse(body);
  } catch (e) {
    r.message = body;
  }
  if (r.state === 'success') {
    r.code = 0;
    r.user = r.info;
    r.token = token;
    r.expire = r.info.auth_timeout;
    delete r.info.auth_timeout;
  } else {
    r.code = -1;
  }
  return r;
};

SSOConnect.prototype.session = function *(token) {
  return yield this.request('session', { token: token }, token);
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
