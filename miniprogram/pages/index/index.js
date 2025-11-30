const app = getApp();

Page({
  data: {
    userId: undefined,
    fostered_cat: [],
    unknown_cat: [],
    dead_cat: [],
    screenWidth: 0,
    screenHeight: 0,
    imgwidth: 0,
    imgheight: 0,
    navbar: ['在校', '毕业', '休学', '喵星'],
    currentTab: 0,
    url: app.globalData.url,
    // 添加全局变量到页面数据中
    isAdministrator: app.globalData.isAdministrator,
    currentMode: app.globalData.currentMode,
    MODES: app.globalData.MODES
  },

  navbarTap: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },

  async onLoad(options) {
    if (Object.keys(options).length !== 0) {
      this.setData({
        currentTab: parseInt(options.currentTab),
      });
    }
    this.loadMoreCat_fostered();
    this.loadMoreCat_unknown();
    this.loadMoreCat_dead();
    const {
      result
    } = await app.mpServerless.user.getInfo();
    this.setData({
      userId: result.user.userId
    });
    app.mpServerless.db.collection('ucats_admin').find({
      userId: result.user.userId
    }).then(res => {
      console.log(res.result[0].name)
      if (res.result.length > 0) {
        app.globalData.isAdministrator = true
        app.globalData.Administrator = res.result[0].name
        // 更新页面数据
        this.setData({
          isAdministrator: true
        })
      }
    }).catch(console.error);

    app.mpServerless.db.collection('new_people').insertOne({
      userId: result.user.userId,
      time: Date()
    }).then(res => { }).catch(console.error);
  },

  // 添加猫咪按钮点击事件
  addCat: function() {
    if (this.data.isAdministrator && this.data.currentMode === this.data.MODES.ADMIN) {
      wx.navigateTo({
        url: '/pages/addCat/addCat'
      })
    }
  },

  // 头像点击事件（移除添加猫咪功能）
  imageTap: function(e) {
    // 移除长按添加猫咪功能，仅保留跳转到搜索页面的功能
  },

  onReachBottom: function () {
    if (this.data.currentTab === 1) {
      this.loadMoreCat_fostered();
    }
    if (this.data.currentTab === 2) {
      this.loadMoreCat_unknown();
    }
    if (this.data.currentTab === 3) {
      this.loadMoreCat_dead();
    }
  },

  loadMoreCat_fostered() {
    app.mpServerless.db.collection('ucats').find({
      status: '送养',
      isDeleted: { $ne: true } // 不显示已软删除的数据
    }, {
      sort: {
        lastEditTime: -1
      },
      limit: 20,
    }).then(res => {
      const {
        result: data
      } = res;
      this.setData({
        fostered_cat: data
      });
    }).catch(console.error);
  },

  loadMoreCat_unknown() {
    app.mpServerless.db.collection('ucats').find({
      status: '失踪',
      isDeleted: { $ne: true } // 不显示已软删除的数据
    }, {
      sort: {
        lastEditTime: -1
      },
      limit: 20,
    }).then(res => {
      const {
        result: data
      } = res;
      this.setData({
        unknown_cat: data
      });
    }).catch(console.error);
  },

  loadMoreCat_dead() {
    app.mpServerless.db.collection('ucats').find({
      status: '离世',
      isDeleted: { $ne: true } // 不显示已软删除的数据
    }, {
      sort: {
        lastEditTime: -1
      },
      limit: 20,
    }).then(res => {
      const {
        result: data
      } = res;
      this.setData({
        dead_cat: data
      });
    }).catch(console.error);
  },

  iconType: [
    'success', 'success_no', 'info', 'warn', 'waiting', 'cancel', 'download', 'search', 'clear'
  ],

  //转发此页面的设置
  onShareAppMessage: function (ops) {
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target)
    }
    return {
      path: 'pages/index/index?currentTab=' + this.data.currentTab,
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
    return {
      path: 'pages/index/index?currentTab=' + this.data.currentTab,
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

  preview(e){
    console.log(e.currentTarget.dataset.src)
    let currentUrl = e.currentTarget.dataset.src
    // 修复未定义的 imgList，只预览当前图片
    wx.previewImage({
      current: currentUrl,
      urls: [currentUrl]  // 只预览当前图片
    })
  },
  
  // 在页面中增加切换按钮的逻辑
   toggleAdminMode: function () {
      if(this.data.isAdministrator){
          // 切换模式
      app.globalData.currentMode = 
        app.globalData.currentMode === app.globalData.MODES.NORMAL 
          ? app.globalData.MODES.ADMIN 
          : app.globalData.MODES.NORMAL;

      // 更新页面数据
      this.setData({
        currentMode: app.globalData.currentMode
      });

      // 提示用户
      wx.showToast({
        title: app.globalData.currentMode === app.globalData.MODES.ADMIN 
          ? "已进入管理员模式" 
          : "已退出管理员模式",
        icon: 'none',
      });
      } else {
        wx.showToast({
          title: '无权限切换模式',
          icon: 'none'
        });
      }
    }


})

