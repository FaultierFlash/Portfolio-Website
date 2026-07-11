import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'k4t36b6u',
    dataset: 'production'
  },
  project: {
    basePath: '/studio'
  },
  vite: {
    base: '/studio/'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
  }
} as any)
