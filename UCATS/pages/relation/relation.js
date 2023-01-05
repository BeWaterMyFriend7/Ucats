//index.js

Page({
  data: {
    screenWidth: 0,
    screenHeight: 0,
    imgwidth: 0,
    imgheight: 0,
    imgList:[
      "/pages/images/relation.png"
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
  }
})


