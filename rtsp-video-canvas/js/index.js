// 返回状态码
const success = 0;
const error = 1;
// 服务器地址
let serverUrl = "http://localhost:8088";
// 发送心跳包的时间间隔
const timeout = 1 * 1000;

// 播放数据
const rtspData = [
  {
    id: 0,
    // url: "rtsp://121.196.168.210/test",
    url: "rtsp://localhost/test",
    // 每个不得重复，这个是 ws 的 port
    port: "1277",
    coverSrc: "",
    canvas: document.getElementById("video-canvas"),
  },
];

const players = {};

rtspData.forEach((item) => {
  const timeId = setInterval(() => {
    play(item)
      .then((res) => {
        console.log(res);
        const player = connectWS(res.ws, item.canvas);
        if (player) {
          console.log("clear");
          clearInterval(timeId);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, 1000);
});

rtspData.forEach(item => {
  setInterval(() => {
    sendHeartBeats(item);
  }, timeout);
})


/**
 * 发送心跳包
 *
 * @param {Object} rtspData 播放的数据
 */
function sendHeartBeats(rtspData) {
  $.ajax({
    url: serverUrl + "/heartBeats",
    type: "post",
    data: {
      urls: JSON.stringify(rtspData),
    },
  });
}

/**
 * 播放 rtspData 数据
 *
 * @param {Object} rtspData 播放的数据
 * @returns
 */
function play(rtspData) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: serverUrl + "/startRtspVideo",
      type: "post",
      data: {
        urls: JSON.stringify(rtspData),
      },
      success: function (res) {
        const { result } = res;
        if (result == success) resolve(res);
        else reject(result);
      },
      error: function (err) {
        reject(err);
      },
    });
  });
}

/**
 * 连接 websocket，并将其内容展示在 canvas 上
 *
 * @param {String} ws WebScoket 地址
 * @param {Dom} canvas 展示的 dom
 * @returns
 */
function connectWS(ws, canvas) {
  if (!ws) return;
  // 更多用法详见 
  // @see https://github.com/phoboslab/jsmpeg
  return new JSMpeg.Player(ws, {
    canvas: canvas,
    audio: false,
    // videoBufferSize: 1024 * 1024 * 4,
    // audioBufferSize: 1024 * 1024 * 1,
  });
}

/**
 * 关闭 player
 *
 * @param {JSMpeg.Player} player  播放器
 */
function done(player) {
  player && typeof player.destroy == "function" && player.destroy();
}
