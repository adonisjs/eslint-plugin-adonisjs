/*
 * @adonisjs/eslint-plugin
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuleTester } from '@typescript-eslint/rule-tester'
import rule from '../src/rules/prefer_lazy_listener_import.js'

const valids = [
  {
    name: 'Lazy import',
    code: `
  import emitter from '@adonisjs/core/services/emitter'
  const SendVerificationEmail = () => import('#listeners/send_verification_email')

  emitter.on('user:registered', [SendVerificationEmail, 'handle'])
  `,
  },
]

const invalids = [
  {
    name: 'Import expression',
    code: `
    import emitter from '@adonisjs/core/services/emitter'
    import SendVerificationEmail from '#listeners/send_verification_email'

    emitter.on('user:registered', [SendVerificationEmail, 'handle'])
    `,
    output: `
    import emitter from '@adonisjs/core/services/emitter'
    const SendVerificationEmail = () => import('#listeners/send_verification_email')

    emitter.on('user:registered', [SendVerificationEmail, 'handle'])
    `,
    errors: [{ messageId: 'preferLazyListenerImport' as const }],
  },
]

const ruleTester = new RuleTester()
ruleTester.run('prefer-lazy-listener-import', rule, {
  valid: valids,
  invalid: invalids,
})
