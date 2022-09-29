<template>
  <div id="app">
    <div id="left-wrap">
      <CanvasShow
        v-for="(item, index) in rtspData"
        :key="index"
        :id="item.id"
        @deleteCanvas="handleDeleteCanvas"
      ></CanvasShow>
    </div>
    <img src="./assets/add.png" @click="handleAddCnavasNum" />
    <!-- <div id="right-wrap">
       <div>
        <input
          v-for="(item, index) in rtspData"
          :key="index"
          v-model="item.url"
        />
      </div> 
      <div class="button-wrap">
        <button @click="handleAddCanvasNumr">+</button>
        <button @click="handleChangeRtspDataUrl">enter</button>
        <button @click="handleSubCanvasNumr">-</button>
      </div>
    </div> -->
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
      // 基础端口
      basePort: 9001,
      // canvas 数量
      canvasNum: 1,
      id: 0,
      // rtsp 数据
      rtspData: [
        // {
        //   id: 0,
        //   // url: "rtsp://121.196.168.210/test",
        //   url: "rtsp://localhost/test",
        //   // 服务器地址
        //   serverUrl: "http://localhost:8088",
        //   // 每个不得重复，这个是 ws 的 port
        //   port: "9001",
        // },
      ],
    };
  },
  computed: {},
  mounted() {},
  methods: {
    // 删除 canvas
    handleDeleteCanvas(data) {
      this.canvasNum--;
      for (let i = 0; i < this.rtspData.length; i++) {
        if (this.rtspData[i].id == data.id) {
          this.rtspData.splice(i, 1);
          i--;
        }
      }
    },
    // 增加 canvas
    handleAddCnavasNum() {
      this.canvasNum++;
      this.rtspData.push({
        id: this.id++
      });
    },
  },
};
</script>

<style scoped lang="less">
#app {
  // display: flex;
  justify-content: center;

  #left-wrap {
    // flex: 5;
    height: 100%;
    display: flex;
    justify-content: left;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    // .canvas-wrap {
    //   flex: 1;
    // }
    // .add-wrap {
    //   flex: 1;
    // }
  }
  // #right-wrap {
  //   flex: 1;
  //   height: 100%;
  //   .button-wrap {
  //     display: flex;
  //     button {
  //       flex: 1;
  //     }
  //   }
  // }
}
</style>
