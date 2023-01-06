var app = getApp()
 Page({ 
 data: {
catname:"不亲人小橘",
 catitems:[ 
{category:"毛色",
 content:" 橘色",},
{category:"出没地点",
 content:" 东区",},
{category:"性别",
 content:" 未知",},
{category:"状况",
 content:" 失踪",},
{category:"绝育情况",
 content:" 未绝育",},
{category:"性格",
 content:" 怕人 安全距离 1m 以外",},
{category:"外貌",
 content:" 标准橘猫。与亲人小橘难分难解。颜色较重， 背部斑点较多，尾部狸花纹路较少",},
{category:"关系",
 content:" 😸刘海妈的孩子 | 😸😸齐刘海、斜刘海、不亲人小橘是同一窝的兄弟姐妹 | 😸😸😸与亲人小橘傻傻分不清",},

], 
url: app.globalData.url,
relationship:[{ rela:"亲人小橘"},
{ rela:"刘海妈"},
{ rela:"斜刘海"},
{ rela:"齐刘海"},
], 
nums:[
{ num: 1 },
],
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

  onPullDownRefresh:function(){
    wx.stopPullDownRefresh()
  },

  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: this.data.catname,
      path: '/pages/index/index?pageId='+this.data.catname,
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
      title: this.data.catname,
      path: '/pages/index/index?pageId='+this.data.catname,
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

