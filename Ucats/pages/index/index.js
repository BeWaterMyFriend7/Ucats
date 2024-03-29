var app = getApp()
 Page({
data: { 
 fostered_catlist: [
{ name:"脸脸"},
{ name:"亲人小橘"},
{ name:"斜刘海"},
{ name:"小狸"},
{ name:"菜菜"},
{ name:"脸谱"},
{ name:"爆米花"},
{ name:"汉堡"},
{ name:"长毛黑点"},
{ name:"短毛黑点"},
{ name:"demo"},
{ name:"四福"},
{ name:"汤圆"},
{ name:"饭团"},
{ name:"帅帅"},
{ name:"猪仔"},
{ name:"nature"},
{ name:"大眼"},
{ name:"七七"},
{ name:"闹闹"},
{ name:"兜兜"},
{ name:"虎子"},
{ name:"大黑"},
],
 unknown_catlist: [
{ name:"大橘"},
{ name:"大三花"},
{ name:"丑丑"},
{ name:"小三花"},
{ name:"白围巾"},
{ name:"齐刘海"},
{ name:"不亲人小橘"},
{ name:"憨八嘎"},
{ name:"一点白"},
{ name:"贴地走"},
{ name:"仙女"},
{ name:"女明星"},
{ name:"朵朵"},
{ name:"小黑"},
{ name:"大佑"},
{ name:"刀哥"},
{ name:"呆呆"},
],
 dead_catlist: [
{ name:"小小狸"},
{ name:"大佐"},
],
    imgList:[
    "/pages/images/QR1.png"
  ],
    screenWidth: 0,
    screenHeight: 0,
    imgwidth: 0,
    imgheight: 0,
    navbar: ['在校', '毕业', '休学', '喵星'],
    currentTab: 0,
    url: app.globalData.url,
  },
  navbarTap: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },

  iconType: [
    'success', 'success_no_circle', 'info', 'warn', 'waiting', 'cancel', 'download', 'search', 'clear'
  ],

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },

  //转发跳转页面设置
  onLoad: function (options) {
    if (options.pageId) {
      wx.navigateTo({
        url: '/pages/cats/' + options.pageId + '/' + options.pageId,
      })
    }
  },

  //转发此页面的设置
  onShareAppMessage: function (ops) {
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target)
    }
    return {
      path: 'pages/index/index',  // 路径，传递参数到指定页面。
      success: function (res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  },

  // 转发到朋友圈
  onShareTimeline: function (res) {
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target)
    }
    return {
      path: 'pages/index/index',  // 路径，传递参数到指定页面。
      success: function (res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  },

  // 搜索栏输入名字后页面跳转
  bindconfirmT: function (e) {
    console.log("e.detail.value");
    if (e.detail.value) {
      wx.navigateTo({
        url: '/pages/cats/' + e.detail.value + '/' + e.detail.value,
      })
    }
  },
  copyTBL: function (e) {
    var self = this;
    wx.setClipboardData({
      data: 'Ucats',//需要复制的内容
      success: function (res) {
        // self.setData({copyTip:true}),

      }
    })
  },
  baidu:function(){
    var path = 'pages/netdisk_share/share?surl=120wJZMiVDM0jQbtXbtkMAA&to=share';
    wx.navigateToMiniProgram({
      appId: 'wxdcd3d073e47d1742',
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
  }

})

