/**   
* @Title: bridge.js
* @Package model
* 
* @author 操杰朋 
* @create 2014/12/19
* @version 0.0.1 
* 
* @Description:
* 	communicating between multiple socket
*/
var util = require('util'),
	EventEmitter = require('events').EventEmitter;

var Bridge = function(){};
util.inherits(Bridge,EventEmitter);

module.exports = Bridge;
