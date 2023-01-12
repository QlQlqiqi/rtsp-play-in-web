<template>
  <div class="wrap">
    <canvas
      :id="domId"
      @contextmenu.prevent="handleShowOption"
      @click="startOrStop"
    ></canvas>
    <div v-show="optionShow" class="option">
      <div class="left-wrap">
        <input placeholder="rtsp URL: rtsp://ip/path" v-model="rtspData.url" />
        <input
          placeholder="server URL: http://ip:port"
          v-model="rtspData.serverUrl"
        />
        <input placeholder="port: 9001" v-model="rtspData.port" />
        <div class="button-wrap">
          <button @click="handleChangeRtspData">enter</button>
          <button @click="handleDeleteCanvas">delete</button>
          <button @click="handleHideOption">cancel</button>
        </div>
      </div>
      <div class="right-wrap">
        <button @click="handleVideotape">videotape</button>
        <button @click="handleScreenshot">screenshot</button>
      </div>
    </div>
  </div>
</template>

<script>
import $ from "jquery";
import jsmpeg from "../../static/js/jsmpeg.js";
import saveAs from "file-saver";
import { getformatTime } from "@/util/util";

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
  watch: {},
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
      // 停止发送心跳包
      this.heartBeatsTimeId != -1 && clearInterval(this.heartBeatsTimeId);
      // 关闭 player 绘制
      this.player && this.player.destroy();
      // 关闭录屏
      if (this.isVideotape) {
        this.videotapeRecorder.stop();
        this.isVideotape = false;
        delete this.videotapeData;
        delete this.videotapeStream;
        delete this.videotapeRecorder;
      }
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
        // videoBufferSize: 1024 * 1024 * 4,
        pauseWhenHidden: false,
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
    handleScreenshot() {
      this.canvas.toBlob(
        (blob) => {
          saveAs(blob, `${getformatTime()}_${this.id}.jpeg`);
        },
        "image/jpeg",
        1
      );
    },
    startOrStop() {
      if (!this.player) return;
      if (this.player.paused) this.player.play();
      else this.player.stop();
    },
    // 开始/结束录屏
    handleVideotape() {
      // 开始
      if (!this.isVideotape) {
        const stream = this.canvas.captureStream();
        const recorder = new MediaRecorder(stream, {
          mimeType: "video/webm",
          // videoBitsPerSecond: 1024 * 1024 * 10,
        });
        this.videotapeData = [];
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size) {
            this.videotapeData.push(event.data);
          }
        };
        this.videotapeStream = stream;
        this.videotapeRecorder = recorder;
        this.isVideotape = true;
        recorder.start();
      } else {
        // 结束
        this.videotapeRecorder.onstop = () => {
          saveAs(
            new Blob(this.videotapeData, { type: "video/webm" }),
            `${getformatTime()}_${this.id}.h264`
          );
          this.isVideotape = false;
          delete this.videotapeData;
          delete this.videotapeStream;
          delete this.videotapeRecorder;
        };
        this.videotapeRecorder.stop();
      }
    },
    // 更改 rtspData
    handleChangeRtspData() {
      // "121.196.168.210"
      const defaultIp = "localhost";
      this.rtspData.port = +this.rtspData.port || 9001;
      this.rtspData.url = this.rtspData.url || "rtsp://" + defaultIp + "/test";
      this.rtspData.serverUrl =
        this.rtspData.serverUrl || "http://" + defaultIp + ":8088";
      console.log(this.rtspData);
      this.shutdown();
      this.buildWSConnection();
      this.sendHeartBeats();
      this.handleHideOption();
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
  height: 100%;
  width: auto;
  margin: 1vw;
  min-width: 25vw;
  min-height: 16vw;
  canvas {
    height: 100%;
    position: absolute;
    width: 100%;
    border: 0.3vw white solid;
    border-radius: 2vw;
    box-shadow: 0px 0px 1vw 0.3vw rgb(0 0 0 / 10%);
  }
  .option {
    padding: 2vw;
    height: 100%;
    opacity: 0.6;
    display: flex;
    width: 40vw;
    .left-wrap {
      flex: 3;
      input {
        height: 25%;
        width: 80%;
        margin: 0 auto;
        display: block;
      }
      .button-wrap {
        height: 25%;
        width: 80%;
        margin: 0 auto;
        display: flex;
        button {
          flex-grow: 1;
        }
      }
    }

    .right-wrap {
      flex: 1;
    }
  }
}
</style>
