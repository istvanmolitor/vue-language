import { MenuBuilder, type MenuItemConfig } from '@menu/types/menu'
import { Globe } from 'lucide-vue-next'

/**
 * Language Menu Builder
 * Builds the language management menu structure
 */
export class LanguageMenuBuilder extends MenuBuilder {
  build(menu: MenuItemConfig, menuName: string): MenuItemConfig {
    if (menuName !== 'admin') {
      return menu
    }

    // Add language management to the menu
    this.addMenuItem(menu, {
      id: 'languages',
      title: 'Nyelvek',
      path: '/languages',
      icon: Globe,
      order: 30
    })

    return menu
  }
}

