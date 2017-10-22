'use strict'

var Promise = require('bluebird');
var _ = require('lodash');
var request = Promise.promisify(require('request'));
var util = require('./util');
var fs = require('fs');

var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var mpprefix = 'https://api.weixin.qq.com/cgi-bin/';
var semanticUrl = 'https://api.weixin.qq.com/semantic/semproxy/search?';
var api = {
  accessToken: prefix + 'token?grant_type=client_credential',
  temporary: {
    upload: prefix + 'media/upload',
    fetch: prefix + 'media/get'
  },
  permanent: {
    upload: prefix + 'material/add_material',
    uploadNews: prefix + 'material/add_news',
    uploadNewsPic: prefix + 'media/uploadimg',
    fetch: prefix + 'material/get_material',
    del: prefix + 'material/del_material',
    updete: prefix + 'material/update_news',
    count: prefix + 'material/get_materialcount',
    batch: prefix + 'material/batchget_material'
  },
  tag: {
    create: prefix + 'tags/create',
    fetch: prefix + 'tags/get',
    edit: prefix + 'tags/update',
    del: prefix + 'tags/delete',
    getUser: prefix + 'user/tag/get'
  },
  group:{
    batchupdate: prefix + 'tags/members/batchtagging',
    batchdel: prefix + 'tags/members/batchuntagging',
    fetch: prefix + 'tags/getidlist',
    getlist: prefix + 'user/get',
  },
  user:{
    remark: prefix + 'user/info/updateremark',
    fetch: prefix + 'user/info',
    batch: prefix + 'user/info/batchget'
  },
  mess:{
    group: prefix +'message/mass/sendall',
    openId: prefix +'message/mass/send',
    del: prefix + 'message/mass/delete',
    preview: prefix + 'message/mass/preview'
  },
  menu:{
    create: prefix + 'menu/create',
    fetch: prefix + 'menu/get',
    delete: prefix + 'menu/delete',
    current: prefix + 'get_current_selfmenu_info'
  },
  qrcode:{
    create: mpprefix + 'qrcode/create',
    show: mpprefix + 'showqrcode'
  },
  shortUrl:{
    create: prefix + 'shorturl'
  },
  semanticUrl: semanticUrl,
  ticket: {
    get: prefix + 'ticket/getticket?'
  }
}
function Wechat(opts) {
  var that = this;
  this.AppID = opts.AppID;
  this.AppSecret = opts.AppSecret;
  this.getAccessToken = opts.getAccessToken;
  this.saveAccessToken = opts.saveAccessToken;
  this.getTicket = opts.getTicket;
  this.saveTicket = opts.saveTicket;

  this.fetchAccessToken()
}
Wechat.prototype.isValidAccessToken = function(data){
  if(!data || !data.access_token || data.expires_in){
    return false
  }

  var access_token = data.access_token;
  var expires_in = data.expires_in;
  var now = (new Date().getTime())

  if(now < expires_in) {
    return true
  }else{
    return false
  }
}

Wechat.prototype.updateAccessToken = function(data){
  var AppID = this.AppID;
  var AppSecret = this.AppSecret;
  var url = api.accessToken + '&appid=' + AppID +'&secret=' + AppSecret;
  
  return new Promise(function(resolve, reject){
    request({url: url, json: true}).then(function(response){
      var data = response.body;
      var now = (new Date().getTime());
      var expires_in = now + (data.expires_in - 20) * 1000;

      data.expires_in = expires_in;
      
      resolve(data);
    })
    
  })
}

Wechat.prototype.fetchAccessToken = function(){
  var that = this;

  if (this.accessToken && this.expires_in) {
    if (this.isValidAccessToken(this)){
      return Promise.resolve(this)
    }
  }
  return this.getAccessToken()
    .then(function(data){
      try{
        data = JSON.parse(data)
      }catch(e){
        return that.updateAccessToken(data)
      }

      if (that.isValidAccessToken(data)){
        return Promise.resolve(data)
      }else{
        return that.updateAccessToken(data)
      }
    })
    .then(function(data){
      that.saveTicket(data);
      return Promise.resolve(data)
    })
}

Wechat.prototype.fetchTicket = function(access_token){
  var that = this;

  return this.getTicket()
    .then(function(data){
      try{
        data = JSON.parse(data)
      }catch(e){
        return that.updateTicket(access_token)
      }

      if (that.isValidTicket(data)){
        return Promise.resolve(data)
      }else{
        return that.updateTicket(access_token)
      }
    })
    .then(function(data){
      that.ticket = data.ticket;
      that.ticket_expires_in = data.expires_in;
      that.saveTicket(data);
      return Promise.resolve(data)
    })
}

Wechat.prototype.updateTicket = function(access_token){
  var url = api.ticket.get + '&access_token=' + access_token +'&type=jsapi';
  
  return new Promise(function(resolve, reject){
    request({url: url, json: true}).then(function(response){
      var data = response.body;
      var now = (new Date().getTime());
      var expires_in = now + (data.expires_in - 20) * 1000;

      data.expires_in = expires_in;
      
      resolve(data);
    })
    
  })
}

