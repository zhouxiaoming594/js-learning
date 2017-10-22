'use strict'

var Koa = require('koa');
var wechat = require('./wechat/g');
var util = require('./libs/util');
var path = require('path');
var wechat_file = path.join(__dirname, './config/wechat.txt');
var config = require('./config');
var weixin = require('./weixin');
var Wechat = require('./wechat/wechat');
var serveStatic = require('koa-static');
//var mongoose = require('mongoose');
//var fs = require('fs');

var app = new Koa();
/*
var dbUrl = 'mongodb://localhost/imooc';
mongoose.connect(dbUrl);

var models_path = __dirname + '/app/models';
var walk = function(path){
  fs
    .readdirSync(path)
    .forEach(function(file){
      var newPath = path + '/' + file;
      var stat = fs.statSync(newPath);

      if(stat.isFile()){
        if(/(.*)\.(js|coffee)/.test(file)){
          require(newPath);
        }
      }else if(stat.isDirectory){
        walk(newPath);
      }
    })
}
walk(models_path);
*/
//const convert = require('koa-convert');
var port = 8081;
app.use(serveStatic(__dirname + '/libs'));
var ejs = require('ejs');
var heredoc = require('heredoc');
var crypto = require('crypto');

var tpl = heredoc(function() {
/*
  <!DOCTYPE html>
  <html>
    <head>
      <title>搜电影</title>
    </head>
    <body>
      <h1>点击标题，开始录音翻译</h1>
      <p id="title"></p>
      <div id="doctor"></div>
      <div id="year"></div>
      <div id="poster"></div>
      <script src="zepto.min.js"></script>
      <script src="http://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
      <script>
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wx06d9762199823206', // 必填，公众号的唯一标识
            timestamp: '<%= timestamp %>', // 必填，生成签名的时间戳
            nonceStr: '<%= noncestr %>', // 必填，生成签名的随机串
            signature: '<%= signature %>',// 必填，签名，见附录1
            jsApiList: [
              'startRecord',
              'stopRecord',
              'onVoiceRecordEnd',
              'translateVoice'
            ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });

        wx.ready(function(){
          wx.checkJsApi({
            jsApiList: ['stopRecord'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
            success: function(res) {
              weindow.alert(true);
            }
          });
          
          var isRecording = false;
          $('h1').on('tap', function(){
            window.alert('点击了录制');
            if(!isRecording){
              isRecording = true; 
              wx.startRecord({
                success: function (res) {
                  var localId = res.localId
                },
                cancel: function(){
                  window.alert('无法获得麦克风使用权限')
                }
              })
            
              return 
            }

            isRecording = flase;

            wx.stopRecord({
              success: function(res){
                var loaclId = res.localId

                wx.translateVoice({
                   localId: loaclId, 
                    isShowProgressTips: 1, 
                    success: function (res) {
                        alert(res.translateResult);
                    }
                });
              }
            })

          })
        });
      </script>
    </body>
*/
})

var createNonce = function(){
  return Math.random().toString(36).substr(2,15)
}

var createTimeStamp = function(){
  return parseInt(new Date().getTime() / 1000, 10) + '';
}

var _sign = function(noncestr, ticket, timestamp, url){
  var params = [
    'noncestr=' + noncestr,
    'jsapi_ticket=' + ticket,
    'timestamp=' + timestamp,
    'url=' + url
  ]
  var str = params.sort().join('&');
  var shasum = crypto.createHash('sha1');

  shasum.update(str)
  return shasum.digest('hex');
}

function sign(ticket, url){
  var noncestr = createNonce();
  var timestamp = createTimeStamp();
  var signature = _sign(noncestr, ticket, timestamp, url);

  return {
    noncestr: noncestr,
    timestamp: timestamp,
    signature: signature
  }
}

app.use(function *(next){
  if (this.url.indexOf('/movie') > -1) {
    var wechtApi = new Wechat(config.wechat);
    var data = yield wechtApi.fetchAccessToken();
    var access_token = data.access_token;
    var ticketData = yield wechtApi.fetchTicket(access_token);
    var ticket = ticketData.ticket;
    var url = this.href;
    var params = sign(ticket, url);

    console.log(params);
    this.body = ejs.render(tpl, params);

    return next;
  }
  yield next;
});
app.use(wechat(config.wechat, weixin.reply));

app.listen(port);
console.log('project start on port:' + port);
