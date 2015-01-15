
var M = require('./../lib/base').M;

require('./message');

exports.Message = M('message');
exports.User = require('../model/user.js');
exports.Bridge = require('../model/bridge.js');
