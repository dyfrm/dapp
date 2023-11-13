import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import * as components from 'vuetify/components'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'dark'
  },
    themes: {
      light: {
        colors: {
          primary: '#FF5400',
          secondary: '#BD4001',
        },
      },
    },

components,
})
