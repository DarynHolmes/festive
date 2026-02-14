/// <reference types="@quasar/app-vite" />

interface ImportMetaEnv {
  readonly VITE_POCKETBASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
