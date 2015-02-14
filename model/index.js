
var Base = require('./../lib/base');
var M = Base.M;

require('./message');
require('./room');
require('./gekijou');

exports.Base = Base;
exports.Message = M('message');
exports.Room = M('room');
exports.Gekijou = M('gekijou');
exports.Bridge = require('../model/bridge.js');
