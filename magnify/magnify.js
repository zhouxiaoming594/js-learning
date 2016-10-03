// JavaScript Document
window.onload=function(){
	var objDemo=document.getElementById("demo");
	var objSmallBox=document.getElementById("small-box");
	var objMark=document.getElementById("mark");
	var objFloatBox=document.getElementById("float-box");
	var objBigBox=document.getElementById("big-box");
	var objBigBoxImage=objBigBox.getElementsByTagName("img")[0];
	
	objMark.onmouseover=function(){
		objFloatBox.style.display="block";
		objBigBox.style.display="block";
	}
	
	objMark.onmouseout=function(){
		objFloatBox.style.display="none";
		objBigBox.style.display="none";
	}
	
	objMark.onmousemove=function(ev){
		var ev=ev||window.event;
		var left=ev.clientX-objDemo.offsetLeft-objSmallBox.offsetLeft-objFloatBox.offsetWidth/2;
		var top=ev.clientY-objDemo.offsetTop-objSmallBox.offsetTop-objFloatBox.offsetHeight/2;
		
		//放大区域选择框边缘检测
		if(left<0){
			left=0;
		}else if(left>(objMark.offsetWidth-objFloatBox.offsetWidth)){
			left=objMark.offsetWidth-objFloatBox.offsetWidth;
		}
		if(top<0){
			top=0;
		}else if(top>(objMark.offsetHeight-objFloatBox.offsetHeight)){
			top=objMark.offsetHeight-objFloatBox.offsetHeight;
		}
		//移动区域选择框
		objFloatBox.style.left=left+"px";
		objFloatBox.style.top=top+"px";
		
		//计算方法倍数
		var bigBoxLeft=left/(objMark.offsetWidth-objFloatBox.offsetWidth)*(objBigBoxImage.offsetWidth-objBigBox.offsetWidth);
		var bigBoxTop=top/(objMark.offsetHeight-objFloatBox.offsetHeight)*(objBigBoxImage.offsetHeight-objBigBox.offsetHeight);
		
		//放大图片移动方向与鼠标移动方向相反
		objBigBoxImage.style.left=-bigBoxLeft+"px";
		objBigBoxImage.style.top=-bigBoxTop+"px";
	}
}