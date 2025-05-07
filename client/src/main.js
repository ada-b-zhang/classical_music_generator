import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify'; // path to vuetify export

createApp(App)
  .use(vuetify)
  .mount('#app'); 