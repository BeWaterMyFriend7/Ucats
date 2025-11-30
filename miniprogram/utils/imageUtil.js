/**
 * 图片处理工具函数
 */

/**
 * 压缩图片到指定大小（单位：KB），保持原始比例
 * @param {string} src 图片路径（临时文件路径）
 * @param {number} targetKB 目标大小（例如200表示200KB）
 * @returns {Promise<string>} 返回压缩后图片路径
 */
function compressToTargetSize(src, targetKB = 200) {
  console.log('压缩图片到指定大小:', { src, targetKB });
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src,
      success: (info) => {
        console.log('获取图片信息成功:', info);
        // 先检查原始文件大小
        wx.getFileInfo({
          filePath: src,
          success: (fileInfo) => {
            const originalSizeKB = fileInfo.size / 1024;
            console.log('原始文件大小:', originalSizeKB, 'KB');
            
            // 如果原始文件已经小于目标大小，直接返回
            if (originalSizeKB <= targetKB) {
              console.log('文件已小于目标大小，无需压缩');
              resolve(src);
              return;
            }
            
            let quality = 0.9; // 初始质量
            let attempt = 0;
            const maxAttempts = 15; // 最大尝试次数

            function tryCompress() {
              console.log(`开始第${attempt + 1}次压缩尝试`);
              // 检查是否超过最大尝试次数
              if (attempt >= maxAttempts) {
                console.log('达到最大压缩尝试次数，返回原始文件');
                resolve(src); // 返回原始文件
                return;
              }

              // 计算目标尺寸，保持图片比例
              let maxWidth, maxHeight;
              if (targetKB <= 50) {
                // 小图片压缩
                maxWidth = 500;
                maxHeight = 500;
              } else if (targetKB <= 200) {
                // 普通图片压缩
                maxWidth = 800;
                maxHeight = 800;
              } else {
                // 大图片压缩
                maxWidth = 1024;
                maxHeight = 1024;
              }
              
              // 保持原始比例
              const ratio = Math.min(maxWidth / info.width, maxHeight / info.height, 1);
              const canvasWidth = info.width * ratio;
              const canvasHeight = info.height * ratio;

              // 确保尺寸有效
              if (canvasWidth <= 0 || canvasHeight <= 0) {
                console.log('无效的画布尺寸，返回原始文件');
                resolve(src);
                return;
              }

              console.log('画布尺寸:', canvasWidth, 'x', canvasHeight);
              
              // 使用传统的绘制方式确保图片正确绘制到画布上
              const ctx = wx.createCanvasContext('compressCanvas');
              ctx.drawImage(src, 0, 0, canvasWidth, canvasHeight);
              ctx.draw(false, () => {
                console.log('绘制完成，准备导出');
                wx.canvasToTempFilePath({
                  x: 0,
                  y: 0,
                  width: canvasWidth,
                  height: canvasHeight,
                  destWidth: canvasWidth,
                  destHeight: canvasHeight,
                  canvasId: 'compressCanvas',
                  fileType: 'jpg',
                  quality: quality,
                  success: (res) => {
                    console.log('导出画布成功:', res);
                    // 检查返回的临时文件路径是否有效
                    if (!res.tempFilePath) {
                      console.log('未生成有效文件路径，返回原始文件');
                      resolve(src);
                      return;
                    }
                    
                    const fs = wx.getFileSystemManager();
                    fs.getFileInfo({
                      filePath: res.tempFilePath,
                      success: (fInfo) => {
                        const sizeKB = fInfo.size / 1024;
                        console.log(`压缩尝试 ${attempt + 1}: ${sizeKB.toFixed(1)}KB (quality=${quality}, size=${canvasWidth}x${canvasHeight})`);

                        // 调整判断条件，允许一定的误差范围
                        if (sizeKB <= targetKB * 1.2 || quality <= 0.3) {
                          console.log('压缩完成，返回结果:', res.tempFilePath);
                          resolve(res.tempFilePath);
                        } else {
                          // 降低质量继续尝试，但不要降得太多
                          quality -= 0.05;
                          // 确保质量不会过低
                          quality = Math.max(0.3, quality);
                          attempt++;
                          setTimeout(tryCompress, 100); // 延迟一下再尝试
                        }
                      },
                      fail: (err) => {
                        console.error('获取文件信息失败:', err);
                        // 如果获取文件信息失败，返回原始文件
                        resolve(src);
                      }
                    });
                  },
                  fail: (err) => {
                    console.error('导出画布失败:', err);
                    // 如果导出画布失败，返回原始文件
                    resolve(src);
                  }
                });
              });
            }

            tryCompress();
          },
          fail: (err) => {
            console.error('获取原始文件信息失败:', err);
            // 如果获取原始文件信息失败，直接返回原始文件
            resolve(src);
          }
        });
      },
      fail: (err) => {
        console.error('获取图片信息失败:', err);
        // 如果获取图片信息失败，直接返回原始文件
        resolve(src);
      }
    });
  });
}

