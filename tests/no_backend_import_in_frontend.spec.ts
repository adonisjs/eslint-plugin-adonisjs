/*
 * @adonisjs/eslint-plugin
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RuleTester } from '@typescript-eslint/rule-tester'
import rule from '../src/rules/no_backend_import_in_frontend.js'

/**
 * Create a temporary project with a package.json containing subpath imports
 */
function createTestProject() {
  const projectRoot = join(tmpdir(), `eslint-test-${Date.now()}`)
  const inertiaDir = join(projectRoot, 'inertia', 'pages')
  const backendDir = join(projectRoot, 'app', 'models')

  mkdirSync(inertiaDir, { recursive: true })
  mkdirSync(backendDir, { recursive: true })

  const packageJson = {
    name: 'test-project',
    imports: {
      '#models/*': './app/models/*.js',
      '#services/*': './app/services/*.js',
      '#controllers/*': './app/controllers/*.js',
      '#components/*': './inertia/components/*.js',
      '#frontend/*': './inertia/*.js',
      '#shared/*': './shared/*.js',
    },
  }

  writeFileSync(join(projectRoot, 'package.json'), JSON.stringify(packageJson, null, 2))

  return {
    projectRoot,
    frontendFile: join(inertiaDir, 'users.tsx'),
    backendFile: join(backendDir, 'user.ts'),
    cleanup: () => rmSync(projectRoot, { recursive: true, force: true }),
  }
}

const testProject = createTestProject()

const valids = [
  // Subpath imports
  {
    name: 'Regular import outside inertia folder',
    filename: testProject.backendFile,
    code: `import User from '#models/user'`,
  },
  {
    name: 'Type-only import in inertia folder',
    filename: testProject.frontendFile,
    code: `import type { User } from '#models/user'`,
  },
  {
    name: 'Non-subpath import in inertia folder',
    filename: testProject.frontendFile,
    code: `import { Link } from '@adonisjs/inertia/react'`,
  },
  {
    name: 'Frontend subpath import (#components/*)',
    filename: testProject.frontendFile,
    code: `import { Button } from '#components/button'`,
  },
  {
    name: 'Frontend subpath import (#frontend/*)',
    filename: testProject.frontendFile,
    code: `import { utils } from '#frontend/utils'`,
  },
  {
    name: 'Allowed import with exact match',
    filename: testProject.frontendFile,
    options: [{ allowed: ['#shared/enums'] }] as [{ allowed: string[] }],
    code: `import { UserStatus } from '#shared/enums'`,
  },
  {
    name: 'Allowed import with glob pattern',
    filename: testProject.frontendFile,
    options: [{ allowed: ['#shared/*'] }] as [{ allowed: string[] }],
    code: `import { UserStatus } from '#shared/enums'`,
  },
  {
    name: 'Allowed import with deep glob pattern',
    filename: testProject.frontendFile,
    options: [{ allowed: ['#shared/**'] }] as [{ allowed: string[] }],
    code: `import { helpers } from '#shared/utils/helpers'`,
  },
  // Relative imports
  {
    name: 'Relative import within inertia folder',
    filename: testProject.frontendFile,
    code: `import { Button } from '../components/button'`,
  },
  {
    name: 'Relative import with ./ within inertia folder',
    filename: testProject.frontendFile,
    code: `import { utils } from './utils'`,
  },
  {
    name: 'Type-only relative import to backend',
    filename: testProject.frontendFile,
    code: `import type { User } from '../../app/models/user'`,
  },
  {
    name: 'Allowed relative import to backend',
    filename: testProject.frontendFile,
    options: [{ allowed: ['../../shared/**'] }] as [{ allowed: string[] }],
    code: `import { UserStatus } from '../../shared/enums'`,
  },
]

const invalids = [
  // Subpath imports
  {
    name: 'Import model in inertia folder',
    filename: testProject.frontendFile,
    code: `import User from '#models/user'`,
    errors: [{ messageId: 'noBackendImport' as const }],
  },
  {
    name: 'Import service in inertia folder',
    filename: testProject.frontendFile,
    code: `import { UserService } from '#services/user_service'`,
    errors: [{ messageId: 'noBackendImport' as const }],
  },
  {
    name: 'Import controller in inertia folder',
    filename: testProject.frontendFile,
    code: `import UsersController from '#controllers/users_controller'`,
    errors: [{ messageId: 'noBackendImport' as const }],
  },
  {
    name: 'Import shared code (not in inertia/) in inertia folder',
    filename: testProject.frontendFile,
    code: `import { helpers } from '#shared/utils'`,
    errors: [{ messageId: 'noBackendImport' as const }],
  },
  {
    name: 'Import not in allowed list',
    filename: testProject.frontendFile,
    options: [{ allowed: ['#enums/*'] }] as [{ allowed: string[] }],
    code: `import User from '#models/user'`,
    errors: [{ messageId: 'noBackendImport' as const }],
  },
  // Relative imports
  {
    name: 'Relative import to backend model',
    filename: testProject.frontendFile,
    code: `import User from '../../app/models/user'`,
    errors: [{ messageId: 'noBackendImport' as const }],
  },
  {
    name: 'Relative import to backend service',
    filename: testProject.frontendFile,
    code: `import { UserService } from '../../app/services/user_service'`,
    errors: [{ messageId: 'noBackendImport' as const }],
  },
  {
    name: 'Relative import to shared (outside inertia)',
    filename: testProject.frontendFile,
    code: `import { helpers } from '../../shared/utils'`,
    errors: [{ messageId: 'noBackendImport' as const }],
  },
]

const ruleTester = new RuleTester()
ruleTester.run('no-backend-import-in-frontend', rule, {
  valid: valids,
  invalid: invalids,
})
