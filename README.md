采集摄像头（麦克风）数据，通过 ffmpeg 转化为 rtsp 流，然后 easyDarwin 将其推送，rtsp 服务器拉流并与 client 建立 websocket，实时发送拉流数据。

##### 1. 启动 rtsp 拉流服务器

1. ```cd rtsp-video-node```
2. ```npm i```
3. ```node app.js```

##### 2. 启动 easyDarwin

1. 进入 ```https://github.com/EasyDarwin/EasyDarwin```，下载安装执行。

##### 3. 启动推流

1. ```ffmpeg -list_devices true -f dshow -i dummy``` 获取摄像头和麦克风。

2. ```
   ffmpeg -f dshow -i video="你的摄像头" -vcodec libx264 -acodec copy -preset:v ultrafast -tune:v zerolatency -s 160x120 -r 12 -f rtsp rtsp://localhost/test
   ```

采集摄像头数据并转化为 rtsp 流。

（可以设定分辨率-s 160x120，-r设定帧率，-bufsize设定输出缓冲区大小）

更多的 ffmpeg 用法详见官网。

##### 4. 修改 rtsp-video-canvas/js/index.js 配置

1. 修改 ```serverUrl``` 地址为你运行 rtsp 拉流服务器的地址。
2. 修改 ```rtspData.url```为你 rtsp 推流地址。（上面为 rtsp://localhost/test）

##### 5. 播放

在浏览器上打开 ```rtsp-video-canvas/index.html```。

---

上面是实时数据，可以选择推流本地视频：

循环推流：

```
ffmpeg -stream_loop -1 -re -i 1.mp4 -rtsp_transport tcp -vcodec h264 -f rtsp rtsp://localhost/test
```

