/**
 * 图片处理工具函数
 */

/**
 * 压缩图片
 * @param {string} src 图片路径
 * @param {number} quality 压缩质量 0-100
 * @param {number} maxWidth 最大宽度
 * @param {number} maxHeight 最大高度
 * @returns {Promise<string>} 压缩后的图片路径
 */
function compressImage(src, quality = 80, maxWidth = 1024, maxHeight = 1024) {
  return new Promise((resolve, reject) => {
    // 获取图片信息
    wx.getImageInfo({
      src: src,
      success: (info) => {
        // 计算缩放比例
        const ratio = Math.min(maxWidth / info.width, maxHeight / info.height, 1);
        const width = info.width * ratio;
        const height = info.height * ratio;
        
        // 创建画布
        const ctx = wx.createCanvasContext('compressCanvas', this);
        ctx.drawImage(src, 0, 0, width, height);
        ctx.draw(false, () => {
          // 导出图片
          wx.canvasToTempFilePath({
            canvasId: 'compressCanvas',
            quality: quality / 100,
            success: (res) => {
              resolve(res.tempFilePath);
            },
            fail: reject
          }, this);
        });
      },
      fail: reject
    });
  });
}

/**
 * 压缩图片到指定大小
 * @param {string} src 图片路径
 * @param {number} maxSize 最大大小（KB）
 * @returns {Promise<string>} 压缩后的图片路径
 */
function compressImageToSize(src, maxSize) {
  return new Promise((resolve, reject) => {
    // 先获取文件大小
    wx.getFileInfo({
      filePath: src,
      success: (info) => {
        const fileSize = info.size / 1024; // 转换为KB
        if (fileSize <= maxSize) {
          resolve(src); // 如果已经小于目标大小，直接返回
          return;
        }
        
        // 计算压缩比例
        const quality = Math.max(30, Math.floor((maxSize / fileSize) * 100));
        
        // 递归压缩直到满足大小要求
        compressImage(src, quality).then(compressedSrc => {
          wx.getFileInfo({
            filePath: compressedSrc,
            success: (compressedInfo) => {
              const compressedFileSize = compressedInfo.size / 1024;
              if (compressedFileSize <= maxSize || quality <= 30) {
                resolve(compressedSrc);
              } else {
                // 如果还是太大，继续压缩
                compressImageToSize(compressedSrc, maxSize).then(resolve).catch(reject);
              }
            },
            fail: reject
          });
        }).catch(reject);
      },
      fail: reject
    });
  });
}

/**
 * 裁剪头像为圆形
 * @param {string} src 图片路径
 * @param {number} size 裁剪尺寸
 * @returns {Promise<string>} 裁剪后的图片路径
 */
function cropAvatar(src, size = 200) {
  return new Promise((resolve, reject) => {
    const ctx = wx.createCanvasContext('avatarCanvas', this);
    
    // 画一个圆形裁剪区域
    ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
    ctx.clip();
    
    // 绘制图片
    ctx.drawImage(src, 0, 0, size, size);
    ctx.draw(false, () => {
      // 导出图片
      wx.canvasToTempFilePath({
        canvasId: 'avatarCanvas',
        success: (res) => {
          resolve(res.tempFilePath);
        },
        fail: reject
      }, this);
    });
  });
}

module.exports = {
  compressImage: compressImage,
  compressImageToSize: compressImageToSize,
  cropAvatar: cropAvatar
}