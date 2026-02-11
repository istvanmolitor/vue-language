import type { MenuBuilder, MenuItemConfig } from '@menu/index'
import { Languages,Globe } from 'lucide-vue-next'

/**
 * Language Menu Builder
 * Builds the language management menu structure
 */
export class LanguageMenuBuilder implements MenuBuilder {
  build(menu: MenuItemConfig, menuName: string): MenuItemConfig {
    if (menuName !== 'admin') {
      return menu
    }

    // Add language management to the menu
    const languageItem: MenuItemConfig = {
      id: 'languages',
      title: 'Nyelvek',
      path: '/languages',
      icon: Globe,
      order: 30
    }

    // Add to menu children
    if (!menu.children) {
      menu.children = []
    }
    menu.children.push(languageItem)

    // Sort children by order
    menu.children.sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER
      return orderA - orderB
    })

    return menu
  }
}

// Export singleton instance
export const languageMenuBuilder = new LanguageMenuBuilder()
