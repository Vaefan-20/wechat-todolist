import { ensureDefaultData } from './utils/storage'

App({
  globalData: {},
  onLaunch() {
    ensureDefaultData()
  },
})
