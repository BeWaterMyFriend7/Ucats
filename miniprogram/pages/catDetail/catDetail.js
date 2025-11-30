var _id = "1";
const app = getApp();

Page({
  data: {
    cat: {},
    url: app.globalData.url,
    relatedCatsId: [],
    photoArray: [],
    audioArr: [],
    movieArray: [],
    // 添加管理员模式相关数据
    isAdministrator: false,
    currentMode: 'NORMAL',
    MODES: {
      NORMAL: 'NORMAL',
      ADMIN: 'ADMIN'
    }
  },

  onLoad: function (options) {
    _id = options._id;
    // 更新管理员状态和模式
    this.setData({
      isAdministrator: app.globalData.isAdministrator,
      currentMode: app.globalData.currentMode,
      MODES: app.globalData.MODES
    });
    
    // 查询时过滤已软删除的数据
    app.mpServerless.db.collection('ucats').find({
      _id: _id,
      isDeleted: { $ne: true } // 不显示已软删除的数据
    }, {}).then(res => {
      this.setData({
        cat: res.result[0],
      });
    }).then(res => {
      // 处理音频数据
      if (this.data.cat.audioUrlList && this.data.cat.audioUrlList.length > 0) {
        const audioArr = this.data.cat.audioUrlList.map((url, index) => {
          return {
            bl: false,
            src: url
          };
        });
        this.setData({
          audioArr: audioArr
        });
      }
      // 处理相关猫咪数据
      if (this.data.cat.relatedCats) {
        let relatedIds = [];
        
        if (typeof this.data.cat.relatedCats === 'string') {
          // 老格式：根据名称查找猫咪（兼容老数据）
          const catNames = this.data.cat.relatedCats.split(" ").filter(name => name.trim());
          const promises = catNames.map(name => 
            app.mpServerless.db.collection('ucats').find({
              name: name.trim(),
              isDeleted: { $ne: true }
            }).then(res => res.result)
          );
          
          Promise.all(promises).then(results => {
            const allCats = results.flat();
            this.setData({
              relatedCatsId: allCats,
            });
          });
        } else if (Array.isArray(this.data.cat.relatedCats)) {
          // 新格式：根据ID查找猫咪
          relatedIds = this.data.cat.relatedCats;
          const promises = relatedIds.map(id => 
            app.mpServerless.db.collection('ucats').find({
              _id: id,
              isDeleted: { $ne: true }
            }).then(res => res.result.length > 0 ? res.result[0] : null)
          );
          
          Promise.all(promises).then(results => {
            const validCats = results.filter(cat => cat !== null);
            this.setData({
              relatedCatsId: validCats,
            });
          });
        }
      }
    });
  },

  // 每次页面显示时更新管理员状态
  onShow: function() {
    // 更新管理员状态和模式
    this.setData({
      isAdministrator: app.globalData.isAdministrator,
      currentMode: app.globalData.currentMode,
      MODES: app.globalData.MODES
    });
  },

  // 检查用户是否为管理员
  // checkAdministrator: function() {
  //   const that = this;
  //   app.mpServerless.user.getInfo().then(res => {
  //     const userId = res.result.user.userId;
  //     app.mpServerless.db.collection('ucats_admin').find({
  //       userId: userId
  //     }).then(res => {
  //       if (res.result.length > 0) {
  //         that.setData({
  //           isAdministrator: true
  //         });
  //       }
  //     }).catch(console.error);
  //   }).catch(console.error);
  // },

  // 编辑猫咪信息
  editCat: function() {
    if (this.data.isAdministrator && this.data.currentMode === 'ADMIN') {
      wx.navigateTo({
        url: '/pages/editCat/editCat?_id=' + _id,
      });
    }
  },

  //音频播放  
  audioPlay(e) {
    var that = this,
      id = e.currentTarget.dataset.id,
      key = e.currentTarget.dataset.key,
      audioArr = that.data.audioArr;

    //设置状态
    audioArr.forEach((v, i, array) => {
      v.bl = false;
      if (i == key) {
        v.bl = true;
      }
    })
    that.setData({
      audioArr: audioArr,
      audKey: key,
    })

    myaudio.autoplay = true;
    var audKey = that.data.audKey,
      vidSrc = audioArr[audKey].src;
    myaudio.src = vidSrc;

    myaudio.play();

    //开始监听
    myaudio.onPlay(() => {
      console.log('开始播放');
    })

    //结束监听
    myaudio.onEnded(() => {
      console.log('自动播放完毕');
      audioArr[key].bl = false;
      that.setData({
        audioArr: audioArr,
      })
    })

    //错误回调
    myaudio.onError((err) => {
      console.log(err);
      audioArr[key].bl = false;
      that.setData({
        audioArr: audioArr,
      })
      return
    })

  },

  // 音频停止
  audioStop(e) {
    var that = this,
      key = e.currentTarget.dataset.key,
      audioArr = that.data.audioArr;
    //设置状态
    audioArr.forEach((v, i, array) => {
      v.bl = false;
    })
    that.setData({
      audioArr: audioArr
    })

    myaudio.stop();

    //停止监听
    myaudio.onStop(() => {
      console.log('停止播放');
    })
  },


  previewImage: function (e) {
    let that = this;
    let src = e.currentTarget.dataset.src;
    wx.previewImage({
      current: src,
      urls: [src]
    })
  },

  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: this.data.cat.name,
      path: '/pages/catDetail/catDetail?_id=' + this.data.cat._id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  onShareTimeline: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: this.data.cat.name,
      path: '/pages/catDetail/catDetail?_id=' + this.data.cat._id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

})
//创建audio控件
const myaudio = wx.createInnerAudioContext();



