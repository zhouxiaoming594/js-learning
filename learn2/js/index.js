// JavaScript Document
$(document).ready(function() {
	$('#fullpage').fullpage({
		verticalCentered: false,
		anchors: ['firstPage', 'secondPage', '3rdPage','4th page'],
		navigation: true,
		navigationPosition: 'right',
		navigationTooltips: ['First page', 'Second page', 'Third page','4th page'],
		afterLoad: function(link, index){
		switch (index){
			case 1:
				move('#section0 h1').scale(1.4).end();
				move('#section0 p').set('margin-top','5%').end();
				break;
			case 2:
				move('#section1 h1').scale(0.8).end(function(){
						move('#section1 h1').scale(1.2).end();});
				break;
			case 3:
				move('#section2 h1').set('margin-left','10%').end();
				move('#section2 p').set('margin-right','10%').end();
				break;
			case 4:	
				move('#section3 #primary').rotate(360).end(function(){
					move('#section3 #sport').rotate(360).end(function(){
						move('#section3 #edition').rotate(360).end(function(){
							move('#section3 .svg1').scale(0.8).end(function(){
								move('#section3 .svg2').scale(0.8).end(function(){
									move('#section3 .svg3').scale(0.8).end();
								});
							});
						});
					});
				});
				break;
			default :
				break;
		}
	},
	onLeave: function(link, index){
		switch (index){
			case 1:
				move('#section0 h1').scale(1).end();
				move('#section0 p').set('margin-top','0%').end();
				break;
			case 2:
				move('#section1 h1').scale(1).end();
				break;
			case 3:
				move('#section2 h1').set('margin-left','0%').end();
				move('#section2 p').set('margin-right','0%').end();
				break;
			case 4:	
				move('#section3 #primary').rotate(-360).end();
				move('#section3 #sport').rotate(-360).end();
				move('#section3 #edition').rotate(-360).end();
				move('#section3 .svg1').scale(1).end();
				move('#section3 .svg2').scale(1).end();
				move('#section3 .svg3').scale(1).end();
				break;
			default :
				break;
		}
	},
	});
});