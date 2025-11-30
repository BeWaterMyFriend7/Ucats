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
    showCropper: false,
    // 猫咪关系相关数据
    relatedCatsList: []
  },

  onLoad: function (options) {
    // 加载相关猫咪数据用于回显
    this.loadRelatedCats();
  },

  // 加载相关猫咪数据
  loadRelatedCats: function() {
    // 在添加页面，初始时relatedCatsList为空数组，不需要加载
    // 这个方法是为了保持与editCat页面的兼容性
    console.log('addCat loadRelatedCats called, current relatedCatsList:', this.data.relatedCatsList);
  },

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
    const imageUrl = this.data.imageList[index].url;
    
    this.setData({
      firstImageUrl: imageUrl
    });
    
    wx.showToast({
      title: '首图设置成功',
      icon: 'success'
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
          this.setData({
            imageList: imageList
          });
          
          // 如果删除的是首图，清空首图
          if (this.data.firstImageUrl === this.data.imageList[index].url) {
            this.setData({
              firstImageUrl: ''
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

  // 处理猫咪选择
  onCatSelected: function(e) {
    console.log('addCat onCatSelected called with:', e.detail);
    const selectedCats = e.detail.cats;
    const catIds = selectedCats.map(cat => cat._id);
    console.log('setting relatedCatsList to:', selectedCats);
    console.log('setting cat.relatedCats to:', catIds);
    this.setData({ 
      relatedCatsList: selectedCats, // 存储完整的猫咪对象用于回显
      ['cat.relatedCats']: catIds     // 存储ID用于提交
    });
  },

  // 上传文件到服务器
  uploadFiles: function() {
    return new Promise((resolve, reject) => {
      const uploadPromises = [];
      const fileKeys = {};
      
      // 强制上传所有头像到腾讯云COS
      if (this.data.avatarUrl) {
        uploadPromises.push(
          this.uploadToTencentCOS(this.data.avatarUrl, 'avatar')
            .then(url => {
              fileKeys.avatarUrl = url;
            })
        );
      }
      
      // 强制上传所有首图到腾讯云COS
      if (this.data.firstImageUrl) {
        uploadPromises.push(
          this.uploadToTencentCOS(this.data.firstImageUrl, 'firstImage')
            .then(url => {
              fileKeys.firstImageUrl = url;
            })
        );
      }
      
      // 强制上传所有图片到腾讯云COS
      this.data.imageList.forEach((image, index) => {
        uploadPromises.push(
          this.uploadToTencentCOS(image.url, 'image')
            .then(url => {
              if (!fileKeys.imageUrlList) fileKeys.imageUrlList = [];
              fileKeys.imageUrlList.push(url);
            })
        );
      });
      
      // 强制上传所有视频到腾讯云COS
      this.data.videoList.forEach((video, index) => {
        uploadPromises.push(
          this.uploadToTencentCOS(video.url, 'video')
            .then(url => {
              if (!fileKeys.videoUrlList) fileKeys.videoUrlList = [];
              fileKeys.videoUrlList.push(url);
            })
        );
      });
      
      // 强制上传所有音频到腾讯云COS
      this.data.audioList.forEach((audio, index) => {
        uploadPromises.push(
          this.uploadToTencentCOS(audio.url, 'audio')
            .then(url => {
              if (!fileKeys.audioUrlList) fileKeys.audioUrlList = [];
              fileKeys.audioUrlList.push(url);
            })
        );
      });
      
      // 等待所有文件上传完成
      Promise.all(uploadPromises)
        .then(() => {
          console.log('所有文件上传完成:', fileKeys);
          resolve(fileKeys);
        })
        .catch(reject);
    });
  },

  // 上传文件到腾讯云COS
  uploadToTencentCOS: function(filePath, fileType) {

    // 使用腾讯云 COS 客户端上传（选项 A：客户端使用后端签名）
    return new Promise((resolve, reject) => {
      const cosImagePath = app.globalData.cosImagePath;
      const fileExtension = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
      
      // 获取猫咪名称，如果没有则使用默认名称
      const catName = (this.data.cat && this.data.cat.name) ? this.data.cat.name.trim() : 'unknown_cat';
      
      // 生成随机码
      const randomCode = Math.random().toString(36).substring(2, 8);
      
      // 使用新的命名格式：猫咪名称_<类型>_<随机码>
      const newFileName = `${cosImagePath}/${catName}_${fileType}_${randomCode}${fileExtension}`;

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

  upload() {
    // 第一步：校验必填项信息
    const name = (this.data.cat && this.data.cat.name) ? this.data.cat.name.trim() : '';
    const avatar = this.data.avatarUrl;
    const firstImage = this.data.firstImageUrl;

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

    // 二次确认
    wx.showModal({
      title: '确认',
      content: '确定添加猫吗？',
      success: (res) => {
        if (!res.confirm) return;

        wx.showLoading({ title: '上传文件中...', mask: true });

        // 第二步：上传多媒体文件到腾讯云
        this.uploadFiles()
          .then(fileKeys => {
              console.log("文件上传完成");
              
              // 第三步：验证上传结果，确保没有临时路径
              const validateResult = this.validateUploadResult(fileKeys);
              if (!validateResult.valid) {
                throw new Error(validateResult.error);
              }

              wx.showLoading({ title: '更新数据库中...', mask: true });
              
              // 处理首图和图片列表
              const firstImageUrl = fileKeys.firstImageUrl || '';
              const imageUrls = fileKeys.imageUrlList || [];
              
              // 第四步：将相关信息上传至阿里云数据库
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
                lastEditTime: new Date(),
                lastEditAdministrator: app.globalData.Administrator || '',
                // 头像独立存储
                avatarUrl: fileKeys.avatarUrl || '',
                // 首图（背景图）
                firstImageUrl: firstImageUrl,
                // 图片列表
                imageUrlList: imageUrls,
                // 视频和音频列表
                videoUrlList: fileKeys.videoUrlList || [],
                audioUrlList: fileKeys.audioUrlList || [],
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
            
            // 第五步：如果此时图片路径中包含临时路径，提示用户重试
            if (err.message && err.message.includes('临时路径')) {
              wx.showModal({
                title: '上传失败',
                content: err.message + '请检查文件后重试。',
                showCancel: false
              });
            } else {
              wx.showToast({ 
                title: err.message || '提交失败，请重试', 
                icon: 'none' 
              });
            }
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






















