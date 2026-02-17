import { defineSetupVue3 } from '@histoire/plugin-vue'
import { Quasar, Notify } from 'quasar'

import 'quasar/src/css/index.sass'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'

import './css/app.scss'

export const setupVue3 = defineSetupVue3(({ app }) => {
  // Story collection runs server-side where Quasar's install can fail.
  // Try/catch lets it work in the browser while surviving collection.
  try {
    app.use(Quasar, { config: {}, plugins: { Notify } })
  } catch {
    // Expected during server-side story collection
  }
})
