import Vue from 'vue';
// import Vuex from 'vuex';
import Vuex from '@/vuex';
// 1.Vue.use(Vuex);  Vuex是一个对象 install方法
// 2.Vuex中有一个Store类 
// 3.混入到组件中 增添store属性

// 引入测试模块
import moduleA from './moduleA'
import moduleB from './moduleB'

// 引入 Vuex 日志插件 logger
// import logger from 'vuex/dist/logger'

// 注册 vuex 插件：内部会调用 Vuex 中的 install 方法
Vue.use(Vuex);

// vuex-persists 插件实现
function persists() {
  return function (store) {
    console.log("----- persists 插件执行 -----")
    // 取出本地存储的状态
    let data = localStorage.getItem('VUEX:STATE');
    if (data) {
      console.log("----- 存在本地状态，同步至 Vuex -----")
      // 如果存在，使用本地状态替换 Vuex 中的状态
      store.replaceState(JSON.parse(data));
    }
    // subscribe：由 vuex 提供的订阅方法，当触发 mutation 方法时被执行;
    store.subscribe((mutation, state) => {
      console.log("----- 进入Vuex 插件 store.subscribe 处理函数-----")
      localStorage.setItem('VUEX:STATE', JSON.stringify(state));
    })
  }
}

// 实例化容器容器:Vuex.Store
const store = new Vuex.Store({
  // 使用 vuex 插件
  plugins: [
    // logger(),   // 日志插件:导出的 logger 是一个高阶函数
    persists()  // 持久化插件:vuex-persists,
  ],
  // state 状态：相当于组件中的 data 数据
  state: {
    num: 10
  },
  // getters 相当于计算属性（内部实现利用了计算属性）
  getters: {
    getPrice(state) {
      // console.log("进入 getters - getPrice")
      return state.num * 10
    }
  },
  // 相当于 method，能够同步的更改 state
  mutations: {
    changeNum(state, payload) {
      // console.log(`进入 mutations-changeNum：state = ${JSON.stringify(state)}, payload = ${payload}`)
      state.num += payload;
    }
  },
  // action作用:执行异步操作，并将结果提交给 mutations
  actions: {
    changeNum({ commit }, payload) {
      // console.log(`进入 actions-changeNum：commit = ${JSON.stringify(commit)}, payload = ${payload}`)
      setTimeout(() => { // 模拟异步
        commit('changeNum', payload)
      }, 1000);
    }
  },
  modules: {
    moduleA,
    moduleB
  }
});
export default store; // 导出 store 实例，传入根组件