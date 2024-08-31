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

/**
 * ESLint rule to force lazy listener imports
 */
export default createEslintRule({
  name: 'prefer-lazy-listener-import',
  defaultOptions: [],
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: '(Needed for HMR) Prefer lazy listener import over standard import',
    },
    schema: [],
    messages: {
      preferLazyListenerImport: 'Replace standard import with lazy listener import',
    },
  },

  create: function (context) {
    const importNodes: Record<string, TSESTree.ImportDeclaration> = {}
    const importIdentifiers: string[] = []
    let emitterIdentifier: string = ''

    function isEmitterOnCallExpression(node: TSESTree.CallExpression, routerIdentifier: string) {
      return (
        node.callee.type === AST_NODE_TYPES.MemberExpression &&
        node.callee.object.type === AST_NODE_TYPES.Identifier &&
        node.callee.object.name === routerIdentifier &&
        node.callee.property.type === AST_NODE_TYPES.Identifier &&
        node.callee.property.name === 'on'
      )
    }

    return {
      /**
       * Track all imported identifiers
       * Also get the local name of the emitter import
       */
      ImportDeclaration(node) {
        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportSpecifier') {
            importIdentifiers.push(specifier.local.name)
            importNodes[specifier.local.name] = node
          }
        }

        if (node.source.value === '@adonisjs/core/services/emitter') {
          if (node.specifiers[0] && node.specifiers[0].type === 'ImportDefaultSpecifier') {
            emitterIdentifier = node.specifiers[0].local.name
          }
        }
      },

      CallExpression(node) {
        /**
         * Check if we are calling emitter.on()
         */
        if (!isEmitterOnCallExpression(node, emitterIdentifier)) {
          return
        }

        /**
         * Ensure the second argument is an array
         */
        const secondArgument = node.arguments[1]
        if (secondArgument.type !== AST_NODE_TYPES.ArrayExpression) {
          return
        }

        for (const element of secondArgument.elements) {
          if (!element) {
            continue
          }

          /**
           * If we are dealing with an Identifier that was imported
           * through a standard import, then report it as an error
           */
          if (element.type !== 'Identifier' || !importIdentifiers.includes(element.name)) {
            continue
          }

          context.report({
            node: importNodes[element.name],
            messageId: 'preferLazyListenerImport',
            fix(fixer) {
              const importPath = importNodes[element.name].source.raw
              const newImportDeclaration = `const ${element.name} = () => import(${importPath})`
              return fixer.replaceText(importNodes[element.name], newImportDeclaration)
            },
          })
        }
      },
    }
  },
})
