import App from './App.vue'
import { createApp } from 'vue'
import store from './store'
import { registerPlugins } from '@/plugins'

const app = createApp(App)
registerPlugins(app)

app.use(store).mount('#app')