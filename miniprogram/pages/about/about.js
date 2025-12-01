//index.js
var app = getApp()
Page({
  data: {
    screenWidth: 0,
    screenHeight: 0,
    imgwidth: 0,
    imgheight: 0,
    navbar: ['写给你','过去现在和未来', '关于我们' ],
    currentTab: 0,
    url: app.globalData.url,
    imgList:[
      "/pages/images/qr_GKMXjpg.jpg",
      "/pages/images/qr_GKDCHWLX.jpg"
    ]
  },
  navbarTap: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },
  //转发功能
  onShareAppMessage: function (res) {
    let users = wx.getStorageSync('user');
    if (res.from === 'button') { }
    return {
      path: 'pages/about/about',  // 路径，传递参数到指定页面。
      success: function (res) { }
    }
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
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

  // 复制GitHub地址
  copyGithubUrl: function(e) {
    const url = e.currentTarget.dataset.url;
    wx.setClipboardData({
      data: url,
      success: function(res) {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function(err) {
        wx.showToast({
          title: '复制失败',
          icon: 'error',
          duration: 2000
        });
      }
    });
  },

  // 跳转小程序
  naviToMini:function(e){
    wx.navigateToMiniProgram({
      appId: 'wxf6b3f064105b1e8b',
      // path: 'pages/index/index',
      envVersion: 'release',
      success(res) {
        // 打开成功
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


