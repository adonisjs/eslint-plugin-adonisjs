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

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch']

/**
 * ESLint rule to force lazy controller import
 */
export default createEslintRule({
  name: 'prefer-lazy-controller-import',
  defaultOptions: [],
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: '(Needed for HMR) Prefer lazy controller import over standard import',
    },
    schema: [],
    messages: {
      preferLazyControllerImport: 'Replace standard import with lazy controller import',
    },
  },

  create: function (context) {
    const importNodes: Record<string, TSESTree.ImportDeclaration> = {}
    const importIdentifiers: string[] = []
    let routerIdentifier: string = ''

    function isRouteCallExpression(node: TSESTree.CallExpression, identifier: string) {
      return (
        node.callee.type === AST_NODE_TYPES.MemberExpression &&
        node.callee.object.type === AST_NODE_TYPES.Identifier &&
        node.callee.object.name === identifier &&
        node.callee.property.type === AST_NODE_TYPES.Identifier &&
        HTTP_METHODS.includes(node.callee.property.name)
      )
    }

    function isRouteResourceCallExpression(node: TSESTree.CallExpression, identifier: string) {
      return (
        node.callee.type === AST_NODE_TYPES.MemberExpression &&
        node.callee.object.type === AST_NODE_TYPES.Identifier &&
        node.callee.object.name === identifier &&
        node.callee.property.type === AST_NODE_TYPES.Identifier &&
        node.callee.property.name === 'resource'
      )
    }

    return {
      /**
       * Track all imported identifiers
       * Also get the local name of the router import
       */
      ImportDeclaration(node) {
        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportSpecifier') {
            importIdentifiers.push(specifier.local.name)
            importNodes[specifier.local.name] = node
          }
        }

        if (node.source.value === '@adonisjs/core/services/router') {
          if (node.specifiers[0] && node.specifiers[0].type === 'ImportDefaultSpecifier') {
            routerIdentifier = node.specifiers[0].local.name
          }
        }
      },

      CallExpression(node) {
        /**
         * Check if we are calling router.get() or any other http method
         * OR if we are calling router.resource that also takes a controller
         * as an argument
         *
         *
         * Then let's extract the controller identifier from the call expression
         *
         * In the case of router.get/post/put.. we have to extract
         * the first element from the array
         *
         * router.get("/", [HomeController, 'index'])
         */
        let controller: TSESTree.CallExpressionArgument | null = null
        if (isRouteCallExpression(node, routerIdentifier)) {
          const secondArgument = node.arguments[1]
          if (secondArgument.type === AST_NODE_TYPES.ArrayExpression) {
            controller = secondArgument.elements[0]
          }
        }

        /**
         * In the case of router.resource, we just have to extract the first argument
         *
         * router.resource("foo", UserController)
         */
        if (isRouteResourceCallExpression(node, routerIdentifier)) {
          controller = node.arguments[1]
        }

        /**
         * Unable to extract controller
         */
        if (!controller) {
          return
        }

        /**
         * If we are dealing with an Identifier that was imported
         * through a standard import, then report it as an error
         */
        if (controller.type !== 'Identifier' || !importIdentifiers.includes(controller.name)) {
          return
        }

        context.report({
          node: importNodes[controller.name],
          messageId: 'preferLazyControllerImport',
          fix(fixer) {
            const importPath = importNodes[controller.name].source.raw
            const newImportDeclaration = `const ${controller.name} = () => import(${importPath})`
            return fixer.replaceText(importNodes[controller.name], newImportDeclaration)
          },
        })
      },
    }
  },
})
