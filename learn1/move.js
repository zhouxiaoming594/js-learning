// JavaScript Document
function startMove(obj,json,fn){
	var flag=true;//假设目标完成
	clearInterval(obj.timer);
	obj.timer=setInterval(function(){
		for(var attr in json){
			//1.取当前值
			var icur =0;
			if(attr=="opacity"){
				 icur =Math.round(parseFloat(getStyle(obj,attr)*100));
				}
			else{
				var icur =parseInt(getStyle(obj,attr));
			}
			//2.算速度
			var speed =(json[attr]-icur)/8;
			speed=speed>0?Math.ceil(speed):Math.floor(speed);
			
			//3.检测停止
			if(icur!=json[attr]){
				flag=false;
			}
			if(attr=="opacity"){
				obj.style.filter='alpha(opacity:'+(icur+speed)+')';
				obk.style.opacity=(icur+speed)/100;
			}
			else{
				obj.style[attr]=icur+speed+"px";
			}
			if(flag){
				clearInterval(obj.timer);
				if(fn){
					fn();
					}
			}
		}
	},30)
}
//获取样式的函数封装
function getStyle(obj,style){
	if(obj.currentStyle){//IE浏览器取样式方法
		return obj.currentStyle[style];
	}
	else{//chrome，firefox取样式方法
		return getComputedStyle(obj,null)[style];
	}
}