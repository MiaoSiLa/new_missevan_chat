'use strict';

var config = require('./../config');
var crypto = require('crypto'),
  validator = require('validator');
var cache = require('./cache');
var flowCache;

function md5(str) {
  var hash = crypto
    .createHash('md5')
    .update(str)
    .digest('hex');

  return hash;
}

function base64(str) {
  return new Buffer(str).toString('base64');
}

function hmac_sha1(secret_key, str) {
  var hash = crypto.createHmac('sha1', secret_key)
    .update(str).digest('hex');

  return hash;
}

function make_auth(message) {
  var smsg = base64(JSON.stringify(message));
  var timestamp = Math.round(new Date().valueOf() / 1000).toString();
  var text = smsg + ' ' + timestamp;
  var sign = hmac_sha1(config['sso'].secret_key, text);

  return smsg + ' ' + sign + ' ' + timestamp;
}

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

var ipflowcontrol = function* (method, ip, limit) {
  if (!flowCache) {
    flowCache = new cache('flow/', 1 * 60);
  }
  if (!flowCache.enable) {
    return false;
  }

  var k = method + '/ip/' + ip;
  if (!limit) {
      yield flowCache.del(k, times);
      return false;
  }
  var times = yield flowCache.get(k);
  if (times === null) {
      times = 1;
      yield flowCache.set(k, times);
  } else if (times < limit) {
      times++;
      yield flowCache.set(k, times);
  } else {
      return true;
  }
  return false;
};

//exports.preg_quote = preg_quote;
exports.is_empty_object = isEmptyObject;

exports.md5 = md5;
exports.base64 = base64;
exports.hmac_sha1 = hmac_sha1;

exports.make_auth = make_auth;
exports.ipflowcontrol = ipflowcontrol;
