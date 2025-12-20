/*
 * @adonisjs/eslint-plugin
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import micromatch from 'micromatch'
import { dirname, resolve } from 'node:path'
import { TSESTree } from '@typescript-eslint/utils'
import { readPackageUpSync } from 'read-package-up'

import { createEslintRule } from '../utils.js'

type SubpathImports = Record<string, string | string[] | Record<string, string>>
type Options = [{ allowed?: string[] }]

/**
 * Cache for package.json data per directory
 */
const packageCache = new Map<string, { imports: SubpathImports | null }>()

/**
 * Get the subpath imports from the closest package.json
 */
function getSubpathImports(filename: string): SubpathImports | null {
  const cwd = dirname(filename)

  if (packageCache.has(cwd)) return packageCache.get(cwd)!.imports

  const result = readPackageUpSync({ cwd, normalize: false })
  if (!result) {
    packageCache.set(cwd, { imports: null })
    return null
  }

  const imports = (result.packageJson.imports as SubpathImports) ?? null
  packageCache.set(cwd, { imports })
  return imports
}

/**
 * Resolve the target path(s) for a subpath import pattern.
 * Handles simple strings, arrays, and conditional exports objects.
 */
function resolveImportTarget(target: string | string[] | Record<string, string>): string[] {
  if (typeof target === 'string') return [target]
  if (Array.isArray(target)) return target
  if (typeof target === 'object') return Object.values(target).flatMap(resolveImportTarget)
  return []
}

/**
 * Check if an import path resolves to the inertia folder
 */
function subpathResolvesToFrontend(options: {
  importPath: string
  subpathImports: SubpathImports
}): boolean {
  const { importPath, subpathImports } = options

  for (const [pattern, target] of Object.entries(subpathImports)) {
    const patternBase = pattern.replace('/*', '').replace('*', '')
    const importBase = importPath.replace('/*', '').replace('*', '')

    if (importPath === pattern || importBase.startsWith(patternBase)) {
      const resolvedPaths = resolveImportTarget(target)

      const isFrontend = resolvedPaths.some((resolved) => {
        return resolved.startsWith('./inertia/') || resolved.startsWith('inertia/')
      })

      if (isFrontend) return true
    }
  }

  return false
}

/**
 * Check if a relative import path resolves to the inertia folder (frontend code)
 */
function relativePathResolvesToFrontend(options: {
  importPath: string
  filename: string
}): boolean {
  const { importPath, filename } = options
  const absolutePath = resolve(dirname(filename), importPath)
  return /[\\/]inertia[\\/]/.test(absolutePath)
}

/**
 * ESLint rule to prevent importing backend code in frontend files.
 * Only applies to files in the `inertia/` directory.
 * Automatically detects frontend subpath imports by reading the package.json imports field.
 */
export default createEslintRule<Options, 'noBackendImport'>({
  name: 'no-backend-import-in-frontend',
  defaultOptions: [{ allowed: [] }],
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow importing backend code in frontend (Inertia) files',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowed: {
            type: 'array',
            items: { type: 'string' },
            description:
              'List of allowed import paths or glob patterns (e.g. "#shared/*", "#enums")',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noBackendImport:
        'Importing backend code "{{ importPath }}" in frontend files is not allowed. Use `import type` for type-only imports, or add the path to the `allowed` option.',
    },
  },

  create: function (context, options) {
    const filename = context.filename
    const allowed = options[0]?.allowed ?? []

    const isInInertiaFolder = /[\\/]inertia[\\/]/.test(filename)
    if (!isInInertiaFolder) return {}

    const subpathImports = getSubpathImports(filename)

    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        const importPath = node.source.value

        // Skip type-only imports
        if (node.importKind === 'type') return

        // Skip if in allowed list
        if (allowed.length > 0 && micromatch.isMatch(importPath, allowed)) return

        // Handle subpath imports (#xxx)
        if (importPath.startsWith('#')) {
          if (!subpathImports) return
          if (subpathResolvesToFrontend({ importPath, subpathImports })) return

          context.report({ node, messageId: 'noBackendImport', data: { importPath } })
          return
        }

        // Handle relative imports (./xxx or ../xxx)
        if (importPath.startsWith('.')) {
          if (relativePathResolvesToFrontend({ importPath, filename })) return

          context.report({ node, messageId: 'noBackendImport', data: { importPath } })
        }
      },
    }
  },
})
