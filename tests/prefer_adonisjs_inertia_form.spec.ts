/*
 * @adonisjs/eslint-plugin
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuleTester } from '@typescript-eslint/rule-tester'
import rule from '../src/rules/prefer_adonisjs_inertia_form.js'

const valids = [
  {
    name: 'Import Form from @adonisjs/inertia/react',
    code: `import { Form } from '@adonisjs/inertia/react'`,
  },
  {
    name: 'Import Form from @adonisjs/inertia/vue',
    code: `import { Form } from '@adonisjs/inertia/vue'`,
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
    name: 'Import Form from @inertiajs/react',
    code: `import { Form } from '@inertiajs/react'`,
    errors: [{ messageId: 'preferAdonisInertiaForm' as const }],
  },
  {
    name: 'Import Form from @inertiajs/vue3',
    code: `import { Form } from '@inertiajs/vue3'`,
    errors: [{ messageId: 'preferAdonisInertiaForm' as const }],
  },
  {
    name: 'Import Form with alias from @inertiajs/react',
    code: `import { Form as InertiaForm } from '@inertiajs/react'`,
    errors: [{ messageId: 'preferAdonisInertiaForm' as const }],
  },
  {
    name: 'Import Form with alias from @inertiajs/vue3',
    code: `import { Form as VueForm } from '@inertiajs/vue3'`,
    errors: [{ messageId: 'preferAdonisInertiaForm' as const }],
  },
  {
    name: 'Import Form along with other components from @inertiajs/react',
    code: `import { Form, useForm, usePage } from '@inertiajs/react'`,
    errors: [{ messageId: 'preferAdonisInertiaForm' as const }],
  },
]

const ruleTester = new RuleTester()
ruleTester.run('prefer-adonisjs-inertia-form', rule, {
  valid: valids,
  invalid: invalids,
})