Wechat.prototype.isValidTicket = function(data){
  if(!data || !data.ticket || data.expires_in){
    return false
  }

  var ticket = data.ticket;
  var expires_in = data.expires_in;
  var now = (new Date().getTime())

  if(ticket && now < expires_in) {
    return true
  }else{
    return false
  }
}

Wechat.prototype.uploadMaterial = function(type, filepath, permanent){
  var that = this;
  var form = {};
  var uploadUrl = api.temporary.upload;

  if (permanent) {
    uploadUrl = api.permanent.upload;

    _.extend(form, permanent)
  }

  if (type === 'pic') {
    uploadUrl = api.permanent.uploadNewsPic;
  }

  if (type === 'news') {
    uploadUrl = api.permanent.uploadNews;
    form = filepath
  }else {
    form.media  = fs.createReadStream(filepath)
  }

  var AppID = this.AppID;
  var AppSecret = this.AppSecret;
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = uploadUrl + '?access_token=' + data.access_token + '&type=' + type;

        //form.access_token = data.access_token;
        var options = {
          method: 'POST',
          url: url,
          json: true
        }

        if (type === 'news') {
          options.body = form;
        }else{
          options.formData = form;
        }
        console.log(options)
        request(options).then(function(response){
          var _data = response.body;
          console.log(_data)
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('Upload materl fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.fetchMaterial = function(mediaId, type, permanent){
  var that = this;
  var fetchUrl = api.temporary.upload;

  if (permanent) {
    fetchUrl = api.permanent.fetch;
  }

  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = fetchUrl + '?access_token=' + data.access_token;
        var options = {
          method: 'POST',
          url: url,
          json: true,
          body: {
            "media_id": mediaId
          }
        }
        if(!permanent){
          url +='&media_id' + mediaId;
          if(type === 'video'){
            url = url.replace('https://', 'http://');            
          }
          options = {
            method: 'GET',
            url: url,
            json: true
          }
        }

        if(type === 'news' || type === 'video'){
          request(options).then(function(response){
            var _data = response.body;
            if (_data) {
              resolve(_data)
            }else{
              throw new Error('delete materl fails');
            }
          }).catch(function(err){
            reject(err);
          })
        }else{
          resolve(url)
        }
      })
  })
}

