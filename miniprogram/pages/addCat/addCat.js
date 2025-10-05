var _id = "1";
const app = getApp();
const imageUtil = require('../../utils/imageUtil.js');

Page({
  data: {
    cat: {
      status: '健康',
      classification: 0,
      addPhotoNumber: 0,
      audioNumber: 0,
      movieNums:0,
      classification: '狸花',
    },
    url: app.globalData.url,
    pickers: {
      classification: ['狸花', '橘猫及橘白', '奶牛', '玳瑁及三花', '纯色'],
      isAdoption: ['', '待领养'],
      gender: ['', '公', '母'],
      addPhotoNumber: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      movieNums: ['0', '1', '2', '3'],
      audioNumber: ['0', '1', '2', '3'],
      isSterilization: ['', '已绝育', '未绝育'],
      vaccine: ['','已打疫苗','未打疫苗'],
      status: ['健康', '送养', '失踪', '离世'],
      character: ['', '亲人可抱', '亲人不可抱 可摸', '薛定谔亲人', '吃东西时可以一直摸', '吃东西时可以摸一下', '怕人 安全距离 1m 以内', '怕人 安全距离 1m 以外'],
    },
    picker_selected: {},
    // 文件上传相关数据
    avatarUrl: '', // 头像URL
    imageList: [], // 图片列表
    videoList: [], // 视频列表
    audioList: [], // 音频列表
  },

  onLoad: function (options) { },

  // 选择头像
  chooseAvatar: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        // 压缩头像到50KB并裁剪为圆形
        imageUtil.compressImageToSize(tempFilePath, 50)
          .then(compressedPath => {
            return imageUtil.cropAvatar(compressedPath, 200);
          })
          .then(croppedPath => {
            this.setData({
              avatarUrl: croppedPath
            });
          })
          .catch(err => {
            console.error('头像处理失败', err);
            wx.showToast({
              title: '头像处理失败',
              icon: 'none'
            });
          });
      }
    });
  },

  // 选择图片
  chooseImage: function() {
    if (this.data.imageList.length >= 5) {
      wx.showToast({
        title: '最多只能上传5张图片',
        icon: 'none'
      });
      return;
    }
    
    wx.chooseImage({
      count: 5 - this.data.imageList.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        const newImages = [];
        
        // 处理每张图片
        tempFilePaths.forEach((filePath, index) => {
          imageUtil.compressImageToSize(filePath, 200)
            .then(compressedPath => {
              newImages.push({
                url: compressedPath,
                isCover: this.data.imageList.length + newImages.length === 0 // 第一张设为首图
              });
              
              // 如果所有图片都处理完成，更新数据
              if (newImages.length === tempFilePaths.length) {
                this.setData({
                  imageList: [...this.data.imageList, ...newImages]
                });
              }
            })
            .catch(err => {
              console.error('图片处理失败', err);
              wx.showToast({
                title: '图片处理失败',
                icon: 'none'
              });
            });
        });
      }
    });
  },

  // 选择视频
  chooseVideo: function() {
    if (this.data.videoList.length >= 2) {
      wx.showToast({
        title: '最多只能上传2个视频',
        icon: 'none'
      });
      return;
    }
    
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      compressed: true,
      maxDuration: 60,
      success: (res) => {
        const tempFilePath = res.tempFilePath;
        // 检查视频大小
        wx.getFileInfo({
          filePath: tempFilePath,
          success: (info) => {
            const fileSize = info.size / 1024; // 转换为KB
            if (fileSize > 500) {
              wx.showToast({
                title: '视频大小不能超过500KB',
                icon: 'none'
              });
              return;
            }
            
            // 添加到视频列表
            this.setData({
              videoList: [...this.data.videoList, {
                url: tempFilePath
              }]
            });
          }
        });
      }
    });
  },

  // 选择音频
  chooseAudio: function() {
    if (this.data.audioList.length >= 3) {
      wx.showToast({
        title: '最多只能上传3个音频',
        icon: 'none'
      });
      return;
    }
    
    wx.chooseMessageFile({
      count: 3 - this.data.audioList.length,
      type: 'file',
      extension: ['mp3', 'm4a', 'wav'],
      success: (res) => {
        const tempFiles = res.tempFiles;
        const newAudios = [];
        
        tempFiles.forEach((file, index) => {
          // 检查文件大小
          if (file.size / 1024 > 500) { // 500KB限制
            wx.showToast({
              title: '音频文件不能超过500KB',
              icon: 'none'
            });
            return;
          }
          
          newAudios.push({
            url: file.path,
            name: file.name
          });
        });
        
        if (newAudios.length > 0) {
          this.setData({
            audioList: [...this.data.audioList, ...newAudios]
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '选择音频失败',
          icon: 'none'
        });
      }
    });
  },

  // 设置首图
  setCoverImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const imageList = this.data.imageList.map((item, i) => {
      return {
        ...item,
        isCover: i === index
      };
    });
    
    this.setData({
      imageList: imageList
    });
  },

  // 删除图片
  removeImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const imageList = this.data.imageList.filter((_, i) => i !== index);
    
    // 如果删除的是首图，将第一张设为新的首图
    if (imageList.length > 0 && imageList.some(item => item.isCover)) {
      const newImageList = imageList.map((item, i) => {
        return {
          ...item,
          isCover: i === 0 && !imageList.some(img => img.isCover)
        };
      });
      this.setData({
        imageList: newImageList
      });
    } else {
      this.setData({
        imageList: imageList
      });
    }
  },

  // 删除视频
  removeVideo: function(e) {
    const index = e.currentTarget.dataset.index;
    const videoList = this.data.videoList.filter((_, i) => i !== index);
    this.setData({
      videoList: videoList
    });
  },

  // 删除音频
  removeAudio: function(e) {
    const index = e.currentTarget.dataset.index;
    const audioList = this.data.audioList.filter((_, i) => i !== index);
    this.setData({
      audioList: audioList
    });
  },

  // 预览图片
  previewImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const urls = this.data.imageList.map(item => item.url);
    wx.previewImage({
      current: urls[index],
      urls: urls
    });
  },

  // 选择日期
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    console.log(key)
    this.setData({
      ['cat.' + key]: value
    })
  },

  // 选择了东西
  bindPickerChange(e) {
    const key = e.currentTarget.dataset.key;
    const index = e.detail.value;
    var value = this.data.pickers[key][index];
    console.log(value)
    this.setData({
      ['cat.' + key]: value
    });
  },

  // 上传文件到服务器
  uploadFiles: function() {
    return new Promise((resolve, reject) => {
      const uploadPromises = [];
      const fileKeys = {};
      
      // 上传头像到腾讯云COS
      if (this.data.avatarUrl) {
        uploadPromises.push(
          this.uploadToTencentCOS(this.data.avatarUrl, 'avatar')
            .then(url => {
              fileKeys.avatar = url;
            })
        );
      }
      
      // 上传图片到腾讯云COS
      this.data.imageList.forEach((image, index) => {
        uploadPromises.push(
          this.uploadToTencentCOS(image.url, `image_${index}`)
            .then(url => {
              if (!fileKeys.images) fileKeys.images = [];
              fileKeys.images.push({
                url: url,
                isCover: image.isCover
              });
            })
        );
      });
      
      // 上传视频到腾讯云COS
      this.data.videoList.forEach((video, index) => {
        uploadPromises.push(
          this.uploadToTencentCOS(video.url, `video_${index}`)
            .then(url => {
              if (!fileKeys.videos) fileKeys.videos = [];
              fileKeys.videos.push(url);
            })
        );
      });
      
      // 上传音频到腾讯云COS
      this.data.audioList.forEach((audio, index) => {
        uploadPromises.push(
          this.uploadToTencentCOS(audio.url, `audio_${index}`)
            .then(url => {
              if (!fileKeys.audios) fileKeys.audios = [];
              fileKeys.audios.push(url);
            })
        );
      });
      
      // 等待所有文件上传完成
      Promise.all(uploadPromises)
        .then(() => resolve(fileKeys))
        .catch(reject);
    });
  },

  // 上传文件到腾讯云COS
  uploadToTencentCOS: function(filePath, fileName) {
    return new Promise((resolve, reject) => {
      // 这里需要实现腾讯云COS上传逻辑
      // 由于微信小程序限制，实际项目中可能需要通过后端服务中转
      // 此处为示例代码，实际使用时需要替换为真实的腾讯云COS上传逻辑
      console.log('上传文件到腾讯云COS:', filePath, fileName);
      
      // 模拟上传成功，返回腾讯云COS的URL
      // 实际项目中应该调用腾讯云COS的API进行上传
      const cosUrl = `https://ucats-1306442357.cos.ap-nanjing.myqcloud.com/Ucats_pic/${fileName}_${Date.now()}`;
      resolve(cosUrl);
    });
  },

  upload() {
    wx.showModal({
      title: '提示',
      content: '确定添加猫吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '更新中...',
          });
          
          // 先上传文件
          this.uploadFiles()
            .then(fileKeys => {
              // 文件上传成功后，保存猫咪信息
              return app.mpServerless.db.collection('ucats').insertOne({
                name: this.data.cat.name,
                addPhotoNumber: this.data.imageList.length,
                movieNums: this.data.videoList.length,
                nickName: this.data.cat.nickName,
                audioNumber: this.data.audioList.length,
                furColor: this.data.cat.furColor,
                classification: this.data.cat.classification,
                gender: this.data.cat.gender,
                isAdoption: this.data.cat.isAdoption,
                status: this.data.cat.status,
                isSterilization: this.data.cat.isSterilization,
                sterilizationTime: this.data.cat.sterilizationTime,
                vaccine: this.data.cat.vaccine,
                character: this.data.cat.character,
                firstSightingTime: this.data.cat.firstSightingTime,
                appearance: this.data.cat.appearance,
                missingTime: this.data.cat.missingTime,
                relationship: this.data.cat.relationship,
                moreInformation: this.data.cat.moreInformation,
                notes: this.data.cat.notes,
                deliveryTime: this.data.cat.deliveryTime,
                deathTime: this.data.cat.deathTime,
                deathReason: this.data.cat.deathReason,
                location: this.data.cat.location,
                birthTime: this.data.cat.birthTime,
                relatedCats: this.data.cat.relatedCats,
                lastEditTime: Date(),
                lastEditAdministrator: app.globalData.Administrator,
                // 添加文件链接（腾讯云COS的URL）
                avatarUrl: fileKeys.avatar || '',
                imageUrls: fileKeys.images || [],
                videoUrls: fileKeys.videos || [],
                audioUrls: fileKeys.audios || [],
                // 软删除标记
                isDeleted: false
              });
            })
            .then(res => {
              wx.hideLoading();
              wx.showToast({
                icon: 'success',
                title: '操作成功',
              });
              // 返回上一页
              setTimeout(() => {
                wx.navigateBack();
              }, 1500);
            })
            .catch(err => {
              wx.hideLoading();
              console.error(err);
              wx.showToast({
                icon: 'error',
                title: '操作失败',
              });
            });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  // 输入了东西
  inputText(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    this.setData({
      ['cat.' + key]: value
    });
  },

})
//创建audio控件
const myaudio = wx.createInnerAudioContext();

