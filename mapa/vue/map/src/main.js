// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Mapbox from 'mapbox-gl-vue';
import res from 'vue-resource';
import VueMapboxMap from 'vue-mapbox-map'

import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import '../node_modules/vue-material/dist/vue-material.min.css'
import '../node_modules/vue-material/dist/theme/default.css'


Vue.use(VueMaterial)
Vue.use(res)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App,
    Mapbox,
    VueMapboxMap  },
  template: '<App/>'
})
