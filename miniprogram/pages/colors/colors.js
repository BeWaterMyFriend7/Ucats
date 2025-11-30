const app = getApp();
var classification = "1";

Page({
  data: {
    cat: [],
    screenWidth: 0,
    screenHeight: 0,
    imgwidth: 0,
    imgheight: 0,
    url: app.globalData.url,
    // 添加管理员模式相关数据
    isAdministrator: app.globalData.isAdministrator,
    currentMode: app.globalData.currentMode,
    MODES: app.globalData.MODES
  },

  // 添加猫咪功能
  addCat: function() {
    if (this.data.isAdministrator && this.data.currentMode === this.data.MODES.ADMIN) {
      wx.navigateTo({
        url: '/pages/addCat/addCat'
      })
    }
  },

  onLoad: function (options) {
    // 检查用户是否为管理员
    this.checkAdministrator();
    classification = options.classification;
    console.log(classification)
    this.loadMoreCat();
  },

  // 检查用户是否为管理员
  checkAdministrator: function() {
    const that = this;
    app.mpServerless.user.getInfo().then(res => {
      const userId = res.result.user.userId;
      app.mpServerless.db.collection('ucats_admin').find({
        userId: userId
      }).then(res => {
        if (res.result.length > 0) {
          that.setData({
            isAdministrator: true
          });
        }
      }).catch(console.error);
    }).catch(console.error);
  },

  onReachBottom: function () {
    this.loadMoreCat();
  },

  loadMoreCat() {
    const cat = this.data.cat;
    app.mpServerless.db.collection('ucats').find({
      classification: classification,
      status: "健康",
      isDeleted: { $ne: true } // 不显示已软删除的数据
    }, {
      sort: { 
        isAdoption: -1
       },
      skip: cat.length,
      limit: 20,
    }).then(res => {
      const {
        result: data
      } = res;
      this.setData({
        cat: cat.concat(data)
      });
    }).catch(console.error);
  },
})

