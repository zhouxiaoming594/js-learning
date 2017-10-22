'use strict'
var util = require('./libs/util');
var path = require('path');
var wechat_file = path.join(__dirname, './config/wechat.txt');
var wechat_ticket_file = path.join(__dirname, './config/wechat_ticket.txt');
var config = {
  wechat:{
    AppID: 'wx06d9762199823206',
    AppSecret: '533d2e770dbbeb8f5cf02105f9990494',
    token: 'ThisIsMyToken1',
    getAccessToken: function(){
      return util.readFileAsync(wechat_file)
    },
    saveAccessToken: function(data){
      data = JSON.stringify(data);
      return util.writeFileAsync(wechat_file, data)
    },
    getTicket: function(){
      return util.readFileAsync(wechat_ticket_file)
    },
    saveTicket: function(data){
      data = JSON.stringify(data);
      return util.writeFileAsync(wechat_ticket_file, data)
    }
  }
}
module.exports = config