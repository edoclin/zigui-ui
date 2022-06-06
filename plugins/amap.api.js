import AmapVue from '@amap/amap-vue';
import Vue from 'vue'

AmapVue.config.version = '2.0';
AmapVue.config.key = 'a3ab3446e22967b7f98b0dd91f517ea0';
AmapVue.config.plugins = [
  'AMap.ToolBar',
  'AMap.MoveAnimation'
];
Vue.use(AmapVue);
