/**
* @Title: config.example.js
* @Package bin
*
* @author 操杰朋、腾袭
* @create 2014/12/19
* @version 0.2.1
*
* @Description:
* 	configure of our application
*/

var path = require('path');

var recommendedusers = require('./recommendedusers.json');

//'..' for config folder, '.' for config.js file
var root_dir = path.resolve(__dirname, '.') + '/';
var public_dir = root_dir + 'public/';

var upload_dir = public_dir + 'data/';
var tmp_dir = public_dir + 'data/tmp/';

var base_url = 'http://127.0.0.1';
var dev_mode = true;

//线上数据
//module.exports.redis = {url:"10.162.72.20",port:"6379",password:"missevan_chat_password_tom"};
//module.exports.port = "3000";
//线下数据
var config = {
  sys: {
    public_dir: public_dir,
    upload_dir: upload_dir,
    root_dir: root_dir,
    tmp_dir: tmp_dir
  },

  sso: {
    url: 'http://192.168.1.10:3002/sso/',
    secret_key: 'H1m60ntHOwKXniIXNxEBMxSSsk0Env1deAhJ'
  },

  app: {
    dev_mode: dev_mode,
    fake_user: false,
    session_key: 'NSESS'
  },

  security: {
    /* Security settings */
    keyGrip: [
      'phahMi0Pue3fohPae8Kohboo7phoAuy7ohnuqui9OhRoo3siLuEo1epi',
      'reihet5Yhs3xaeDhee0ieken0HoxahV8zahthah0Wahhree3KauaPh2i'
    ]
  },

  web: {
    address: '0.0.0.0',
    port: 3000,
    domain_prefix: base_url,

    locals: {
      dev_mode: dev_mode,
      domain_prefix: base_url,
      chatSocketUrl: 'http://127.0.0.1:3000/chat',
      recommendedUsers: recommendedusers,
      resource: {
        assets: '3b488057',
        version: '20131229'
      }
    }
  },

  redis: {
    url: '192.168.1.10',
    port: 6379,
    password: "missevan_chat_password_tom",
    time: 180
  },
  db: {
    host: '192.168.1.10',
    port: 27017,
    name: 'missevan',
    username: '',
    password: ''
  },
  cache: {
    enable: false,
    service: 'redis',
    host: '127.0.0.1',
    port: 6379,
    ttl: 180
  }
};

module.exports = config;
