# 视频压缩第二版
import os
import platform
import threading
 
 
class Compress_Pic_or_Video(object):
    def __init__(self, in_folder, filename,out_folder):
        # outName = "new_" + inputName
        self.infilePath = in_folder  # 文件地址
        self.outfilePath = out_folder
        self.inputName = filename  # 输入的文件名字
        self.outName = filename  # 输出的文件名字
        self.system_ = platform.platform().split("-", 1)[0]
        if self.system_ == "Windows":
            self.infilePath = (self.infilePath + "\\") if self.infilePath.rsplit("\\", 1)[-1] else self.infilePath
            self.outfilePath = (self.outfilePath + "\\") if self.outfilePath.rsplit("\\",1)[-1] else self.outfilePath  
        elif self.system_ == "Linux":
            self.filePath = (self.filePath + "/") if self.filePath.rsplit("/", 1)[-1] else self.filePath
        self.fileInputPath = self.infilePath + self.inputName
        self.fileOutPath = self.outfilePath + self.outName
 
    @property
    def is_video(self):
        videoSuffixSet = {"WMV", "ASF", "ASX", "RM", "RMVB", "MP4", "3GP", "MOV", "M4V", "AVI", "DAT", "MKV", "FIV",
                          "VOB"}
        suffix = self.fileInputPath.rsplit(".", 1)[-1].upper()
        if suffix in videoSuffixSet:
            return True
        else:
            return False
 
    def SaveVideo(self):
        fpsize = os.path.getsize(self.fileInputPath) / 1024
        if fpsize >= 150.0:  # 大于150KB的视频需要压缩
            if self.outName:
                compress = "ffmpeg -i {} -r 10 -pix_fmt yuv420p -vcodec libx264 -preset veryslow -profile:v baseline  -crf 23 -acodec aac -b:a 32k -strict -5 {}".format(
                    self.fileInputPath, self.fileOutPath)
                isRun = os.system(compress)
            else:
                compress = "ffmpeg -i {} -r 10 -pix_fmt yuv420p -vcodec libx264 -preset veryslow -profile:v baseline  -crf 23 -acodec aac -b:a 32k -strict -5 {}".format(
                    self.fileInputPath, self.fileInputPath)
                isRun = os.system(compress)
            if isRun != 0:
                return (isRun, "没有安装ffmpeg")
            return True
        else:
            return True
 
    def Compress_Video(self):
        # 异步保存打开下面的代码，注释同步保存的代码
        thr = threading.Thread(target=self.SaveVideo)
        thr.start()
        # 下面为同步代码
        # fpsize = os.path.getsize(self.fileInputPath) / 1024
        # if fpsize >= 150.0:  # 大于150KB的视频需要压缩
        #     compress = "ffmpeg -i {} -r 10 -pix_fmt yuv420p -vcodec libx264 -preset veryslow -profile:v baseline  -crf 23 -acodec aac -b:a 32k -strict -5 {}".format(
        #         self.fileInputPath, self.fileOutPath)
        #     isRun = os.system(compress)
        #     if isRun != 0:
        #         return (isRun, "没有安装ffmpeg")
        #     return True
        # else:
        #     return True

def is_video(file):
    videoSuffixSet = {"WMV", "ASF", "ASX", "RM", "RMVB", "MP4", "3GP", "MOV", "M4V", "AVI", "DAT", "MKV", "FIV",
                    "VOB"}
    suffix = file.rsplit(".", 1)[-1].upper()
    if suffix in videoSuffixSet:
        return True
    else:
        return False

def get_listdir(path):  #获取目录下所有jpg格式文件的地址，返回地址list
    tmp_list = []
    for file in os.listdir(path): 
        if(is_video(file)):
            # file_path = os.path.join(path, file)  
            # tmp_list.append(file_path)
            tmp_list.append(file)

    return tmp_list

 
 
if __name__ == "__main__":
    # b = sys.argv[1:]  # 测试压缩
    input_file_folder = "input"
    output_file_folder = "out_put_files"
    video_files = get_listdir(input_file_folder)
    for v in video_files:
        savevideo = Compress_Pic_or_Video(in_folder = input_file_folder, filename = v, out_folder = output_file_folder)
        print(savevideo.Compress_Video())
 
# 这一版性能优良  压缩 从61M 到 11M 视频看起来没有太大损伤  缺点：inteli7 8G运存 耗时20s
 