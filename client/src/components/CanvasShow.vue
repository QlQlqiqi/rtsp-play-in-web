<template>
  <!-- 左键暂停，右键下载图片 -->
  <div
    class="wrap"
    @mouseenter="handleShowOption"
    @mouseleave="handleHideOption"
  >
    <canvas
      :id="domId"
      @contextmenu.prevent="download"
      @click="startOrStop"
      @click.middle="saveVideo"
    ></canvas>
    <div v-show="optionShow" class="option">
      <input placeholder="rtsp URL: rtsp://ip/path" v-model="rtspData.url" />
      <input
        placeholder="server URL: http://ip/path"
        v-model="rtspData.serverUrl"
      />
      <input placeholder="port: 9001" v-model="rtspData.port" />
      <div class="button-wrap">
        <button @click="handleChangeRtspData">enter</button>
        <button @click="handleDeleteCanvas">delete</button>
      </div>
    </div>
  </div>
</template>

<script >
import $ from "jquery";
import jsmpeg from "../../static/js/jsmpeg.js";
import saveAs from "file-saver";

export default {
  name: "CanvasShow",
  props: {
    id: Number,
  },
  data() {
    return {
      // 返回状态码
      success: 0,
      // 发送心跳包的时间间隔
      timeout: 1 * 1000,
      canvas: null,
      player: null,
      inputValue: {},
      optionShow: false,
      heartBeatsTimeId: -1,
      rtspData: {},
    };
  },
  watch: {
    rtspData: function (newData) {
      console.log("change rtspData");
      // this.shutdown();
      // this.buildWSConnection();
      // this.inputValue = { ...this.rtspData };
      // console.log(this.rtspData);
    },
  },
  computed: {
    domId: {
      get: function () {
        return "canvas-video-" + this.id;
      },
    },
  },
  mounted() {
    this.canvas = document.getElementById(this.domId);
  },
  methods: {
    // 关闭
    shutdown() {
      if (this.heartBeatsTimeId != -1) clearInterval(this.heartBeatsTimeId);
      this.player && this.player.destroy();
    },
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
      this.heartBeatsTimeId = setInterval(() => {
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
            if (result == _this.success) resolve(res);
            else reject(result);
          },
          error: function (err) {
            console.log("play error: ", err);
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
      else this.player.stop();
    },
    saveVideo() {
      const stream = this.canvas.captureStream();
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
        videoBitsPerSecond: 1024 * 1024 * 10,
      });
      const data = [];
      recorder.ondataavailable = function (event) {
        if (event.data && event.data.size) {
          data.push(event.data);
        }
      };
      recorder.onstop = () => {
        saveAs(new Blob(data, { type: "video/webm " }), "1.mp4");
      };
      recorder.start();
      setTimeout(() => {
        recorder.stop();
      }, 2000);
    },
    // 更改 rtspData
    handleChangeRtspData() {
      this.rtspData.port = +this.rtspData.port;
      this.shutdown();
      this.buildWSConnection();
      this.sendHeartBeats();
    },
    // 删除 canvas
    handleDeleteCanvas() {
      this.$emit("deleteCanvas", {
        id: this.id,
      });
    },
    handleShowOption() {
      this.optionShow = true;
    },
    handleHideOption() {
      this.optionShow = false;
    },
  },
};
</script>

<style scoped lang="less">
.wrap {
  position: relative;
  height: 32vw;
  width: 48vw;
  padding: 1vw;
  canvas {
    height: 100%;
    width: 100%;
    border: 0.3vw white solid;
    border-radius: 2vw;
    box-shadow: 0px 0px 1vw 0.3vw rgb(0 0 0 / 10%);
  }
  .option {
    margin: 0 auto;
    position: absolute;
    top: 7vw;
    left: 8vw;
    height: 18vw;
    width: 30vw;
    opacity: 0.6;
    input,
    .button-wrap {
      height: 25%;
      width: 100%;
      display: flex;
      button {
        flex: 1;
      }
    }
  }
}
</style>
