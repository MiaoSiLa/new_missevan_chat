/**
* @Title: conf.js
* @Package bin
*
* @author 操杰朋
* @create 2014/12/19
* @version 0.0.1
*
* @Description:
* 	configure of our application
*/


//线上数据
//module.exports.redis = {url:"10.162.72.20",port:"6379",password:"missevan_chat_password_tom"};
//module.exports.port = "3000";
//线下数据
var config = {
  dev_mode: true,
<<<<<<< HEAD:bin/conf.js
  redis: {url:"192.168.1.138",port:"6379",password:"missevan_chat_password_tom" },
  port: 3000,
  time: 180
=======
  redis: {
    url: "192.168.1.136",
    port: "6379",
    password: "missevan_chat_password_tom"
  },
  port: 3000
>>>>>>> origin/master:bin/conf.example.js
};

module.exports = config;
