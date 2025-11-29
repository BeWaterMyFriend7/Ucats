var _id = "1";
const app = getApp();
const imageUtil = require('../../utils/imageUtil.js');

Page({
  data: {
    cat: {},
    url: app.globalData.url,
    classification: 0,
    pickers: {
      classification: ['狸花', '橘猫及橘白', '奶牛', '玳瑁及三花', '纯色'],
      gender: ['', '公', '母'],
      isAdoption: ['', '待领养'],
      addPhotoNumber: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      audioNumber: ['0', '1', '2', '3'],
      movieNums: ['0', '1', '2', '3'],
      isSterilization: ['', '已绝育', '未绝育'],
      status: ['健康', '送养', '失踪', '离世'],
      character: ['', '亲人可抱', '亲人不可抱 可摸', '薛定谔亲人', '吃东西时可以一直摸', '吃东西时可以摸一下', '怕人 安全距离 1m 以内', '怕人 安全距离 1m 以外'],
    },
    picker_selected: {},
    // 文件上传相关数据
    avatarUrl: '', // 新上传的头像URL
    originalAvatarUrl: '', // 原始头像URL（用于裁剪）
    firstImageUrl: '', // 首图URL
    imageList: [], // 图片列表
    videoList: [], // 视频列表
    audioList: [], // 音频列表

    // 裁剪器相关数据
    showCropper: false
  },

  onLoad: function (options) {
    _id = options._id;
    app.mpServerless.db.collection('ucats').find({
      _id: _id,
    }, {}).then(res => {
      const cat = res.result[0];
      // console.log(res)
      this.setData({
        cat: cat,
        classification: cat.classification,
        firstImageUrl: cat.firstImageUrl || '',
        avatarUrl: cat.avatarUrl || '', // 初始化头像URL
        imageList: (cat.imageUrlList || []).map(url => ({ url })), // 移除isCover字段
        videoList: (cat.videoUrlList || []).map(url => ({ url })),
        audioList: (cat.audioUrlList || []).map(url => ({ url, name: '' })),
      });
    }).then(res => {
      var picker_selected = {};
      const pickers = this.data.pickers;
      console.log(pickers)
      for (const key in pickers) {
        const items = pickers[key];
        const value = this.data.cat[key];
        const idx = items.findIndex((v) => v === value);
        if (idx === -1 && typeof value === "number") {
          picker_selected[key] = value;
        } else {
          picker_selected[key] = idx;
        }
      }
      this.setData({
        picker_selected: picker_selected,
      });
    })
  },

  // 选择头像
  chooseAvatar: function () {
    const self = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        self.setData({
          originalAvatarUrl: tempFilePath,
          showCropper: true
        });
      }
    });
  },

  // 裁剪确认回调
  onCropConfirm(e) {
    console.log('裁剪确认:', e);
    this.setData({ showCropper: false });

    const img = e.detail;
    if (!img || !img.path) {
      console.error('裁剪后的图片路径无效');
      wx.showToast({
        title: '裁剪失败，请重试',
        icon: 'none'
      });
      return;
    }

    const croppedImagePath = img.path;

    // 压缩图片到50KB并显示在预览框
    console.log('开始压缩头像:', croppedImagePath);
    imageUtil.compressAvatarTo50KB(croppedImagePath)
      .then(compressedPath => {
        console.log('头像压缩成功:', compressedPath);
        this.setData({
          avatarUrl: compressedPath
        });

        // 同时更新cat对象中的头像，确保预览显示正确
        const cat = this.data.cat;
        cat.avatarUrl = compressedPath;
        this.setData({ cat: cat });

        // 显示压缩成功的提示
        wx.showToast({
          title: '头像处理完成',
          icon: 'success'
        });
      })
      .catch(err => {
        console.error('头像压缩失败:', err);
        wx.showToast({
          title: '头像压缩失败，使用原始图片',
          icon: 'none'
        });
        // 如果压缩失败，使用原始裁剪图片
        this.setData({
          avatarUrl: croppedImagePath
        });

        // 同时更新cat对象中的头像
        const cat = this.data.cat;
        cat.avatarUrl = croppedImagePath;
        this.setData({ cat: cat });
      });
  },

  // 关闭裁剪器
  hideCropper() {
    this.setData({ showCropper: false })

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
  chooseCoverImage: function () {
    if (this.data.firstImageUrl) {
      wx.showActionSheet({
        itemList: ['预览首图', '更换首图', '删除首图'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 预览首图
            wx.previewImage({
              current: this.data.firstImageUrl,
              urls: [this.data.firstImageUrl]
            });
          } else if (res.tapIndex === 1) {
            // 更换首图
            this.chooseNewCoverImage();
          } else if (res.tapIndex === 2) {
            // 删除首图
            this.setData({
              firstImageUrl: ''
            });
            // 同时更新cat对象中的首图
            const cat = this.data.cat;
            cat.firstImageUrl = '';
            this.setData({ cat: cat });
            wx.showToast({
              title: '首图已删除',
              icon: 'success'
            });
          }
        }
      });
    } else {
      this.chooseNewCoverImage();
    }
  },

  // 选择新的首图
  chooseNewCoverImage: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];

        // 获取图片信息
        wx.getImageInfo({
          src: tempFilePath,
          success: (info) => {
            console.log('选择的首图信息:', info);

            // 根据图片大小选择合适的压缩目标
            const fileSize = info.size / 1024; // 转换为KB
            let targetKB;
            if (fileSize > 1000) {
              targetKB = 150;  // 大图压缩到150KB
            } else if (fileSize > 500) {
              targetKB = 200;  // 中等图片压缩到200KB
            } else {
              targetKB = 250;  // 小图片压缩到250KB
            }

            // 压缩图片
            imageUtil.compressToTargetSize(tempFilePath, targetKB)
              .then(compressedPath => {
                this.setData({
                  firstImageUrl: compressedPath
                });
                // 同时更新cat对象中的首图，确保预览显示正确
                const cat = this.data.cat;
                cat.firstImageUrl = compressedPath;
                this.setData({ cat: cat });
                wx.showToast({
                  title: '首图设置成功',
                  icon: 'success'
                });
              })
              .catch(err => {
                console.error('首图压缩失败', err);
                wx.showToast({
                  title: '首图处理失败',
                  icon: 'none'
                });
              });
          },
          fail: (err) => {
            console.error('获取首图信息失败', err);
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
  removeCoverImage: function () {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除首图吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            firstImageUrl: ''
          });
          // 同时更新cat对象中的首图
          const cat = this.data.cat;
          cat.firstImageUrl = '';
          this.setData({ cat: cat });
          wx.showToast({
            title: '首图已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 选择图片
  chooseImage: function () {
    const currentCount = this.data.imageList.length;
    if (currentCount >= 5) {
      wx.showToast({
        title: '最多只能上传5张图片',
        icon: 'none'
      });
      return;
    }

    wx.chooseImage({
      count: 5 - currentCount,
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
  chooseVideo: function () {
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
  chooseAudio: function () {
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

  // 设置首图
  setCoverImage: function (e) {
    const index = e.currentTarget.dataset.index;
    const imageUrl = this.data.imageList[index].url;

    this.setData({
      firstImageUrl: imageUrl
    });

    // 同时更新cat对象中的首图
    const cat = this.data.cat;
    cat.firstImageUrl = imageUrl;
    this.setData({ cat: cat });

    wx.showToast({
      title: '首图设置成功',
      icon: 'success'
    });
  },

  // 删除图片
  removeImage: function (e) {
    const index = e.currentTarget.dataset.index;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          const imageList = this.data.imageList.filter((_, i) => i !== index);
          this.setData({
            imageList: imageList
          });

          // 如果删除的是首图，清空首图
          if (this.data.firstImageUrl === this.data.imageList[index].url) {
            this.setData({
              firstImageUrl: ''
            });
            // 同时更新cat对象中的首图
            const cat = this.data.cat;
            cat.firstImageUrl = '';
            this.setData({ cat: cat });
          }
        }
      }
    });
  },

  // 删除视频
  removeVideo: function (e) {
    const index = e.currentTarget.dataset.index;
    const videoList = this.data.videoList.filter((_, i) => i !== index);
    this.setData({
      videoList: videoList
    });
  },

  // 删除音频
  removeAudio: function (e) {
    const index = e.currentTarget.dataset.index;
    const audioList = this.data.audioList.filter((_, i) => i !== index);
    this.setData({
      audioList: audioList
    });
  },

  // 预览图片
  previewImage: function (e) {
    const index = e.currentTarget.dataset.index;
    const urls = this.data.imageList.map(item => item.url);
    wx.previewImage({
      current: urls[index],
      urls: urls
    });
  },

  // 删除已经选择的日期
  cancelDate(e) {
    const key = e.currentTarget.dataset.key;
    console.log(e)
    wx.showModal({
      title: '提示',
      content: '确定删除吗？',
      content: '确定删除这个日期吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            ['cat.' + key]: ''
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },

  // 上传文件到服务器
  uploadFiles: function () {
    return new Promise((resolve, reject) => {
      const uploadPromises = [];
      const fileKeys = {};

      // 强制上传头像（确保是腾讯云URL）
      if (this.data.avatarUrl) {
        // 如果是原有头像且没有变化，直接使用
        if (this.data.avatarUrl === this.data.cat.avatarUrl && !this.data.avatarUrl.includes('http://tmp/') && !this.data.avatarUrl.includes('https://tmp/')) {
          fileKeys.avatarUrl = this.data.avatarUrl;
        } else {
          // 新头像或需要重新上传的头像
          uploadPromises.push(
            this.uploadToTencentCOS(this.data.avatarUrl, 'avatar')
              .then(url => {
                fileKeys.avatarUrl = url;
              })
          );
        }
      }

      // 强制上传首图（确保是腾讯云URL）
      if (this.data.firstImageUrl) {
        // 如果是原有首图且没有变化，直接使用
        if (this.data.firstImageUrl === this.data.cat.firstImageUrl && !this.data.firstImageUrl.includes('http://tmp/') && !this.data.firstImageUrl.includes('https://tmp/')) {
          fileKeys.firstImageUrl = this.data.firstImageUrl;
        } else {
          // 新首图或需要重新上传的首图
          uploadPromises.push(
            this.uploadToTencentCOS(this.data.firstImageUrl, 'firstImage')
              .then(url => {
                fileKeys.firstImageUrl = url;
              })
          );
        }
      }

      // 处理图片列表 - 确保所有图片都是腾讯云URL
      const originalImageUrls = this.data.cat.imageUrlList || [];
      const currentImageUrls = this.data.imageList.map(image => image.url);
      
      // 保留原有的、未被删除的、且不是临时路径的图片
      const keptImages = currentImageUrls.filter(url => 
        originalImageUrls.includes(url) && 
        !url.includes('http://tmp/') && 
        !url.includes('https://tmp/')
      );
      
      // 上传新增的或需要重新上传的图片
      const newImages = this.data.imageList.filter(image => {
        const url = image.url;
        return !originalImageUrls.includes(url) || url.includes('http://tmp/') || url.includes('https://tmp/');
      });

      newImages.forEach((image, index) => {
        uploadPromises.push(
          this.uploadToTencentCOS(image.url, `image_${index}`)
            .then(url => {
              if (!fileKeys.imageUrlList) fileKeys.imageUrlList = [];
              fileKeys.imageUrlList.push(url);
            })
        );
      });

      // 处理视频列表 - 确保所有视频都是腾讯云URL
      const originalVideoUrls = this.data.cat.videoUrlList || [];
      const currentVideoUrls = this.data.videoList.map(video => video.url);
      
      // 保留原有的、未被删除的、且不是临时路径的视频
      const keptVideos = currentVideoUrls.filter(url => 
        originalVideoUrls.includes(url) && 
        !url.includes('http://tmp/') && 
        !url.includes('https://tmp/')
      );
      
      // 上传新增的或需要重新上传的视频
      const newVideos = this.data.videoList.filter(video => {
        const url = video.url;
        return !originalVideoUrls.includes(url) || url.includes('http://tmp/') || url.includes('https://tmp/');
      });

      newVideos.forEach((video, index) => {
        uploadPromises.push(
          this.uploadToTencentCOS(video.url, `video_${index}`)
            .then(url => {
              if (!fileKeys.videoUrlList) fileKeys.videoUrlList = [];
              fileKeys.videoUrlList.push(url);
            })
        );
      });

      // 处理音频列表 - 确保所有音频都是腾讯云URL
      const originalAudioUrls = this.data.cat.audioUrlList || [];
      const currentAudioUrls = this.data.audioList.map(audio => audio.url);
      
      // 保留原有的、未被删除的、且不是临时路径的音频
      const keptAudios = currentAudioUrls.filter(url => 
        originalAudioUrls.includes(url) && 
        !url.includes('http://tmp/') && 
        !url.includes('https://tmp/')
      );
      
      // 上传新增的或需要重新上传的音频
      const newAudios = this.data.audioList.filter(audio => {
        const url = audio.url;
        return !originalAudioUrls.includes(url) || url.includes('http://tmp/') || url.includes('https://tmp/');
      });

      newAudios.forEach((audio, index) => {
        uploadPromises.push(
          this.uploadToTencentCOS(audio.url, `audio_${index}`)
            .then(url => {
              if (!fileKeys.audioUrlList) fileKeys.audioUrlList = [];
              fileKeys.audioUrlList.push(url);
            })
        );
      });

      // 等待所有文件上传完成
      Promise.all(uploadPromises)
        .then(() => {
          // 构建最终的文件列表（只包含网络URL，不包含临时路径）
          const finalFiles = {};

          // 头像：确保是腾讯云URL
          finalFiles.avatarUrl = fileKeys.avatarUrl || '';

          // 首图：确保是腾讯云URL
          finalFiles.firstImageUrl = fileKeys.firstImageUrl || '';

          // 图片列表：保留的图片 + 新上传的图片URL
          finalFiles.imageUrlList = [
            ...keptImages,
            ...(fileKeys.imageUrlList || [])
          ];

          // 视频列表：保留的视频 + 新上传的视频URL
          finalFiles.videoUrlList = [
            ...keptVideos,
            ...(fileKeys.videoUrlList || [])
          ];

          // 音频列表：保留的音频 + 新上传的音频URL
          finalFiles.audioUrlList = [
            ...keptAudios,
            ...(fileKeys.audioUrlList || [])
          ];

          console.log('最终文件列表:', finalFiles);
          resolve(finalFiles);
        })
        .catch(reject);
    });
  },

  // 上传文件到腾讯云
  uploadToTencentCOS: function (filePath, fileName) {

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
        SecretKey: app.globalData.cosSecretKey, // 推荐使用环境变量获取；用户的 SecretId，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参考https://cloud.tencent.com/document/product/598/37140
      });
      // 开始上传
      cos.uploadFile({
        Bucket: cosBucket,
        Region: cosRegion,
        Key: newFileName,
        FilePath: filePath,
        onProgress: function (info) {
          // 可选：可以在这里上报进度
          console.log('upload progress', info);
        }
      },
        function (err, data) {
          if (err) {
            console.error('上传失败:', err);
            reject(err);
            return;
          } else {
            console.log('上传成功返回结果:', data); // 打印完整返回结果
            const fileUrl = `https://${cosBucket}.cos.${cosRegion}.myqcloud.com/${newFileName}`;
            console.log('生成的URL:', fileUrl); // 打印生成的URL
            resolve(fileUrl);
          }
        });
    });
  },

  // 检查是否包含临时路径（仅在调试时使用）
  hasTemporaryPath: function() {
    const checkPath = (path) => {
      return path && (path.includes('http://tmp/') || path.includes('https://tmp/'));
    };

    // 检查头像
    if (checkPath(this.data.avatarUrl)) {
      return true;
    }

    // 检查首图
    if (checkPath(this.data.firstImageUrl)) {
      return true;
    }

    // 检查图片列表
    for (let i = 0; i < this.data.imageList.length; i++) {
      if (checkPath(this.data.imageList[i].url)) {
        return true;
      }
    }

    // 检查视频列表
    for (let i = 0; i < this.data.videoList.length; i++) {
      if (checkPath(this.data.videoList[i].url)) {
        return true;
      }
    }

    // 检查音频列表
    for (let i = 0; i < this.data.audioList.length; i++) {
      if (checkPath(this.data.audioList[i].url)) {
        return true;
      }
    }

    return false;
  },

  upload() {
    // 第一步：校验必填项信息
    const name = (this.data.cat && this.data.cat.name) ? this.data.cat.name.trim() : '';
    const avatar = this.data.avatarUrl || this.data.cat.avatarUrl;
    const firstImage = this.data.firstImageUrl || this.data.cat.firstImageUrl;

    if (!name) {
      wx.showToast({ title: '请填写猫咪名称', icon: 'none' });
      return;
    }
    if (!avatar) {
      wx.showToast({ title: '请上传头像', icon: 'none' });
      return;
    }
    if (!firstImage) {
      wx.showToast({ title: '请上传首图', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '提示',
      content: '确定提交吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '上传文件中...',
          });

          // 第二步：上传多媒体文件到腾讯云
          this.uploadFiles()
            .then(fileKeys => {
              console.log('文件上传完成:', fileKeys);

              // 第三步：验证上传结果，确保没有临时路径
              const validateResult = this.validateUploadResult(fileKeys);
              if (!validateResult.valid) {
                throw new Error(validateResult.error);
              }

              wx.showLoading({
                title: '更新数据库中...',
              });

              // 第四步：将相关信息上传至阿里云数据库
              const updateData = {
                addPhotoNumber: fileKeys.imageUrlList.length + (fileKeys.firstImageUrl ? 1 : 0),
                movieNums: fileKeys.videoUrlList.length,
                audioNumber: fileKeys.audioUrlList.length,
                isAdoption: this.data.cat.isAdoption || '',
                nickName: this.data.cat.nickName || '',
                furColor: this.data.cat.furColor || '',
                classification: this.data.cat.classification || '',
                gender: this.data.cat.gender || '',
                status: this.data.cat.status || '',
                isSterilization: this.data.cat.isSterilization || '',
                sterilizationTime: this.data.cat.sterilizationTime || '',
                character: this.data.cat.character || '',
                firstSightingTime: this.data.cat.firstSightingTime || '',
                firstSightingLocation: this.data.cat.firstSightingLocation || '',
                appearance: this.data.cat.appearance || '',
                missingTime: this.data.cat.missingTime || '',
                relationship: this.data.cat.relationship || '',
                deliveryTime: this.data.cat.deliveryTime || '',
                deathTime: this.data.cat.deathTime || '',
                moreInformation: this.data.cat.moreInformation || '',
                notes: this.data.cat.notes || '',
                deathReason: this.data.cat.deathReason || '',
                location: this.data.cat.location || '',
                birthTime: this.data.cat.birthTime || '',
                relatedCats: this.data.cat.relatedCats || '',
                lastEditTime: new Date(),
                lastEditAdministrator: app.globalData.Administrator || '',
                // 更新文件链接（腾讯云COS的URL）
                avatarUrl: fileKeys.avatarUrl || '',
                firstImageUrl: fileKeys.firstImageUrl || '',
                imageUrlList: fileKeys.imageUrlList || [],
                videoUrlList: fileKeys.videoUrlList || [],
                audioUrlList: fileKeys.audioUrlList || [],
                // 保持软删除标记
                isDeleted: this.data.cat.isDeleted !== undefined ? this.data.cat.isDeleted : false
              };

              console.log('更新数据:', updateData);

              return app.mpServerless.db.collection('ucats').updateMany({
                _id: this.data.cat._id
              }, {
                $set: updateData
              });
            })
            .then(res => {
              console.log('数据库更新结果:', res);
              wx.hideLoading();
              wx.showToast({
                icon: 'success',
                title: '操作成功',
              });
              // 返回上一页并刷新
              setTimeout(() => {
                const pages = getCurrentPages();
                if (pages.length > 1) {
                  const prevPage = pages[pages.length - 2];
                  // 如果上一页是详情页，触发刷新
                  if (prevPage && prevPage.route && (prevPage.route.includes('catDetail') || prevPage.route.includes('detail'))) {
                    prevPage.onLoad && prevPage.onLoad({ _id: _id });
                  }
                }
                wx.navigateBack();
              }, 1500);
            })
            .catch(err => {
              wx.hideLoading();
              console.error('操作失败:', err);
              // 第五步：如果此时图片路径中包含临时路径，提示用户重试
              if (err.message && err.message.includes('临时路径')) {
                wx.showModal({
                  title: '上传失败',
                  content: err.message + '请检查文件后重试。',
                  showCancel: false
                });
              } else {
                wx.showToast({
                  icon: 'error',
                  title: err.message || '操作失败，请重试',
                });
              }
            });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  // 验证上传结果
  validateUploadResult: function(fileKeys) {
    const checkPath = (path, name) => {
      if (path && (path.includes('http://tmp/') || path.includes('https://tmp/'))) {
        return { valid: false, error: `${name}仍包含临时路径，请重新处理` };
      }
      return { valid: true };
    };

    // 检查头像
    let result = checkPath(fileKeys.avatarUrl, '头像');
    if (!result.valid) return result;

    // 检查首图
    result = checkPath(fileKeys.firstImageUrl, '首图');
    if (!result.valid) return result;

    // 检查图片列表
    for (let i = 0; i < (fileKeys.imageUrlList || []).length; i++) {
      result = checkPath(fileKeys.imageUrlList[i], `第${i + 1}张图片`);
      if (!result.valid) return result;
    }

    // 检查视频列表
    for (let i = 0; i < (fileKeys.videoUrlList || []).length; i++) {
      result = checkPath(fileKeys.videoUrlList[i], `第${i + 1}个视频`);
      if (!result.valid) return result;
    }

    // 检查音频列表
    for (let i = 0; i < (fileKeys.audioUrlList || []).length; i++) {
      result = checkPath(fileKeys.audioUrlList[i], `第${i + 1}个音频`);
      if (!result.valid) return result;
    }

    return { valid: true };
  },

  delete() {
    wx.showModal({
      title: '提示',
      confirmColor: 'red',
      content: '确定删除吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击确定')
          // 软删除：仅设置标记，不真正删除数据
          app.mpServerless.db.collection('ucats').updateMany({
            _id: this.data.cat._id
          }, {
            $set: {
              isDeleted: true,
              lastEditTime: Date(),
              lastEditAdministrator: app.globalData.Administrator
            }
          }).then(res => {
            wx.showToast({
              icon: 'success',
              title: '删除成功',
            });
            // 删除成功后回到首页
            setTimeout(() => {
              wx.reLaunch({
                url: '/pages/index/index'
              });
            }, 1500);
          }).catch(err => {
            console.error(err);
            wx.showToast({
              icon: 'error',
              title: '删除失败',
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
const myaudio = wx.createInnerAudioContext({
  useWebAudioImplement: true
});


















