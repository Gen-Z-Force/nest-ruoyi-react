import component from './zh-TW/component'
import globalHeader from './zh-TW/globalHeader'
import menu from './zh-TW/menu'
import pwa from './zh-TW/pwa'
import settingDrawer from './zh-TW/settingDrawer'
import settings from './zh-TW/settings'

export default {
  'navBar.lang': '語言',
  'layout.user.link.help': '幫助',
  'layout.user.link.privacy': '隱私',
  'layout.user.link.terms': '條款',
  'app.copyright.produced': '原則科技',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
}
