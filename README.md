> 左键暂停播放，中键下载视频，右键保存图片

采集摄像头（麦克风）数据，通过 ffmpeg 转化为 rtsp 流，然后 easyDarwin 将其推送，rtsp 服务器拉流并与 client 建立 websocket，实时发送拉流数据。

##### 1. 启动 rtsp 拉流服务器

```node rtsp-video-node/app.js```

##### 2. 启动 easyDarwin

进入 ```https://github.com/EasyDarwin/EasyDarwin```，下载安装执行。

##### 3. 启动推流

> ffmpeg -list_devices true -f dshow -i dummy 获取摄像头和麦克风。

```
ffmpeg -f dshow -i video="你的摄像头" -vcodec libx264 -acodec copy -preset:v ultrafast -tune:v zerolatency -s 160x120 -r 12 -f rtsp rtsp://localhost/test
```

采集摄像头数据并转化为 rtsp 流。

（可以设定分辨率-s 160x120，-r设定帧率，-bufsize设定输出缓冲区大小）

更多的 ffmpeg 用法详见官网。

##### 4. 修改 client/src/App.vue 配置

1. 修改 ```serverUrl``` 地址为你运行 rtsp 拉流服务器的地址。
2. 修改 ```rtspData.url```为你 rtsp 推流地址。（上面为 rtsp://localhost/test）

##### 5. 播放

vue 构建 ```npm run serve```。

---

上面是实时数据，可以选择推流本地视频：

循环推流：

```
ffmpeg -stream_loop -1 -re -i 1.mp4 -rtsp_transport tcp -vcodec h264 -f rtsp rtsp://localhost/test
```

---

上面是自己创建，

可以直接打开 dist/index.html，输入如下数据

<img src="https://i0.hdslb.com/bfs/album/72304b621eb04fda85a4d6a55eb5c98b728ca760.jpg">
