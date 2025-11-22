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
    originalAvatarUrl: '', // 原始头像URL（用于裁剪）
    firstImageUrl: '', // 首图URL
    imageList: [], // 图片列表
    videoList: [], // 视频列表
    audioList: [], // 音频列表
    
    // 裁剪器相关数据
    showCropper: false
  },

  onLoad: function (options) { },

  // 选择头像
  chooseAvatar: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        wx.getImageInfo({
          src: tempFilePath,
          success: (info) => {
            // 确保图片大小合适
            const maxSize = Math.max(info.width, info.height);
            this.setData({ 
              originalAvatarUrl: tempFilePath,
              showCropper: true
            });
          },
          fail: (err) => {
            console.error('获取图片信息失败:', err);
            wx.showToast({
              title: '图片读取失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  // 关闭裁剪器
  hideCropper() {
    this.setData({ showCropper: false });
    const img = arguments[0].detail;
    
    if (img && img.path) {
      const croppedImagePath = img.path;
      wx.showLoading({
        title: '处理头像中...',
        mask: true
      });
      
      // 处理成圆形PNG头像并压缩
      imageUtil.compressAvatarTo50KB(croppedImagePath)
        .then(compressedPath => {
          console.log('头像处理成功:', compressedPath);
          this.setData({ 
            avatarUrl: compressedPath
          });
          wx.hideLoading();
          wx.showToast({
            title: '头像处理完成',
            icon: 'success'
          });
        })
        .catch(err => {
          console.error('头像处理失败:', err);
          wx.hideLoading();
          wx.showToast({
            title: '头像处理失败',
            icon: 'none'
          });
          // 处理失败时使用裁剪后的原图
          this.setData({ 
            avatarUrl: croppedImagePath
          });
        });
    }
  },

  // 选择首图
  chooseFirstImage: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        // 获取图片信息并压缩
        wx.getFileInfo({
          filePath: tempFilePath,
          success: (info) => {
            const fileSize = info.size / 1024; // 转换为KB
            
            // 根据图片大小选择压缩目标
            let targetKB;
            if (fileSize > 1000) {
              targetKB = 150;
            } else if (fileSize > 500) {
              targetKB = 200;
            } else {
              targetKB = 250;
            }
            
            imageUtil.compressToTargetSize(tempFilePath, targetKB)
              .then(compressedPath => {
                this.setData({ firstImageUrl: compressedPath });
                wx.showToast({
                  title: '首图选择成功',
                  icon: 'success'
                });
              })
              .catch(err => {
                console.error('图片处理失败', err);
                wx.showToast({
                  title: '图片处理失败',
                  icon: 'none'
                });
              });
          },
          fail: (err) => {
            console.error('获取图片信息失败', err);
            wx.showToast({
              title: '获取图片信息失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  // 删除首图
  removeFirstImage: function() {
    wx.showModal({
      title: '提示',
      content: '确定删除首图吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ firstImageUrl: '' });
          wx.showToast({
            title: '首图已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 选择图片
  chooseImage: function() {
    const currentCount = (this.data.firstImageUrl ? 1 : 0) + this.data.imageList.length;
    if (currentCount >= 5) {
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
          // 先获取图片信息
          wx.getFileInfo({
            filePath: filePath,
            success: (info) => {
              const fileSize = info.size / 1024; // 转换为KB
              console.log('选择的图片大小:', fileSize, 'KB');
       
              // 根据图片大小选择合适的压缩目标
              let targetKB;
              if (fileSize > 1000) {
                targetKB = 150;  // 大图压缩到150KB
              } else if (fileSize > 500) {
                targetKB = 200;  // 中等图片压缩到200KB
              } else {
                targetKB = 250;  // 小图片压缩到250KB
              }

              // 保持原比例压缩
              imageUtil.compressToTargetSize(filePath, targetKB)
                .then(compressedPath => {
                  newImages.push({
                    url: compressedPath
                  });
                  
                  // 如果所有图片都处理完成，更新数据
                  if (newImages.length === tempFilePaths.length) {
                    this.setData({
                      imageList: [...this.data.imageList, ...newImages]
                    });
                    wx.showToast({
                      title: '图片处理完成',
                      icon: 'success'
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
            },
            fail: (err) => {
              console.error('获取图片信息失败', err);
              wx.showToast({
                title: '获取图片信息失败',
                icon: 'none'
              });
            }
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
            const fileSizeKB = info.size / 1024; // 转换为KB
            const limitKB = 1536; // 1.5MB = 1536KB
            if (fileSizeKB > limitKB) {
              wx.showToast({
                title: '视频大小不能超过1.5MB',
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
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
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
        }
      }
    });
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
      
      // 上传首图到腾讯云COS
      if (this.data.firstImageUrl) {
        uploadPromises.push(
          this.uploadToTencentCOS(this.data.firstImageUrl, 'firstImage')
            .then(url => {
              fileKeys.firstImage = url;
            })
        );
      }
      
      // 上传图片到腾讯云COS
      this.data.imageList.forEach((image, index) => {
        uploadPromises.push(
          this.uploadToTencentCOS(image.url, `image_${index}`)
            .then(url => {
              if (!fileKeys.images) fileKeys.images = [];
              fileKeys.images.push(url);
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
    // 使用腾讯云 COS 客户端上传（选项 A：客户端使用后端签名）
    return new Promise((resolve, reject) => {
      const cosImagePath = app.globalData.cosImagePath;
      const fileExtension = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
      const newFileName = `${cosImagePath}/${fileName}_${Date.now()}${fileExtension}`;

  // 读取需要的 config（请在 app.globalData 中配置 cosBucket, cosRegion, cosSignUrl）
      const cosBucket = app.globalData.cosBucket;
      const cosRegion = app.globalData.cosRegion;

      // 引入 cos-wx-sdk-v5（请确保已将 SDK 放到 miniprogram_npm 或 utils 中）
      let COS;
      try {
        COS = require('../../utils/cos-wx-sdk-v5.js'); 
      } catch (e) {
        console.error('无法加载 cos-wx-sdk-v5，请先安装 SDK 或把其放入 miniprogram_npm 目录', e);
        reject(e);
        return;
      }

      const cos = new COS({
        SecretId: app.globalData.cosSecretId, // 推荐使用环境变量获取；用户的 SecretId，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参考https://cloud.tencent.com/document/product/598/37140
        SecretKey: app.globalData.cosSecretKey, // 推荐使用环境变量获取；用户的 SecretKey，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参考https://cloud.tencent.com/document/product/598/37140
      });
      // 开始上传
      cos.uploadFile({
        Bucket: cosBucket,
        Region: cosRegion,
        Key: newFileName,
        FilePath: filePath,
        onProgress: function(info) {
          // 可选：可以在这里上报进度
          console.log('upload progress', info);
        }},
        function(err, data) {
          if (err) {
            console.error('上传失败:', err);
            reject(err);
            return;
          }else {
            console.log('上传成功返回结果:', data); // 打印完整返回结果
            const fileUrl = `https://${cosBucket}.cos.${cosRegion}.myqcloud.com/${newFileName}`;
            console.log('生成的URL:', fileUrl); // 打印生成的URL
            resolve(fileUrl);
          }
      });
    });
  },

  upload() {
    // 校验必填项：名字、头像、猫色分类、至少一张图片
    const name = (this.data.cat && this.data.cat.name) ? this.data.cat.name.trim() : '';
    const avatar = this.data.avatarUrl;
    const classification = this.data.cat && this.data.cat.classification;
    const imageCount = this.data.imageList ? this.data.imageList.length : 0;

    if (!name) {
      wx.showToast({ title: '请填写名字', icon: 'none' });
      return;
    }
    if (!avatar) {
      wx.showToast({ title: '请上传头像', icon: 'none' });
      return;
    }
    if (!classification && classification !== 0) {
      wx.showToast({ title: '请选择猫色分类', icon: 'none' });
      return;
    }
    if (imageCount < 1) {
      wx.showToast({ title: '请至少上传一张图片', icon: 'none' });
      return;
    }

    // 二次确认
    wx.showModal({
      title: '确认',
      content: '确定添加猫吗？',
      success: (res) => {
        if (!res.confirm) return;

        wx.showLoading({ title: '提交中...', mask: true });

        // 上传所有文件（头像、图片、视频、音频）
        this.uploadFiles()
          .then(fileKeys => {
              console.log("pack data");
              
              // 处理首图和图片列表
              const firstImageUrl = fileKeys.firstImage || '';
              const imageUrls = fileKeys.images || [];
              
            // 构建要保存到数据库的记录
            const record = {
              name: name,
              addPhotoNumber: (firstImageUrl ? 1 : 0) + imageUrls.length,
              movieNums: this.data.videoList.length,
              nickName: this.data.cat.nickName || '',
              audioNumber: this.data.audioList.length,
              furColor: this.data.cat.furColor || '',
              classification: this.data.cat.classification,
              gender: this.data.cat.gender || '',
              isAdoption: this.data.cat.isAdoption || '',
              status: this.data.cat.status || '',
              isSterilization: this.data.cat.isSterilization || '',
              sterilizationTime: this.data.cat.sterilizationTime || '',
              vaccine: this.data.cat.vaccine || '',
              character: this.data.cat.character || '',
              firstSightingTime: this.data.cat.firstSightingTime || '',
              appearance: this.data.cat.appearance || '',
              missingTime: this.data.cat.missingTime || '',
              relationship: this.data.cat.relationship || '',
              moreInformation: this.data.cat.moreInformation || '',
              notes: this.data.cat.notes || '',
              deliveryTime: this.data.cat.deliveryTime || '',
              deathTime: this.data.cat.deathTime || '',
              deathReason: this.data.cat.deathReason || '',
              location: this.data.cat.location || '',
              birthTime: this.data.cat.birthTime || '',
              relatedCats: this.data.cat.relatedCats || '',
              lastEditTime: Date(),
              lastEditAdministrator: app.globalData.Administrator || '',
              // 头像独立存储
              avatarUrl: fileKeys.avatar || this.data.avatarUrl || '',
              // 首图（背景图）
              firstImageUrl: firstImageUrl,
              // 图片列表
              imageUrlList: imageUrls,
              // 视频和音频列表
              videoUrlList: fileKeys.videos || [],
              audioUrlList: fileKeys.audios || [],
              isDeleted: false
            };

            // 插入数据库
            return app.mpServerless.db.collection('ucats').insertOne(record);
          })
          .then(() => {
            wx.hideLoading();
            wx.showToast({ title: '添加成功', icon: 'success' });
            // 成功后返回首页
            setTimeout(() => {
              try {
                wx.reLaunch({ url: '/pages/index/index' });
              } catch (e) {
                wx.navigateBack();
              }
            }, 1200);
          })
          .catch(err => {
            wx.hideLoading();
            console.error('提交失败：', err);
            wx.showToast({ title: '提交失败，请重试', icon: 'none' });
            // 保持在当前页面，用户可重试
          });
      }
    });
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






















