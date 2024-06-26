import app from './en-US/app'
import component from './en-US/component'
import globalHeader from './en-US/globalHeader'
import menu from './en-US/menu'
import pages from './en-US/pages'
import pwa from './en-US/pwa'
import settingDrawer from './en-US/settingDrawer'
import settings from './en-US/settings'

export default {
  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Terms',
  'app.copyright.produced': 'Principle Tech.',
  ...app,
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...pages,
}
