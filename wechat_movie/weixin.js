'use strict'
var config = require('./config');
var Wechat = require('./wechat/wechat');
var menu = require('./menu');

var wechatApi = new Wechat(config.wechat);

/*wechatApi.deleteMenu().then(function(){
  return wechatApi.createMenu(menu);
})*/
exports.reply =function* (next) {
  var message = this.weixin;

  if (message.MsgType === 'event'){
    if(message.Event === 'subscribe') {
      if(message.EventKey){
        console.log('扫二维码进来：' + message.EventKey + ' ' + message.ticket)
      }

      this.body = '你好，你已经成功订阅！！\n感谢你的关注\r\n';
    }
    else if (message.Event === 'unsubscribe') {
      console.log('无情取关');
      this.body = '';
    }else if (message.Event === 'LOCATION') {
      this.body = "您上报的位置是：" + message.Latitude + '/' + message.Longitude + '-' +message.Precision
    }else if (message.Event === 'CLICK') {
      this.body = "您点击了菜单: " + message.EventKey 
    }else if (message.Event === 'SCAN') {
      console.log('关注后扫二维码' + message.EventKey + ' ' + message.Ticket);
      this.body = '看到你扫一下哦';
    }else if (message.Event === 'VIEW') {
      this.body = '您点击了菜单中的连接' + message.EventKey
    }else if (message.Event === 'scancode_push') {
      console.log(message.ScanCodeInfo.ScanCodeInfo);
      console.log(message.ScanCodeInfo.ScanResult);
      this.body = '您点击了菜单中的连接' + message.EventKey
    }else if (message.Event === 'scancode_waitmsg') {
      console.log(message.ScanCodeInfo.ScanCodeInfo);
      console.log(message.ScanCodeInfo.ScanResult);
      this.body = '您点击了菜单中的连接' + message.EventKey
    }else if (message.Event === 'pic_sysphoto') {
      console.log(message.SendPicsInfo.PicList);
      console.log(message.SendPicsInfo.Count);
      this.body = '您点击了菜单中的连接' + message.EventKey
    }else if (message.Event === 'pic_photo_or_album') {
      console.log(message.SendPicsInfo.PicList);
      console.log(message.SendPicsInfo.Count);
      this.body = '您点击了菜单中的连接' + message.EventKey
    }else if (message.Event === 'pic_weixin') {
      console.log(message.SendPicsInfo.PicList);
      console.log(message.SendPicsInfo.Count);
      this.body = '您点击了菜单中的连接' + message.EventKey
    }else if (message.Event === 'location_select') {
      console.log(message.SendLocationInfo.Location_X);
      console.log(message.SendLocationInfo.Location_Y);
      console.log(message.SendLocationInfo.Scale);
      console.log(message.SendLocationInfo.Label);
      console.log(message.SendLocationInfo.Poiname);
      this.body = '您点击了菜单中的连接' + message.EventKey
    }
  }else if(message.MsgType === 'text'){
    var content = message.Content;
    var reply = '额，你说的' + message.Content + '太复杂了，无法回复';

    switch(content){
      case '1': {reply = '你真帅！'; break;}
      case '2': {reply = '你是猪吗！'; break;}
      case '3': {reply = '333333'; break;}
      case '4': {
        reply = [{
          title: 'FATE 远坂凛',
          description: '老婆美美美',
          picUrl:"https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1506080338772&di=35211c20d9f18c18b36cc5ad2fa0f8de&imgtype=0&src=http%3A%2F%2Fwww.005.tv%2Fuploads%2Fallimg%2F160913%2F22-160913150GQ56.jpg",
          url:'https://baike.baidu.com/item/%E8%BF%9C%E5%9D%82%E5%87%9B/778728?fr=aladdin'
          }];
        break;
      }
      case '5': {
        var data = yield wechatApi.uploadMaterial('image', __dirname + '/1.jpg')
        reply = {
          type: 'image',
          media_id: data.media_id
        }
        break;
      }
      case '6': {
        var data = yield wechatApi.uploadMaterial('image', __dirname + '/1.jpg')
        reply = {
          type: 'music',
          title: '被风吹过的夏天',
          description: '金莎 林俊杰',
          MUSIC_Url: 'http://mp3.henduoge.com/s/2017-09-23/1506097969.mp3',
          HQ_MUSIC_Url: 'http://music.163.com/#/song?id=247579',
          media_id: data.media_id
        }
        break;
      }
      case '7': {
        var data = yield wechatApi.uploadMaterial('video', __dirname + '/1.mp4')

        reply = {
          type: 'video',
          media_id: data.media_id,
          title: 'Fate HF 樱之梦',
          description: '精彩剪辑'
        }
        break;
      }
      case '8': {
        var data = yield wechatApi.uploadMaterial('image', __dirname + '/1.jpg', {type: 'image'})
        reply = {
          type: 'image',
          media_id: data.media_id
        }
        break;
      }
      case '9': {
        var data = yield wechatApi.uploadMaterial('viedo', __dirname + '/fate_hf.mp4', {type: 'viedo', description: '{"title": "fate", "introduction": "is perfect"}'})
        reply = {
          type: 'video',
          media_id: data.media_id,
          title: 'Fate HF 樱之梦',
          description: '精彩剪辑'
        }
        break;
      }
      case '10': {
        var data = yield wechatApi.uploadMaterial('image', __dirname + '/1.jpg', {})
        var media = {
          "articles": [{
            "title": 'tutu',
            "thumb_media_id": data.media_id,
            "author": 'ming',
            "digest": '摘要',
            "show_cover_pic": 1,
            "content": 'good',
            "content_source_url": 'www.baidu.com'
           }]
        }
        var _data = yield wechatApi.uploadMaterial('news', media, {});
        _data = yield wechatApi.fetchMaterial(_data.media_id, 'news', {});

        console.log(_data);

        var item = _data.news_item;
        var news = []

        item.forEach(function(item){
          news.push({
            title: item.title,
            description:item.description,
            picUrl:item.thumb_url,
            url:item.content_source_url
          })
        })

        reply = news;
        break;
      }
      case '11': {
        var counts = yield wechatApi.countMaterial();
        reply = '总共有语音' + counts.voice_count + '项\n'
              +'视屏' + counts.video_count + '项\n'
              +'图片' + counts.image_count + '项\n'
              +'图文' + counts.news_count + '项';
        break;
      }
      case '12': {
        var image = yield wechatApi.batchMaterial({type:'image', offset: 0, count: 20});
        var video = yield wechatApi.batchMaterial({type:'video', offset: 0, count: 20});
        var voice = yield wechatApi.batchMaterial({type:'voice', offset: 0, count: 20});
        var news = yield wechatApi.batchMaterial({type:'news', offset: 0, count: 20});
        console.log({
          '图片列表': JSON.stringify(image),
          '语音列表': JSON.stringify(voice),
          '视屏列表': JSON.stringify(video),
          '图文列表': JSON.stringify(news)
        })
        reply = '永久素材列表后台显示';
      }
      case '13': {
        var del = yield wechatApi.deleteMaterial('MFs1gWA2alGfaftUGbLEftULR7emtgd4LRpxNaWVXY0');
        reply = del.errcode;
        break;
      }
      case '14': {
        var data = yield wechatApi.createTag('VIP用户组2');
        reply = "标签：" + data.tag.name + " ID：" + data.tag.id;
        break;
      }
      case '15': {
        var data = yield wechatApi.fetchTag();
        console.log(JSON.stringify(data));
        reply = "标签列表后台显示";
        break;
      }
      case '16': {
        var newTag = {
          id: 101,
          name: "普通用户"
        }
        var data = yield wechatApi.editTag(newTag);
        var data = yield wechatApi.fetchTag();
        console.log(JSON.stringify(data));
        reply = "编辑标签后台显示";
        break;
      }
      case '17': {
        var data = yield wechatApi.deleteTag(101);
        var data = yield wechatApi.fetchTag();
        console.log(JSON.stringify(data));
        reply = "删除标签后台显示";
        break;
      }
      case '18': {
        var data = yield wechatApi.getTagUserlist(100);
        console.log(JSON.stringify(data));
        reply = "获取标签下粉丝列表";
        break;   
      }
      case '19': {
        var userOpenIds = yield wechatApi.getUserlist();
        var data = yield wechatApi.batchaddTag(userOpenIds.data.openid,100);
        console.log(data);
        var data = yield wechatApi.fetchTag();
        console.log(JSON.stringify(data));
        reply = "批量给用户添加标签";
        break;
      }
      case '20': {
        var userOpenIds = yield wechatApi.getUserlist();
        var data = yield wechatApi.batchdeleteTag(userOpenIds.data.openid,100);
        console.log(data);
        var data = yield wechatApi.fetchTag();
        console.log(JSON.stringify(data));
        reply = "批量给用户删除标签";
        break;
      }
      case '21': {
        var userOpenIds = yield wechatApi.getUserlist();
        var data = yield wechatApi.getSelfTag(userOpenIds.data.openid[0]);
        console.log(JSON.stringify(data));
        reply = "用户已经绑定的标签列表后台显示";
        break;
      }
      case '22': {
        var data = yield wechatApi.getUserlist();
        console.log(JSON.stringify(data));
        reply = "用户列表后台显示";
        break;
      }
      case '23': {
        var data = yield wechatApi.getUserInfo(message.FromUserName, 'zh_CN');
        console.log(JSON.stringify(data));
        reply = "用户信息获取";
        break;
      }
      case '24': {
        var mess = {
          "content":"这是一条群发消息"
        };
        var data = yield wechatApi.sendByGroup("text",mess,100);
        console.log(JSON.stringify(data));
        reply = "群发消息";
        break;
      }
      case '25': {
        var data = yield wechatApi.deleteMass(1000000001);
        console.log(JSON.stringify(data));
        reply = "删除群发消息";
        break;
      }
      case '26': {
        var mess = {
          "media_id":"MFs1gWA2alGfaftUGbLEfpZBidaWMQ0l4JD_OVN_new"
        };
        var data = yield wechatApi.preview("mpnews",mess,message.FromUserName);
        console.log(JSON.stringify(data));
        reply = "群发消息";
        break;
      }
      case '27': {
        var temQr = {
          "expire_seconds": 604800, 
          "action_name": "QR_SCENE", 
          "action_info": {
            "scene": {
              "scene_id": 123
            }
          }
        }

        var preQr = {
          "action_name": "QR_LIMIT_SCENE",
           "action_info": {
            "scene": {
              "scene_id": 123
            }
          }
        }
        var qr1 = yield wechatApi.createQrcode(temQr);
        var qr2 = yield wechatApi.createQrcode(preQr);
        console.log(JSON.stringify(qr1));
        console.log(JSON.stringify(qr2));
        reply = "创建二维码";
        break;
      }
      case '28': {
        var semanticData = {
          query: '羞羞的铁拳',
          city: '杭州',
          category: 'movie',
          uid: message.FromUserName
        }

        var _semanticData = yield wechatApi.semantic(semanticData);
        reply = JSON.stringify(_semanticData);
        break;
      }
      default: break;
    }

    this.body = reply;
  }else{
    this.body = message.MsgType;
  }
  yield next
}
