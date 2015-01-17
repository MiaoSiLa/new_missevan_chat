
var Base = require('./../lib/base');
var M = Base.M;

require('./message');
require('./room');

exports.Base = Base;
exports.Message = M('message');
exports.Room = M('room');
exports.Bridge = require('../model/bridge.js');
