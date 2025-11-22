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
    newImageList: [], // 新增的图片列表
    newVideoList: [], // 新增的视频列表
    newAudioList: [], // 新增的音频列表
    newFirstImageUrl: '', // 新选择的首图URL
    removeFirstImage: false, // 是否删除首图标记
    removedImageUrls: [], // 被删除的图片URL列表
    
    // 裁剪器相关数据
    showCropper: false
  },

  onLoad: function (options) {
    _id = options._id;
    app.mpServerless.db.collection('ucats').find({
      _id: _id,
    }, {}).then(res => {
      // console.log(res)
      this.setData({
        cat: res.result[0],
        classification: res.result[0].classification,
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
  chooseAvatar: function() {
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
      });
  },

  // 关闭裁剪器
  hideCropper() {
    this.setData({ showCropper: false })
  },

  // 选择图片
  chooseImage: function() {
    const currentCount = (this.data.cat.firstImageUrl ? 1 : 0) + (this.data.cat.imageUrlList ? this.data.cat.imageUrlList.length : 0) + this.data.newImageList.length;
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
              
              // 根据图片大小选择不同的处理策略，统一使用compressToTargetSize函数
              let targetSize;
              if (fileSize > 1000) {
                // 大图片压缩到150KB
                targetSize = 150;
              } else if (fileSize > 500) {
                // 中等图片压缩到200KB
                targetSize = 200;
              } else {
                // 小图片压缩到250KB
                targetSize = 250;
              }
              
              // 使用compressToTargetSize函数进行压缩
              imageUtil.compressToTargetSize(filePath, targetSize)
                .then(compressedPath => {
                  newImages.push({
                    url: compressedPath,
                    isCover: false // 默认不设为首图
                  });
                  
                  // 如果所有图片都处理完成，更新数据
                  if (newImages.length === tempFilePaths.length) {
                    this.setData({
                      newImageList: [...this.data.newImageList, ...newImages]
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
    const currentCount = (this.data.cat.videoUrlList ? this.data.cat.videoUrlList.length : 0) + this.data.newVideoList.length;
    if (currentCount >= 2) {
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
              newVideoList: [...this.data.newVideoList, {
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
    const currentCount = (this.data.cat.audioUrlList ? this.data.cat.audioUrlList.length : 0) + this.data.newAudioList.length;
    if (currentCount >= 3) {
      wx.showToast({
        title: '最多只能上传3个音频',
        icon: 'none'
      });
      return;
    }
    
    wx.chooseMessageFile({
      count: 3 - currentCount,
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
            newAudioList: [...this.data.newAudioList, ...newAudios]
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

  // 选择首图
  chooseCoverImage: function() {
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
                // 新首图存储在临时数据中，上传时再更新到数据库
                this.setData({ 
                  newFirstImageUrl: compressedPath 
                });
                
                // 立即更新预览显示
                const cat = this.data.cat;
                cat.firstImageUrl = compressedPath;
                this.setData({ cat: cat });
                
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
  removeCoverImage: function() {
    wx.showModal({
      title: '提示',
      content: '确定删除首图吗？',
      success: (res) => {
        if (res.confirm) {
          // 标记删除首图
          this.setData({ 
            removeFirstImage: true,
            newFirstImageUrl: '' 
          });
          
          // 立即更新预览显示
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

  // 将现有图片设为首图
  setAsCoverImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const cat = this.data.cat;
    
    if (cat.imageUrlList && cat.imageUrlList[index]) {
      // 将选中的图片设为首图
      cat.firstImageUrl = cat.imageUrlList[index];
      // 从图片列表中移除该图片
      cat.imageUrlList = cat.imageUrlList.filter((_, i) => i !== index);
      this.setData({ cat: cat });
      wx.showToast({
        title: '已设为首图',
        icon: 'success'
      });
    }
  },

  // 将新上传图片设为首图
  setNewAsCoverImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const cat = this.data.cat;
    const newImageList = this.data.newImageList;
    
    if (newImageList[index]) {
      // 将选中的图片设为首图
      cat.firstImageUrl = newImageList[index].url;
      // 从新图片列表中移除该图片
      this.data.newImageList = newImageList.filter((_, i) => i !== index);
      this.setData({ 
        cat: cat,
        newImageList: this.data.newImageList
      });
      wx.showToast({
        title: '已设为首图',
        icon: 'success'
      });
    }
  },

  // 删除新上传的图片
  removeNewImage: function(e) {
    const index = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张新上传的图片吗？',
      success: (res) => {
        if (res.confirm) {
          const newImageList = this.data.newImageList.filter((_, i) => i !== index);
          this.setData({
            newImageList: newImageList
          });
        }
      }
    });
  },

  // 删除现有图片
  removeExistingImage: function(e) {
    const index = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张现有图片吗？删除后需要保存才能生效。',
      success: (res) => {
        if (res.confirm) {
          const cat = this.data.cat;
          if (cat.imageUrlList && cat.imageUrlList[index]) {
            // 记录被删除的图片URL
            const removedImageUrl = cat.imageUrlList[index];
            const removedImageUrls = [...this.data.removedImageUrls, removedImageUrl];
            
            // 从显示列表中移除
            cat.imageUrlList = cat.imageUrlList.filter((_, i) => i !== index);
            this.setData({
              cat: cat,
              removedImageUrls: removedImageUrls
            });
          }
        }
      }
    });
  },

  // 删除新上传的视频
  removeNewVideo: function(e) {
    const index = e.currentTarget.dataset.index;
    const newVideoList = this.data.newVideoList.filter((_, i) => i !== index);
    this.setData({
      newVideoList: newVideoList
    });
  },

  // 删除现有视频
  removeExistingVideo: function(e) {
    const index = e.currentTarget.dataset.index;
    const cat = this.data.cat;
    if (cat.videoUrlList) {
      cat.videoUrlList = cat.videoUrlList.filter((_, i) => i !== index);
      this.setData({
        cat: cat
      });
    }
  },

  // 删除新上传的音频
  removeNewAudio: function(e) {
    const index = e.currentTarget.dataset.index;
    const newAudioList = this.data.newAudioList.filter((_, i) => i !== index);
    this.setData({
      newAudioList: newAudioList
    });
  },

  // 删除现有音频
  removeExistingAudio: function(e) {
    const index = e.currentTarget.dataset.index;
    const cat = this.data.cat;
    if (cat.audioUrlList) {
      cat.audioUrlList = cat.audioUrlList.filter((_, i) => i !== index);
      this.setData({
        cat: cat
      });
    }
  },

  // 预览图片
  previewImage: function(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: [url]
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

  // 上传新文件到服务器
  uploadNewFiles: function() {
    return new Promise((resolve, reject) => {
      const uploadPromises = [];
      const fileKeys = {};
      
      // 上传新头像到腾讯云COS
      if (this.data.avatarUrl) {
        uploadPromises.push(
          this.uploadToTencentCOS(this.data.avatarUrl, 'avatar')
            .then(url => {
              fileKeys.avatar = url;
            })
        );
      }
      
      // 上传新首图到腾讯云COS
      if (this.data.newFirstImageUrl) {
        uploadPromises.push(
          this.uploadToTencentCOS(this.data.newFirstImageUrl, 'firstImage')
            .then(url => {
              fileKeys.firstImage = url;
            })
        );
      }
      
      // 上传新图片到腾讯云COS
      this.data.newImageList.forEach((image, index) => {
        uploadPromises.push(
          this.uploadToTencentCOS(image.url, `image_${index}`)
            .then(url => {
              if (!fileKeys.newImages) fileKeys.newImages = [];
              fileKeys.newImages.push(url);
            })
        );
      });
      
      // 上传新视频到腾讯云COS
      this.data.newVideoList.forEach((video, index) => {
        uploadPromises.push(
          this.uploadToTencentCOS(video.url, `video_${index}`)
            .then(url => {
              if (!fileKeys.newVideos) fileKeys.newVideos = [];
              fileKeys.newVideos.push(url);
            })
        );
      });
      
      // 上传新音频到腾讯云COS
      this.data.newAudioList.forEach((audio, index) => {
        uploadPromises.push(
          this.uploadToTencentCOS(audio.url, `audio_${index}`)
            .then(url => {
              if (!fileKeys.newAudios) fileKeys.newAudios = [];
              fileKeys.newAudios.push(url);
            })
        );
      });
      
      // 等待所有文件上传完成
      Promise.all(uploadPromises)
        .then(() => resolve(fileKeys))
        .catch(reject);
    });
  },

  // 上传文件到阿里云OSS
  uploadToTencentCOS: function(filePath, fileName) {
    return new Promise((resolve, reject) => {
      // 使用阿里云MPServerless的文件上传功能
      const fileExtension = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
      const newFileName = `${fileName}_${Date.now()}${fileExtension}`;
      
      app.mpServerless.file.uploadFile({
        filePath: filePath,
        fileName: newFileName,
        extension: fileExtension
      }).then(res => {
        // 上传成功后，返回文件访问URL
        resolve(res.fileUrl);
      }).catch(err => {
        console.error('上传文件失败', err);
        reject(err);
      });
    });
  },

  upload() {
    wx.showModal({
      title: '提示',
      content: '确定提交吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '更新中...',
          });
          
          // 先上传新文件
          this.uploadNewFiles()
            .then(fileKeys => {
              // 处理首图和图片列表
              let firstImageUrl = '';
              let imageUrls = [...(this.data.cat.imageUrlList || [])];
              const videoUrls = [...(this.data.cat.videoUrlList || [])];
              const audioUrls = [...(this.data.cat.audioUrlList || [])];
              
              // 处理首图：优先使用新上传的，否则检查是否删除了原首图
              if (fileKeys.firstImage) {
                firstImageUrl = fileKeys.firstImage;
              } else if (!this.data.removeFirstImage && this.data.cat.firstImageUrl) {
                firstImageUrl = this.data.cat.firstImageUrl;
              }
              
              // 移除被删除的图片
              if (this.data.removedImageUrls.length > 0) {
                imageUrls = imageUrls.filter(url => !this.data.removedImageUrls.includes(url));
              }
              
              // 处理新上传的图片
              if (fileKeys.newImages && fileKeys.newImages.length > 0) {
                imageUrls.push(...fileKeys.newImages);
              }
              
              // 添加新上传的视频和音频
              if (fileKeys.newVideos) {
                videoUrls.push(...fileKeys.newVideos);
              }
              if (fileKeys.newAudios) {
                audioUrls.push(...fileKeys.newAudios);
              }
              
              // 更新猫咪信息
              return app.mpServerless.db.collection('ucats').updateMany({
                _id: this.data.cat._id
              }, {
                $set: {
                  addPhotoNumber: imageUrls.length + (firstImageUrl ? 1 : 0),
                  audioNumber: audioUrls.length,
                  movieNums: videoUrls.length,
                  isAdoption: this.data.cat.isAdoption,
                  nickName: this.data.cat.nickName,
                  furColor: this.data.cat.furColor,
                  classification: this.data.cat.classification,
                  gender: this.data.cat.gender,
                  status: this.data.cat.status,
                  isSterilization: this.data.cat.isSterilization,
                  sterilizationTime: this.data.cat.sterilizationTime,
                  character: this.data.cat.character,
                  firstSightingTime: this.data.cat.firstSightingTime,
                  firstSightingLocation: this.data.cat.firstSightingLocation,
                  appearance: this.data.cat.appearance,
                  missingTime: this.data.cat.missingTime,
                  relationship: this.data.cat.relationship,
                  deliveryTime: this.data.cat.deliveryTime,
                  deathTime: this.data.cat.deathTime,
                  moreInformation: this.data.cat.moreInformation,
                  notes: this.data.cat.notes,
                  deathReason: this.data.cat.deathReason,
                  location: this.data.cat.location,
                  birthTime: this.data.cat.birthTime,
                  relatedCats: this.data.cat.relatedCats,
                  lastEditTime: Date(),
                  lastEditAdministrator: app.globalData.Administrator,
                  // 更新文件链接（腾讯云COS的URL）
                  avatarUrl: fileKeys.avatar || this.data.cat.avatarUrl || '',
                  firstImageUrl: firstImageUrl,
                  imageUrlList: imageUrls,
                  videoUrlList: videoUrls,
                  audioUrlList: audioUrls,
                  // 保持软删除标记
                  isDeleted: this.data.cat.isDeleted !== undefined ? this.data.cat.isDeleted : false
                }
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


















