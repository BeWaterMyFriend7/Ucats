import * as echarts from '../../ec-canvas/echarts';

const app = getApp();

var nodes = [
  {
    name: 'Node 1',
    x: 300,
    y: 300
  },
  {
    name: 'Node 2',
    x: 800,
    y: 300
  },
  {
    name: 'Node 3',
    x: 550,
    y: 100
  },
  {
    name: 'Node 4',
    x: 550,
    y: 500
  }
];

var links =[
  {
    source: 'Node 2',
    target: 'Node 1',
    label: {
      show: true
    },
    lineStyle: {
      curveness: 0.2
    }
  },
  {
    source: 'Node 1',
    target: 'Node 3'
  },
  {
    source: 'Node 2',
    target: 'Node 3'
  },
  {
    source: 'Node 2',
    target: 'Node 4'
  },
  {
    source: 'Node 1',
    target: 'Node 4'
  }];

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);

  var option = {
    title: {
      text: 'Basic Graph'
    },
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: 'none',
        symbolSize: 50,
        roam: true,
        label: {
          show: true
        },
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          fontSize: 20
        },
        data: nodes,
      // links: [],
      links: links,
        emphasis: {
          focus: 'adjacency',
          label: {
            position: 'right',
            show: true
          }
        },
        roam: true,
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0
        }
      }
    ]
  };

  chart.setOption(option);
  return chart;
}

// Page({
//   onShareAppMessage: function (res) {
//     return {
//       title: 'ECharts 可以在微信小程序中使用啦！',
//       path: '/pages/index/index',
//       success: function () { },
//       fail: function () { }
//     }
//   },
//   data: {
//     ec: {
//       onInit: initChart
//     }
//   },

//   onReady() {
//   }
// });

// //index.js

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
  
  