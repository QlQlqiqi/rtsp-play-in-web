// express资源
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
// jsmpeg moment child_process脚本所需
const Stream = require("node-rtsp-stream-jsmpeg");
const moment = require("moment");
const callfile = require("child_process");
moment.locale("zh-cn");

// 静态服务器
app.listen(8088, () => {
  console.log(`App listening at port 8088`);
});
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// 设置允许跨域访问该服务.
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

// 服务器 IP ，默认本地
const IP = "localhost";
// 超时时间，一定时间没有接收到客户端心跳包，则认为已结束
const timeout = 5 * 1000;
// 当前正在播放的视频数据
const playList = {};
// 当前正在播放的视频流
const playStream = {};
// 返回状态码
const success = 0;
const error = 1;

// 每次请求都会重新加载
app.post("/startRtspVideo", function (req, res) {
  let data = JSON.parse(req.body.urls);

  const { url, port } = data;

  // 无效参数
  if (!port || !url) {
    res.send({ result: error });
    return;
  }

  // 已存在
  // if (playList[port] && playList[port].url == url) {
  //   playList[port].date = new Date().getTime();
  //   res.send({ result: success, ws: "ws://" + IP + ":" + port });
  //   return;
  // }
  // 如果该 websocket 已存在，则关闭

  playStream[port] &&
    typeof playStream[port].stop == "function" &&
    playStream[port].stop();

  playList[port] = data;
  playList[port].date = new Date().getTime();

  // 建立流
  playStream[port] = new Stream({ url, wsPort: port });
  playStream[port].date = new Date().getTime();
  playStream[port].start();
  res.send({ result: success, ws: "ws://" + IP + ":" + port });
});

app.post("/heartBeats", function (req, res) {
  let data = JSON.parse(req.body.urls);
  const { url, port } = data;

  // 无效参数
  if (!port || !url) {
    res.send({ result: error });
    return;
  }
  if(playList[port])
  // 重置时间
  if (playList[port] && playList[port].url == url) {
    playList[port].date = new Date().getTime();
    res.send({ result: success, ws: "ws://" + IP + ":" + port });
    return;
  }
});

// 定期清理那些超时客户端
setInterval(() => {
  const date = new Date().getTime();
  for (let key in playList) {
    if (date - playList[key].date > timeout) {
      delete playList[key];
      playStream[key] &&
        typeof playStream[key].stop == "function" &&
        playStream[key].stop();
    }
  }
}, 500);
