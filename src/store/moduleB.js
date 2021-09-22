export default {
  namespaced: true,
  state: {
    num: 30
  },
  getters: {
  },
  mutations: {
    changeNum(state, payload) {
      state.num += payload;
    }
  },
  actions: {
  }
};