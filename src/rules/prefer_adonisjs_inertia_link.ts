/*
 * @adonisjs/eslint-plugin
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils'
import { createEslintRule } from '../utils.js'

const INERTIA_PACKAGES = ['@inertiajs/react', '@inertiajs/vue3']

/**
 * ESLint rule to prefer the typesafe AdonisJS Inertia Link component
 * over the non-typesafe Inertia.js Link component
 */
export default createEslintRule({
  name: 'prefer-adonisjs-inertia-link',
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer the typesafe @adonisjs/inertia Link component over the @inertiajs Link component',
    },
    schema: [],
    messages: {
      preferAdonisInertiaLink:
        'Prefer importing Link from @adonisjs/inertia/{{ framework }} for typesafe routing instead of {{ source }}',
    },
  },

  create: function (context) {
    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        const source = node.source.value
        if (!INERTIA_PACKAGES.includes(source)) return

        const hasLinkImport = node.specifiers.some((specifier) => {
          if (specifier.type !== AST_NODE_TYPES.ImportSpecifier) return false
          return (
            specifier.imported.type === AST_NODE_TYPES.Identifier &&
            specifier.imported.name === 'Link'
          )
        })

        if (!hasLinkImport) return

        const framework = source === '@inertiajs/react' ? 'react' : 'vue'

        context.report({
          node,
          messageId: 'preferAdonisInertiaLink',
          data: { framework, source },
        })
      },
    }
  },
})
