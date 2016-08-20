// JavaScript Document
function startMove(obj,json,fn){
	var flag=true;//����Ŀ�����
	clearInterval(obj.timer);
	obj.timer=setInterval(function(){
		for(var attr in json){
			//1.ȡ��ǰֵ
			var icur =0;
			if(attr=="opacity"){
				 icur =Math.round(parseFloat(getStyle(obj,attr)*100));
				}
			else{
				var icur =parseInt(getStyle(obj,attr));
			}
			//2.���ٶ�
			var speed =(json[attr]-icur)/8;
			speed=speed>0?Math.ceil(speed):Math.floor(speed);
			
			//3.���ֹͣ
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
//��ȡ��ʽ�ĺ�����װ
function getStyle(obj,style){
	if(obj.currentStyle){//IE�����ȡ��ʽ����
		return obj.currentStyle[style];
	}
	else{//chrome��firefoxȡ��ʽ����
		return getComputedStyle(obj,null)[style];
	}
}