/**
 * 压缩头像图片到50KB，只保留圆形区域并保存为PNG格式
 * @param {string} src 图片路径
 * @param {number} cropX 裁剪区域左上角X坐标
 * @param {number} cropY 裁剪区域左上角Y坐标
 * @param {number} cropWidth 裁剪区域宽度
 * @param {number} cropHeight 裁剪区域高度
 * @returns {Promise<string>} 压缩后的图片路径
 */
function compressAvatarTo50KB(src, cropX = 0, cropY = 0, cropWidth = 0, cropHeight = 0) {
  console.log('开始压缩头像到50KB:', src);
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src,
      success: (info) => {
        console.log('获取头像图片信息成功:', info);
        
        // 如果没有提供裁剪信息，则使用默认值
        if (cropWidth === 0 || cropHeight === 0) {
          cropWidth = info.width;
          cropHeight = info.height;
        }
        
        // 计算圆形区域的参数
        const size = Math.min(cropWidth, cropHeight);
        const radius = size / 2;
        const centerX = cropX + cropWidth / 2;
        const centerY = cropY + cropHeight / 2;
        
        // 设置画布尺寸
        const canvasSize = 500; // 头像画布大小
        const scale = canvasSize / size;
        
        console.log('头像裁剪参数:', { cropX, cropY, cropWidth, cropHeight, size, radius, canvasSize });

        // 创建圆形裁剪
        const ctx = wx.createCanvasContext('compressCanvas');
        
        // 保存绘图上下文
        ctx.save();
        
        // 创建圆形路径
        ctx.beginPath();
        ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();
        
        // 绘制图片到圆形区域
        ctx.drawImage(
          src,
          centerX - radius, centerY - radius, size, size,  // 源区域（正方形区域中的最大圆形）
          0, 0, canvasSize, canvasSize  // 目标区域（整个画布）
        );
        
        // 恢复绘图上下文
        ctx.restore();
        
        ctx.draw(false, () => {
          console.log('头像绘制完成，准备导出');
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: canvasSize,
            height: canvasSize,
            destWidth: canvasSize,
            destHeight: canvasSize,
            canvasId: 'compressCanvas',
            fileType: 'png',  // 使用PNG格式
            quality: 1.0,     // PNG格式不需要质量参数
            success: (res) => {
              console.log('头像导出画布成功:', res);
              // 检查返回的临时文件路径是否有效
              if (!res.tempFilePath) {
                console.log('未生成有效文件路径，返回原始文件');
                resolve(src);
                return;
              }
              
              const fs = wx.getFileSystemManager();
              fs.getFileInfo({
                filePath: res.tempFilePath,
                success: (fInfo) => {
                  const sizeKB = fInfo.size / 1024;
                  console.log(`头像压缩结果: ${sizeKB.toFixed(1)}KB (size=${canvasSize}x${canvasSize})`);

                  // 如果PNG格式的文件太大，再进行一次压缩
                  if (sizeKB > 50) {
                    console.log('PNG文件过大，进行二次压缩');
                    // 使用JPG格式重新压缩
                    wx.canvasToTempFilePath({
                      x: 0,
                      y: 0,
                      width: canvasSize,
                      height: canvasSize,
                      destWidth: canvasSize,
                      destHeight: canvasSize,
                      canvasId: 'compressCanvas',
                      fileType: 'jpg',
                      quality: 0.8,
                      success: (res2) => {
                        console.log('JPG格式头像导出成功:', res2);
                        resolve(res2.tempFilePath);
                      },
                      fail: (err) => {
                        console.error('JPG格式头像导出失败:', err);
                        resolve(res.tempFilePath); // 返回PNG格式
                      }
                    });
                  } else {
                    resolve(res.tempFilePath);
                  }
                },
                fail: (err) => {
                  console.error('获取头像文件信息失败:', err);
                  resolve(src);
                }
              });
            },
            fail: (err) => {
              console.error('头像导出画布失败:', err);
              resolve(src);
            }
          });
        });
      },
      fail: (err) => {
        console.error('获取头像图片信息失败:', err);
        resolve(src);
      }
    });
  });
}

module.exports = {
  compressToTargetSize: compressToTargetSize,
  compressAvatarTo50KB: compressAvatarTo50KB
}