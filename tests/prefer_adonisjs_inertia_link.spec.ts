/*
 * @adonisjs/eslint-plugin
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuleTester } from '@typescript-eslint/rule-tester'
import rule from '../src/rules/prefer_adonisjs_inertia_link.js'

const valids = [
  {
    name: 'Import Link from @adonisjs/inertia/react',
    code: `import { Link } from '@adonisjs/inertia/react'`,
  },
  {
    name: 'Import Link from @adonisjs/inertia/vue',
    code: `import { Link } from '@adonisjs/inertia/vue'`,
  },
  {
    name: 'Import other components from @inertiajs/react',
    code: `import { useForm, usePage } from '@inertiajs/react'`,
  },
  {
    name: 'Import other components from @inertiajs/vue3',
    code: `import { useForm, usePage } from '@inertiajs/vue3'`,
  },
  {
    name: 'Import router from @inertiajs/react',
    code: `import { router } from '@inertiajs/react'`,
  },
]

const invalids = [
  {
    name: 'Import Link from @inertiajs/react',
    code: `import { Link } from '@inertiajs/react'`,
    errors: [{ messageId: 'preferAdonisInertiaLink' as const }],
  },
  {
    name: 'Import Link from @inertiajs/vue3',
    code: `import { Link } from '@inertiajs/vue3'`,
    errors: [{ messageId: 'preferAdonisInertiaLink' as const }],
  },
  {
    name: 'Import Link with alias from @inertiajs/react',
    code: `import { Link as InertiaLink } from '@inertiajs/react'`,
    errors: [{ messageId: 'preferAdonisInertiaLink' as const }],
  },
  {
    name: 'Import Link with alias from @inertiajs/vue3',
    code: `import { Link as VueLink } from '@inertiajs/vue3'`,
    errors: [{ messageId: 'preferAdonisInertiaLink' as const }],
  },
  {
    name: 'Import Link along with other components from @inertiajs/react',
    code: `import { Link, useForm, usePage } from '@inertiajs/react'`,
    errors: [{ messageId: 'preferAdonisInertiaLink' as const }],
  },
]

const ruleTester = new RuleTester()
ruleTester.run('prefer-adonisjs-inertia-link', rule, {
  valid: valids,
  invalid: invalids,
})
