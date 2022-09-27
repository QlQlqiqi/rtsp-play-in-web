<template>
  <!-- 左键暂停，右键下载图片 -->
  <canvas
    :id="id"
    @contextmenu.prevent="download"
    @click="startOrStop"
    @click.middle="saveVideo"
  ></canvas>
</template>

<script >
const success = 0;
// const error = 1;
// // 如果为 true，则存储当前 canvas blob
// let saveCurrentFrameBlob = false;
// // 当前帧的 canvas blob
// // 类型为 image/jpeg
// const currentFrameBlob = {};

import $ from "../../static/js/jquery.js";
import jsmpeg from "../../static/js/jsmpeg.js";
import saveAs from "file-saver";

export default {
  name: "CanvasShow",
  props: {
    id: String,
    rtspData: Object,
  },
  data() {
    return {
      // 返回状态码
      success: 0,
      // 发送心跳包的时间间隔
      timeout: 1 * 1000,
      canvas: null,
      player: null,
    };
  },
  mounted() {
    this.canvas = document.getElementById(this.id);
    this.buildWSConnection();
    this.sendHeartBeats();
  },
  watch: {},
  methods: {
    // 建立 ws 连接
    buildWSConnection() {
      let _this = this;
      const timeId = setInterval(() => {
        _this
          .play()
          .then((res) => {
            console.log(res);
            const player = _this.connectWebScoket(res.ws);
            if (player) {
              console.log("clear");
              this.player = player;
              clearInterval(timeId);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }, 1000);
    },
    // 发送心跳包
    sendHeartBeats() {
      let _this = this;
      setInterval(() => {
        $.ajax({
          url: _this.rtspData.serverUrl + "/heartBeats",
          type: "post",
          data: {
            urls: JSON.stringify(_this.rtspData),
          },
        });
      }, _this.timeout);
    },
    /**
     * 连接 websocket，并将其内容展示在 canvas 上
     *
     * @param {String} ws WebScoket 地址
     * @returns
     */
    connectWebScoket(ws) {
      if (!ws) return;
      // 更多用法详见
      // @see https://github.com/phoboslab/jsmpeg
      const _this = this;
      return new jsmpeg.Player(ws, {
        canvas: this.canvas,
        audio: false,
        preserveDrawingBuffer: true,
        onVideoDecode: (decoder, time) => {},
        videoBufferSize: 1024 * 1024 * 4,
        // audioBufferSize: 1024 * 1024 * 1,
      });
    },
    /**
     * 播放 rtspData 数据
     *
     * @returns
     */
    play() {
      let _this = this;
      return new Promise((resolve, reject) => {
        $.ajax({
          url: _this.rtspData.serverUrl + "/startRtspVideo",
          type: "post",
          data: {
            urls: JSON.stringify(this.rtspData),
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
    },
    download() {
      this.canvas.toBlob((blob) => {
        saveAs(blob, "1.jpg");
      });
    },
    startOrStop() {
      if (this.player.paused) this.player.play();
      else this.player.pause();
    },
    saveVideo() {
      const stream = this.canvas.captureStream();
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      const data = [];
      recorder.ondataavailable = function (event) {
        if (event.data && event.data.size) {
          data.push(event.data);
        }
      };
      recorder.onstop = () => {
        saveAs(new Blob(data, { type: "video/webm" }), "1.mp4")
      };
      recorder.start();
      setTimeout(() => {
        recorder.stop();
      }, 2000);
    },
  },
};
</script>

<style scoped lang="less">
</style>
