<template>
  <div id="app">
    <div id="left-wrap">
      <CanvasShow
        v-for="(canvasId, index) in canvasIds"
        :key="index"
        :id="canvasId"
        :rtsp-data="rtspData[index]"
      ></CanvasShow>
    </div>
    <div id="right-wrap"></div>
  </div>
</template>

<script>
import CanvasShow from "./components/CanvasShow.vue";

export default {
  name: "App",
  components: {
    CanvasShow,
  },
  data() {
    return {
      // canvas 数量
      canvasNum: 3,
      // rtsp 数据
      rtspData: [
        {
          id: 0,
          // url: "rtsp://121.196.168.210/test",
          url: "rtsp://localhost/test",
          // 服务器地址
          serverUrl: "http://localhost:8088",
          // 每个不得重复，这个是 ws 的 port
          port: "9001",
        },
        {
          id: 1,
          // url: "rtsp://121.196.168.210/test",
          url: "rtsp://localhost/test",
          // 服务器地址
          serverUrl: "http://localhost:8088",
          // 每个不得重复，这个是 ws 的 port
          port: "9011",
        },
        {
          id: 2,
          // url: "rtsp://121.196.168.210/test",
          url: "rtsp://localhost/test",
          // 服务器地址
          serverUrl: "http://localhost:8088",
          // 每个不得重复，这个是 ws 的 port
          port: "9021",
        },
      ],
    };
  },
  computed: {
    // canvas id
    canvasIds: {
      get: function () {
        let canvasIds = [];
        for (let i = 0; i < this.canvasNum; i++)
          canvasIds.push("canvas-video-" + i);
        return canvasIds;
      },
    },
  },
  methods: {},
};
</script>

<style scoped lang="less">
#app {
  display: flex;
  justify-content: center;

  #left-wrap {
    flex: 1;
    height: 100%;
    display: flex;
    justify-content: left;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    canvas {
      height: 16vw;
      width: 25vw;
      padding: 1vw;
    }
  }
  #right-wrap {
    flex: 1;
    height: 100%;
  }
}
</style>
