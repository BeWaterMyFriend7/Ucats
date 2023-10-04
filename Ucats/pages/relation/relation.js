import * as echarts from '../../ec-canvas/echarts';

const app = getApp();

var rooturl = "https://ucats-1306442357.cos.ap-nanjing.myqcloud.com/Ucats_pic/";

var nodes_ll = [
  {name : '脸脸', x : 0, y : 0,value: '已领养', symbol : "image://" + rooturl + "脸脸.png"},
  {name : '大橘', x : 0, y : -150, symbol : "image://" + rooturl + "大橘.png"},
  {name : '小狸', x : 100, y : 100, symbol : "image://" + rooturl + "小狸.png"},
  {name : '大三花', x : -100, y : 100, symbol : "image://" + rooturl + "大三花.png"},
  {name : '丑丑', x : -150, y : 0, symbol : "image://" + rooturl + "丑丑.png"},
    {name : '白围巾', x : -200, y : 150, symbol : "image://" + rooturl + "白围巾.png"},
    {name : '亲人小橘', x : -300, y : 0, symbol : "image://" + rooturl + "亲人小橘.png"},
    {name : '小三花', x : -200, y : -150, symbol : "image://" + rooturl + "小三花.png"},
  {name : '刘海妈', x : 150, y : 0, symbol : "image://" + rooturl + "刘海妈.png"},
    {name : '不亲人小橘', x : 300, y : 150, symbol : "image://" + rooturl + "不亲人小橘.png"},
    {name : '斜刘海', x : 350, y : 0, value:'已领养',symbol : "image://" + rooturl + "斜刘海.png"},
    {name : '齐刘海', x : 300, y : -150, symbol : "image://" + rooturl + "齐刘海.png"},

  {name : '蛋卷', x : 200, y : -100, symbol : "image://" + rooturl + "蛋卷.png"},
    {name : '丸子头', x :100 , y : 250, symbol : "image://" + rooturl + "丸子头.png"},
    {name : '三撮毛', x :200 , y : 250, symbol : "image://" + rooturl + "三撮毛.png"},

  {name : '格力高', x :300 , y : -300, symbol : "image://" + rooturl + "格力高.png"},
  {name : '憨八嘎', x :200 , y : -300, symbol : "image://" + rooturl + "憨八嘎.png"},
  {name : '菜菜', x :100 , y : -300, value: "已领养", symbol : "image://" + rooturl + "菜菜.png"},
];

var links_ll = [
  {source: '脸脸', target:'大橘' ,relation: "情侣"},
  {source: '脸脸', target:'小狸' , relation: "母子"},
  {source: '脸脸', target:'大三花' , relation: "母子"},
  {source: '脸脸', target:'丑丑' , relation: "母子"},
  {source: '脸脸', target:'刘海妈' , relation: "母子"},

  {source: '丑丑', target:'白围巾' , relation: "母子"},
  {source: '丑丑', target:'亲人小橘' , relation: "母子"},
  {source: '丑丑', target:'小三花' , relation: "母子"},

  {source: '刘海妈', target:'不亲人小橘' , relation: "母子"},
  {source: '刘海妈', target:'齐刘海' , relation: "母子"},
  {source: '刘海妈', target:'斜刘海' , relation: "母子"},
  {source: '刘海妈', target:'蛋卷' ,lineStyle: {color:(255,255,255)}, relation: "情侣"},
  {source: '刘海妈', target:'丸子头' , relation: "母子"},
  {source: '刘海妈', target:'三撮毛' , relation: "母子"},

  {source: '不亲人小橘', target:'齐刘海' ,lineStyle: {color:(0,255,0)}, relation: "一窝的兄弟姐妹"},
  {source: '不亲人小橘', target:'斜刘海' ,lineStyle: {color:(0,255,0)},  relation: "一窝的兄弟姐妹"},
  {source: '齐刘海', target:'斜刘海' , lineStyle: {color:(0,255,0)}, relation: "一窝的兄弟姐妹"},

  {source: '丸子头', target:'三撮毛' , lineStyle: {color:(0,255,0)}, relation: "一窝的兄弟姐妹"},

  {source: '蛋卷', target:'格力高' ,lineStyle: {color:(0,255,0,0.5)},  relation: "疑似一窝的兄弟姐妹"},
  {source: '蛋卷', target:'菜菜' ,lineStyle: {color:(0,255,0,0.5)},  relation: "疑似一窝的兄弟姐妹"},
  {source: '蛋卷', target:'憨八嘎' ,lineStyle: {color:(0,255,0,0.5)},  relation: "疑似一窝的兄弟姐妹"},
  {source: '格力高', target:'菜菜' , lineStyle: {color:(0,255,0,0.5)}, relation: "疑似一窝的兄弟姐妹"},
  {source: '格力高', target:'憨八嘎' ,lineStyle: {color:(0,255,0,0.5)},  relation: "疑似一窝的兄弟姐妹"},
  {source: '菜菜', target:'憨八嘎' , lineStyle: {color:(0,255,0,0.5)}, relation: "疑似一窝的兄弟姐妹"},

  {source: '小三花', target:'齐刘海' , lineStyle: {color:(0,0,0)}, relation: "关系很好"},
];

