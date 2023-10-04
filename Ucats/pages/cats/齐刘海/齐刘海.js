var app = getApp()
 Page({ 
 data: {
catname:"齐刘海",
 catitems:[ 
{category:"昵称",
 content:" 平刘海 小公主 没猫德 平贵人",},
{category:"毛色",
 content:" 长毛白橘",},
{category:"出没地点",
 content:" 东区",},
{category:"性别",
 content:" 公",},
{category:"状况",
 content:" 失踪",},
{category:"绝育情况",
 content:" 已绝育",},
{category:"绝育时间",
 content:" 2022年10月28号",},
{category:"疫苗",
 content:" 未打疫苗",},
{category:"性格",
 content:" 亲人可抱",},
{category:"外貌",
 content:" 长毛橘白，白色橘色基本一半一半，刘海基本是平的。",},
{category:"更多",
 content:" 没猫德的时候让好多果壳er打了疫苗，真气人。齐刘海历经多次轮转现在又回到了果壳，😔，命途多舛的毛孩子。",},
{category:"关系",
 content:" 😸刘海妈的孩子 | 😸😸齐刘海、斜刘海、不亲人小橘是同一窝的兄弟姐妹 | 😸😸😸和小三花关系很好，现在天天晚上私会小三花。",},

], 
url: app.globalData.url,
relationship:[{ rela:"小三花"},
{ rela:"亲人小橘"},
{ rela:"刘海妈"},
{ rela:"斜刘海"},
{ rela:"不亲人小橘"},
], 
nums:[
{ num: 1 },
{ num: 2 },
{ num: 3 },
{ num: 4 },
{ num: 5 },
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

