/*
 * @adonisjs/eslint-plugin
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import preferLazyListenerImport from './src/rules/prefer_lazy_listener_import.js'
import preferLazyControllerImport from './src/rules/prefer_lazy_controller_import.js'

export default {
  rules: {
    'prefer-lazy-controller-import': preferLazyControllerImport,
    'prefer-lazy-listener-import': preferLazyListenerImport,
  },
}
