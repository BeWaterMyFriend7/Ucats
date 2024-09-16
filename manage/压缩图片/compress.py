#!/usr/bin/env python
# -*- coding:utf-8 -*-
# 压缩图片脚本
from PIL import Image, ExifTags
from pathlib import Path
import os
from pathlib import Path
import sys
from PIL import Image, ImageOps, ImageDraw

def get_file_size(fileName):
    size = os.path.getsize(fileName)
    return size / 1024


def compress_file_jpg(fileName):
    sizeMax = 700  # 大图长边的像素数
    inputPath = Path('input/')
    outPath = Path('out_put_files/')
    im = Image.open(inputPath / fileName)

    try:
        for orientation in ExifTags.TAGS.keys():
            if ExifTags.TAGS[orientation] == 'Orientation':
                break
        exif = dict(im._getexif().items())
        if exif[orientation] == 3:
            im = im.rotate(180, expand=True)
        elif exif[orientation] == 6:
            im = im.rotate(270, expand=True)
        elif exif[orientation] == 8:
            im = im.rotate(90, expand=True)
    except:
        pass

    im = im.convert('RGB')
    im.save(outPath / fileName)

    x, y = im.size
    if x < sizeMax and y < sizeMax:
        # 原图尺寸足够小
        im.save(outPath / fileName)
    else:
        if x > y:
            x_resize = sizeMax
            y_resize = int(y/x*sizeMax)
            out = im.resize((x_resize, y_resize))
        else:
            y_resize = sizeMax
            x_resize = int(x/y*sizeMax)
            out = im.resize((x_resize, y_resize))
        out.save(outPath / fileName)
    iterateNum = 3
    while(get_file_size(outPath / fileName) > 100):
        # print(get_file_size(outPath / fileName))
        if(iterateNum == 0):
            break
        im = Image.open(outPath / fileName)
        im.save(outPath / fileName, quality=70)
        iterateNum = iterateNum - 1


def compress_file_png(fileName):
    sizeMax = 150  # 头像长边的像素数
    inputPath = Path('input/')
    outPath = Path('out_put_files/')
    im = Image.open(inputPath / fileName)
    x, y = im.size
    if x < sizeMax and y < sizeMax:
        # 原图尺寸足够小
        im.save(outPath / fileName)
    else:
        if x > y:
            x_resize = sizeMax
            y_resize = int(y/x*sizeMax)
            out = im.resize((x_resize, y_resize))
        else:
            y_resize = sizeMax
            x_resize = int(x/y*sizeMax)
            out = im.resize((x_resize, y_resize))
        out.save(outPath / fileName)
    iterateNum = 3
    while(get_file_size(outPath / fileName) > 40):
        # print(get_file_size(outPath / fileName))
        if(iterateNum == 0):
            break
        im = Image.open(outPath / fileName)
        im.save(outPath / fileName, quality=60)
        iterateNum = iterateNum - 1



def crop_center(image, size):
    """裁剪图片的中心部分为正方形"""
    width, height = image.size
    new_width = new_height = min(width, height)  # 正方形的尺寸

    left = (width - new_width) // 2
    top = (height - new_height) // 2
    right = (width + new_width) // 2
    bottom = (height + new_height) // 2

    return image.crop((left, top, right, bottom))

def crop_circle(image):
    """将图片裁剪为圆形"""
    np_image = Image.new("RGBA", (image.size[0], image.size[1]))  # 创建透明背景
    mask = Image.new("L", (image.size[0], image.size[1]), 0)  # 创建黑白蒙版
    draw = ImageDraw.Draw(mask)
    
    draw.ellipse((0, 0) + image.size, fill=255)  # 在蒙版上画一个圆
    np_image.paste(image, (0, 0), mask=mask)  # 将蒙版应用于图片

    return np_image

def crop_file_png(filename):
    # 打开图片
    image = Image.open(inputPath / fileName)

    # 裁剪出图片中心的正方形部分
    cropped_square = crop_center(image, min(image.size))

    # 将正方形部分裁剪为圆形
    circular_image = crop_circle(cropped_square)

    # 保存结果
    circular_image.save(inputPath / fileName)


if __name__ == '__main__':
    if not os.path.exists('out_put_files'):
        os.makedirs('out_put_files')
    inputPath = Path('input/')
    for fileName in os.listdir(inputPath):
        # 排除隐藏文件
        if fileName[0] == '.':
            continue
        fileType = fileName.split('.')
        if fileType[1] == 'jpg':
            compress_file_jpg(fileName)
        if fileType[1] == 'png':
            crop_file_png(fileName)
            compress_file_png(fileName)