Wechat.prototype.deleteMaterial = function(mediaId){
  var that = this;
  var form = {
    media_id: mediaId
  }

  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.permanent.del + '?access_token=' + data.access_token;

        request({method:'POST', url: url, json:true, body:form}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('delete materl fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.updateMaterial = function(mediaId, news){
  var that = this;
  var form = {
    media_id: mediaId
  }

  _.extend(form, news)
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.permanent.update + '?access_token=' + data.access_token + '&media_id' + mediaId;

        request({method:'POST', url: url, json:true, body:form}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('update materl fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.countMaterial = function(){
  var that = this;

  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.permanent.count + '?access_token=' + data.access_token;

        request({method:'GET', url: url, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('count materlial fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.batchMaterial = function(options){
  var that = this;

  options.type = options.type || 'image';
  options.offset = options.offset || 0;
  options.count = options.count || 1

  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.permanent.batch + '?access_token=' + data.access_token;

        request({method:'POST', url: url, body: options, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('batch materl fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.createTag = function(name){
  var that = this;

  var form = {
    "tag": {
      "name": name
    }
  }

  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.tag.create + '?access_token=' + data.access_token;

        request({method:'POST', url: url, body: form, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('create Tag fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.fetchTag = function(){
  var that = this;

  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.tag.fetch + '?access_token=' + data.access_token;

        request({method:'GET', url: url, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('fetch Tag fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.editTag = function(newTagName){
  var that = this;
  var form = {
    "tag":{
      "id": newTagName.id,
      "name": newTagName.name
    }
  }
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.tag.edit + '?access_token=' + data.access_token;

        request({method:'POST', url: url, body: form, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('edit Tag fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.deleteTag = function(delTagID){
  var that = this;
  var form = {
    "tag":{
      "id": delTagID
    }
  }
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.tag.del + '?access_token=' + data.access_token;

        request({method:'POST', url: url, body: form, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('delete Tag fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.getTagUserlist = function(tagId, nextOpenId){
  var that = this;

  var form = {
    "tagid": tagId,
    "next_openid": ""
  }
  if(nextOpenId) {
    form.next_openid = nextOpenId;
  }
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.tag.getUser + '?access_token=' + data.access_token;

        request({method:'POST', url: url, body:form, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('get Tag\'s userlist fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.batchaddTag = function(openidlist, tagid){
  var that = this;
  var form = {
    "openid_list": openidlist,
    "tagid": tagid
  }
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.group.batchupdate + '?access_token=' + data.access_token;

        request({method:'POST', url: url, body: form, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('batcgaddTag fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.batchdeleteTag = function(openidlist, tagid){
  var that = this;
  var form = {
    "openid_list": openidlist,
    "tagid": tagid
  }
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.group.batchdel + '?access_token=' + data.access_token;

        request({method:'POST', url: url, body: form, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('batchdelteTag fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.getSelfTag = function(openid){
  var that = this;
  var form = {
    "openid": openid
  }
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.group.fetch + '?access_token=' + data.access_token;

        request({method:'POST', url: url, body: form, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('get user\'s tag fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.getUserlist = function(nextOpenId){
  var that = this;
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.group.getlist + '?access_token=' + data.access_token;
        if(nextOpenId) {
          url += "&next_openid=" + nextOpenId;
        }
        request({method:'GET', url: url, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('getUserlist fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.remarkuser = function(openid, remark){
  var that = this;
  var form = {
    "openid": openid,
    "remark": remark
  }
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.user.remark + '?access_token=' + data.access_token;

        request({method:'POST', url: url, body: form, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('username remark fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.getUserInfo = function(openId, lang){
  console.log(openId);
  var that = this;
  lang = lang || "zh_CN"
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url;
        var options = {
          json: true
        }

        if(_.isArray(openId)){
          url = api.user.batch + '?access_token=' + data.access_token;
          options.method = 'POST';
          options.body = {
            user_list: openId
          }
        }else{
          url = api.user.fetch + '?access_token=' + data.access_token + '&openid=' + openId +'&lang=' + lang;
          options.method = 'GET';
        }

        options.url = url; 
        console.log(options);      
        request(options).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('getUserInfo fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.sendByGroup = function(type, message, tagId){
  var that = this;
  var msg = {
    filter: {},
    msgtype: type
  }

  msg[type] = message;
  
  if(!tagId){
    msg.filter.is_to_all = true;
  }else{
    msg.filter = {
      is_to_all: false,
      tag_id: tagId
    }
  }
  console.log(msg);
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.mess.group + '?access_token=' + data.access_token;

        request({method:'POST', url: url, body: msg, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('sendByGroup fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.sendByOpenId = function(type, message, openIds){
  var that = this;
  var msg = {
    touser: openIds,
    msgtype: type
  }

  msg[type] = message;
  
  console.log(msg);
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.mess.openId + '?access_token=' + data.access_token;

        request({method:'POST', url: url, body: msg, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('sendByOpenId fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.deleteMass = function(msgId, articleIdx){
  var that = this;
  var msg = {
    msg_id: msgId,
    article_idx: articleIdx || 0
  }
  console.log(msg);
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.mess.del + '?access_token=' + data.access_token;

        request({method:'POST', url: url, body: msg, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('deleteMass fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.preview = function(type, message, openIds){
  var that = this;
  var msg = {
    touser: openIds,
    msgtype: type
  }

  msg[type] = message;
  
  console.log(msg);
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.mess.preview + '?access_token=' + data.access_token;

        request({method:'POST', url: url, body: msg, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('sendByOpenId fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.createMenu = function(menu){
  var that = this;
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.menu.create + '?access_token=' + data.access_token;

        request({method:'POST', url: url, body:menu, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('createMenu fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.getMenu = function(){
  var that = this;
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.menu.fetch + '?access_token=' + data.access_token;

        request({method:'GET', url: url, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('getMenu fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.deleteMenu = function(){
  var that = this;
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.menu.delete + '?access_token=' + data.access_token;

        request({method:'GET', url: url, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('getMenu fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.getCurrnetMenu = function(){
  var that = this;
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.menu.current + '?access_token=' + data.access_token;

        request({method:'GET', url: url, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('getMenu fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.createQrcode = function(qr){
  var that = this;
  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.qrcode.create + '?access_token=' + data.access_token;

        request({method:'POST', url: url, body:qr, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('getMenu fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.showQrcode = function(ticket){
  return api.qrcode.show + '?ticket=' + encodeURI(ticket);
}

Wechat.prototype.createShortUrl = function(action, url){
  var that = this;
  action = action || "long2short";

  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.shortUrl.create + '?access_token=' + data.access_token;
        var form = {
          action: action,
          long_url: url
        }
        request({method:'POST', url: url, body:form, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('getMenu fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.semantic = function(semanticDate){
  var that = this;

  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.semanticUrl + '?access_token=' + data.access_token;
        semanticDate.appid = data.appID;
        request({method:'POST', url: url, body:semanticDate, json:true}).then(function(response){
          var _data = response.body;
          if (_data) {
            resolve(_data)
          }else{
            throw new Error('getMenu fails');
          }
        }).catch(function(err){
          reject(err);
        })
      })
  })
}

Wechat.prototype.reply = function(){
  var content = this.body
  var message = this.weixin
  
  var xml = util.tpl(content, message)
  console.log(xml);
  this.status = 200;
  this.type = 'application/xml';
  this.body = xml;
}
module.exports = Wechat;