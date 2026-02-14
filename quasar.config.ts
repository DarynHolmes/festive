import { defineConfig } from '#q-app/wrappers'

export default defineConfig(() => {
  return {
    boot: [],

    css: ['app.scss'],

    extras: ['material-icons'],

    build: {
      target: {
        browser: ['chrome80', 'firefox78', 'safari13'],
      },
      vueRouterMode: 'history',
      typescript: {
        strict: true,
      },
    },

    devServer: {
      port: 9000,
      open: false,
    },

    framework: {
      config: {},
      plugins: [],
    },

    animations: [],
  }
})
