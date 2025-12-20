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
 * ESLint rule to prefer the typesafe AdonisJS Inertia Form component
 * over the non-typesafe Inertia.js Form component
 */
export default createEslintRule({
  name: 'prefer-adonisjs-inertia-form',
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer the typesafe @adonisjs/inertia Form component over the @inertiajs Form component',
    },
    schema: [],
    messages: {
      preferAdonisInertiaForm:
        'Prefer importing Form from @adonisjs/inertia/{{ framework }} for typesafe routing instead of {{ source }}',
    },
  },

  create: function (context) {
    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        const source = node.source.value
        if (!INERTIA_PACKAGES.includes(source)) return

        const hasFormImport = node.specifiers.some((specifier) => {
          if (specifier.type !== AST_NODE_TYPES.ImportSpecifier) return false
          return (
            specifier.imported.type === AST_NODE_TYPES.Identifier &&
            specifier.imported.name === 'Form'
          )
        })

        if (!hasFormImport) return

        const framework = source === '@inertiajs/react' ? 'react' : 'vue'

        context.report({
          node,
          messageId: 'preferAdonisInertiaForm',
          data: { framework, source },
        })
      },
    }
  },
})
