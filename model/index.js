
var M = require('./../lib/base').M;

require('./message');
require('./room');

exports.Message = M('message');
exports.Room = M('room');
exports.Bridge = require('../model/bridge.js');
