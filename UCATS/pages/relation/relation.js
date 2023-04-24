//index.js

Page({
  data: {
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


