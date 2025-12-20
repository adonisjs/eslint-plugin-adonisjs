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
import preferAdonisInertiaLink from './src/rules/prefer_adonisjs_inertia_link.js'
import preferAdonisInertiaForm from './src/rules/prefer_adonisjs_inertia_form.js'
import noBackendImportInFrontend from './src/rules/no_backend_import_in_frontend.js'

export default {
  rules: {
    'prefer-lazy-controller-import': preferLazyControllerImport,
    'prefer-lazy-listener-import': preferLazyListenerImport,
    'prefer-adonisjs-inertia-link': preferAdonisInertiaLink,
    'prefer-adonisjs-inertia-form': preferAdonisInertiaForm,
    'no-backend-import-in-frontend': noBackendImportInFrontend,
  },
}
