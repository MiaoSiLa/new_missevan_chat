
var config = require('./../conf.js');

var redis = require("redis"),
  socket_redis = require('socket.io-redis');

var generator = require('./generator'),
  ModelBase = require('./../lib/base');

var client;
var adapter;
if (config.dev_mode) {
  // redis没有密码的情况
  client = redis.createClient(config.redis.port,config.redis.url);
  adapter = socket_redis({ host: config.redis.url, port: config.redis.port });
} else {
  // redis有密码的情况
  client = redis.createClient(config.redis.port,config.redis.url,{auth_pass:config.redis.password});
  var pub = redis.createClient(config.redis.port, config.redis.url, {auth_pass:config.redis.password});
  var sub = redis.createClient(config.redis.port, config.redis.url, {detect_buffers: true, auth_pass:config.redis.password} );
  adapter = socket_redis({pubClient: pub, subClient: sub});
}

// client连接错误
client.on("error", function (err) {
  if (err) {
    console.error(err);
  }
});

var yclient = new generator(client, { wrapResult: 'multi' });

module.exports = {
  client: client,
  yclient: yclient,
  adapter: adapter
};
