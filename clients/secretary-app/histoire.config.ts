import { fileURLToPath } from 'node:url'
import { HstVue } from '@histoire/plugin-vue'
import { defineConfig } from 'histoire'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  plugins: [HstVue()],
  setupFile: '/src/histoire.setup.ts',
  vite: {
    plugins: [
      vue({ template: { transformAssetUrls } }),
      quasar({
        sassVariables: fileURLToPath(
          new URL('./src/css/quasar.variables.scss', import.meta.url),
        ),
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use 'quasar.variables' as *;\n`,
          loadPaths: ['src/css'],
        },
      },
    },
  },
})
