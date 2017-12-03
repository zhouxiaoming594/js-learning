//const greeter = require('./Greeter.js');
import './main.styl';//使用require导入css文件
//document.querySelector("#root").appendChild(greeter());
window.onload = function(){
	var b = document.getElementById('dangerous');
	var c = document.getElementById('time-distribution')
	var d = document.getElementById('count-distribution')
	var dangerous = echarts.init(b);
	var timeDistribution = echarts.init(c);
	var countDistribution = echarts.init(d);

	dangerous.setOption(option1);
	timeDistribution.setOption(option2);
	countDistribution.setOption(option3);
}

var option1 = {
    tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    series: [
        {
            name:'访问来源',
            type:'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                normal: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    show: true,
                    textStyle: {
                        fontSize: '30',
                        fontWeight: 'bold'
                    }
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data:[
                {value:335, name:'直接访问'},
                {value:310, name:'邮件营销'},
                {value:234, name:'联盟广告'},
                {value:135, name:'视频广告'},
                {value:1548, name:'搜索引擎'}
            ]
        }
    ]
};

var option2 = {
    title : {
        text: '90天进出站时间分布'
    },
    tooltip: {
        trigger: 'axis',
    },
    legend: {
        data:['进站', '出站']
    },
    grid: {
        top: 70,
        bottom: 50
    },
    xAxis: [
        {
            type: 'category',
            data: [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
        }
    ],
    yAxis: [
        {
            type: 'value'
        }
    ],
    series: [
        {
            name:'进站',
            type:'line',
            data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3,3.5,1.6,3.6,2.3,2.2,3.8]
        },
        {
            name:'出站',
            type:'line',
            data: [3.9, 5.9, 11.1, 18.7, 48.3, 69.2, 231.6, 46.6, 55.4, 18.4, 10.3, 0.7,3.2,1.8,3.1,2.9,2.6,3.5]
        }
    ]
};

var option3 = {
    title : {
        text: '90天站点进出次数统计'
    },
    tooltip : {
        trigger: 'axis'
    },
    legend: {
        data:['进站','出站']
    },
    calculable : true,
    xAxis : [
        {
            type : 'category',
            data : ['站点1','站点2','站点3','站点4','站点5','站点6','站点7','站点8','站点9','站点10']
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
    series : [
        {
            name:'进站',
            type:'bar',
            data:[2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0]
        },
        {
            name:'出站',
            type:'bar',
            data:[2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8]
        }
    ]
};
