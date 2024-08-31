/*
 * @adonisjs/eslint-plugin
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ESLintUtils } from '@typescript-eslint/utils'

export const createEslintRule = ESLintUtils.RuleCreator<{
  description: string
}>((ruleName) => `https://github.com/adonisjs/eslint-plugin-adonisjs#${ruleName}`)