var nodes_dq = [
  {name : '帅帅', x : -400, y : 350, value:'已领养', symbol : "image://" + rooturl + "帅帅.png"},
  {name : '小小狸', x : -400, y : 200, symbol : "image://" + rooturl + "小小狸.png"},
  {name : 'nature', x : -400, y : 50,value:'已领养', symbol : "image://" + rooturl + "nature.png"},
  {name : '汤圆', x : -400, y : -100,value:'已领养', symbol : "image://" + rooturl + "汤圆.png"},
  {name : '饭团', x : -400, y : -250,value:'已领养', symbol : "image://" + rooturl + "饭团.png"},
  {name : '短毛黑点', x : -400, y : -400, value:'已领养',symbol : "image://" + rooturl + "短毛黑点.png"},
  {name : '长毛黑点', x : -400, y : -550, value:'已领养',symbol : "image://" + rooturl + "长毛黑点.png"},
];

var links_dq = [
  {source: '长毛黑点', target:'短毛黑点' , lineStyle: {color:(0,255,0,0.5)}, relation: "疑似一窝的兄弟姐妹"},
];

var nodes_ydb = [
  {name : '一点白', x : -100, y : 700, symbol : "image://" + rooturl + "一点白.png"},
  {name : '汉堡', x : 0, y : 700, value: "已领养", symbol : "image://" + rooturl + "汉堡.png"},
  {name : '爆米花', x : -100, y : 550, value: "已领养", symbol : "image://" + rooturl + "爆米花.png"},
  {name : '脸谱', x : 0, y : 550, value: "已领养", symbol : "image://" + rooturl + "脸谱.png"},

  {name : '呆呆', x : 100, y : 700, symbol : "image://" + rooturl + "呆呆.png"},
  {name : '朵朵', x : -200, y : 700, symbol : "image://" + rooturl + "朵朵.png"},
  {name : '仙女', x : -300, y : 700, symbol : "image://" + rooturl + "仙女.png"},
  {name : '女明星', x : -400, y : 700, symbol : "image://" + rooturl + "女明星.png"},
  {name : '大佐', x : 200, y : 700, symbol : "image://" + rooturl + "大佐.png"},

  {name : '小黑', x : -300, y : 400, symbol : "image://" + rooturl + "小黑.png"},
  {name : 'demo', x : -200, y : 400, value:'已领养',symbol : "image://" + rooturl + "demo.png"},
  {name : '猪仔', x : -100, y : 400, value:'已领养',symbol : "image://" + rooturl + "猪仔.png"},
  {name : '贴地走', x : 0, y : 400, symbol : "image://" + rooturl + "贴地走.png"},
  {name : '大佑', x : 100, y : 400, symbol : "image://" + rooturl + "大佑.png"},
  {name : '刀哥', x : 200, y : 400, symbol : "image://" + rooturl + "刀哥.png"},
  {name : '四福', x : 300, y : 400, value:'已领养',symbol : "image://" + rooturl + "四福.png"},
];

var links_ydb = [
  {source: '一点白', target:'汉堡' , lineStyle: {color:(0,255,0)}, relation: "一窝的兄弟姐妹"},
  {source: '一点白', target:'爆米花' ,lineStyle: {color:(0,255,0)},  relation: "一窝的兄弟姐妹"},
  {source: '一点白', target:'脸谱' ,lineStyle: {color:(0,255,0)},  relation: "一窝的兄弟姐妹"},
  {source: '汉堡', target:'爆米花' ,lineStyle: {color:(0,255,0)},  relation: "一窝的兄弟姐妹"},
  {source: '汉堡', target:'脸谱' ,lineStyle: {color:(0,255,0)},  relation: "一窝的兄弟姐妹"},
  {source: '脸谱', target:'爆米花' ,lineStyle: {color:(0,255,0)},  relation: "一窝的兄弟姐妹"},

  {source: '汉堡', target:'呆呆' ,lineStyle: {color:(255,255,0)},  relation: "关系很好"},
  {source: '汉堡', target:'朵朵' , relation: "关系很好"},
  {source: '汉堡', target:'大佐' , relation: "关系很好"},
  {source: '脸谱', target:'朵朵' , relation: "关系很好"},
  {source: '脸谱', target:'大佐' , relation: "关系很好"},
  {source: '脸谱', target:'呆呆' , relation: "关系很好"},
  {source: '呆呆', target:'朵朵' , relation: "关系很好"},
  {source: '呆呆', target:'大佐' , relation: "关系很好"},
  {source: '大佐', target:'朵朵' , relation: "关系很好"},
];

