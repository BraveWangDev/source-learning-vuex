<template>
  <div id="app">
    商品数量: {{this.$store.state.num}} 个<br>
    商品单价: 10 元<br>
    订单金额: {{this.$store.getters.getPrice}} 元<br>
    <button @click="$store.commit('changeNum',5)">同步更新：数量+5</button>
    <button @click="$store.dispatch('changeNum',-5)">异步更新：数量-5</button>
    <!-- 测试 State 数据响应式 -->
    <!-- <button @click="$store.state.num = 100">测试 State 数据响应式</button> -->

    <!-- <br> 模块测试： <br>
    A 模块-商品数量: {{this.$store.state.moduleA.num}} 个<br>
    B 模块-商品数量: {{this.$store.state.moduleB.num}} 个<br>
    <button @click="$store.commit('moduleA/changeNum',5)">A 模块-同步更新：数量+5</button>
    <button @click="$store.commit('moduleB/changeNum',5)">B 模块-同步更新：数量+5</button> -->
  </div>
</template>

<script>
export default {
  mounted(){
    console.log(this.$store);
  }
}
</script>