var nodes_xsh = [
  {name: '白三花',  x: -50,  y: -300,  symbol:"image://" + rooturl +"白三花.png"},
  {name: '狸三花',  x: -250, y: -400,   symbol:"image://" + rooturl +"狸三花.png"},
  {name: '小小三花',  x: -200, y: -300, value:'已领养',  symbol:"image://" + rooturl +"小小三花.png"},
  {name : '七七', x : -100, y : -400, value:'已领养',symbol : "image://" + rooturl + "七七.png"},

  {name : '闹闹', x : -300, y : -550,value:'已领养', symbol : "image://" + rooturl + "闹闹.png"},
  {name : '兜兜', x : -200, y : -550,value:'已领养', symbol : "image://" + rooturl + "兜兜.png"},
  {name : '怕人橘', x : -100, y : -550, symbol : "image://" + rooturl + "怕人橘.png"},
  {name : '三文鱼', x : 0, y : -550, symbol : "image://" + rooturl + "三文鱼.png"},
  {name : '狸局', x : 100, y : -550, symbol : "image://" + rooturl + "狸局.png"},
  {name : '虎子', x : 200, y : -550,value:'已领养', symbol : "image://" + rooturl + "虎子.png"},
];

var links_xsh = [
  {source: '白三花', target:'狸三花' , relation: "同一窝的兄弟姐妹"},
  {source: '白三花', target:'七七' , relation: "同一窝的兄弟姐妹"},
  {source: '狸三花', target:'七七' , relation: "同一窝的兄弟姐妹"},

  {source: '小小三花', target:'七七' , relation: "关系很好"},
  {source: '小小三花', target:'狸三花' , relation: "关系很好"},
  {source: '小小三花', target:'白三花' , relation: "关系很好"},
];

var nodes = [
  ...nodes_ll,
  ...nodes_dq,
  ...nodes_ydb,
  ...nodes_xsh
];

var links =[
  ...links_ll,
  ...links_dq,
  ...links_xsh,
  ...links_ydb
];

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);

  var option = {
    // title: {
    //   text: 'Basic Graph'
    // },
    tooltip: {
      trigger: 'item',
      formatter:function(params){
        if(params.data.relation){
            return params.data.source + '--' + params.data.relation + '-->'+ params.data.target;
        }
        else if(params.value){
          return params.name + "  " + params.value;
        }else{
           return params.name; 
        }
    }

    },
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: 'none',
        symbolSize: 30,
        roam: true,
        
        data: nodes,
        links: links,

        label: {
          position: 'bottom',
          show: true,
          distance: 1,
          formatter: '{b}'
        },
        lineStyle: {
          color: 'source',
          width: 2,
          curveness: 0.3
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 10
          }
        }
      }
    ]
  };

  chart.setOption(option);
  return chart;
}

Page({
    data: {
      ec: {
        onInit: initChart
      },
      screenWidth: 0,
      screenHeight: 0,
      imgwidth: 0,
      imgheight: 0,
      imgList:[
        "/pages/images/relation.png",
        "/pages/images/relation1.png"
      ]
    },
    //转发功能
    onShareAppMessage: function () {
      let users = wx.getStorageSync('user');
      if (res.from === 'button') { }
      return {
        path: 'pages/relation/relation',  // 路径，传递参数到指定页面。
        success: function (res) { }
      }
    },
    onPullDownRefresh: function () {
      wx.stopPullDownRefresh()
    },
    copyText: function(e){
      console.log(e)
      wx.setClipboardData({
        data: e.currentTarget.dataset.text,
        success: function(res) {
          wx.getClipboardData({
            success: function (res) {
              wx.showToast({
                title: '复制成功',
              })
            }
          })
        }
      })
    },
    preview(e){
      console.log(e.currentTarget.dataset.src)
      let currentUrl = e.currentTarget.dataset.src
      wx.previewImage({
        current: currentUrl,
        urls: this.data.imgList
      })
    },
    tencentdoc:function(){
      var path = 'pages/detail/detail.html?url=https%3A%2F%2Fdocs.qq.com%2Fpdf%2FDYlRYR01VT1FpWFBU';
      wx.navigateToMiniProgram({
        appId: 'wxd45c635d754dbf59',
        path: path,
        extraData: {
          foo: 'bar'
        },
        envVersion: 'release',   //默认为正式版，咱们提取网盘资料，这里就正式版，如果是自己开发的两个小程序，可以选择"develop" 开发板    "trial" 体验版 "release" 正式版
        success(res) {
          // 打开成功
        }
      })
    },
  })
  
  