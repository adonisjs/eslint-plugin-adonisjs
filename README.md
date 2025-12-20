# @adonisjs/eslint-plugin

> Compatible with ESLint>=9.0 and TypeScript >=5.4

<hr>
<br />

<div align="center">
  <h3>ESLint plugin for AdonisJS applications</h3>
  <p>
    The plugin forces your application to use lazy imports for controllers and event listeners. <strong>Lazy imports are a must when you are using HMR mode in AdonisJS</strong>.
  </p>
</div>

<br />

<div align="center">

[![gh-workflow-image]][gh-workflow-url] [![typescript-image]][typescript-url] [![npm-image]][npm-url] [![license-image]][license-url]

</div>

## Installation

The package comes pre-configured with the [@adonisjs/eslint-config](https://github.com/adonisjs/eslint-config) preset and hence manual installation is not required.

However, you can install and configure it as follows.

```sh
npm i -D @adonisjs/eslint-plugin@beta

# Install peer dependencies
npm i -D eslint@9 typescript typescript-eslint
```

## Usage

After installation, you can register the following as follows. Make sure to also setup the `typescript-eslint` parser in order for the rules to work.

```ts
// eslint.config.js
import adonisJSPlugin from '@adonisjs/eslint-plugin'

export default [
  {
    plugins: {
      '@adonisjs': adonisJSPlugin,
    },
    rules: {
      '@adonisjs/prefer-lazy-controller-import': 'error',
      '@adonisjs/prefer-lazy-listener-import': 'error',
    },
  },
]
```

## `prefer-lazy-controller-import`

> [!IMPORTANT]
> The HMR mode of AdonisJS only works with Lazy loaded controllers

The `@adonisjs/prefer-lazy-controller-import` rule complains when you import a controller using the import expression and assign it to a route. For example:

```ts
import router from '@adonisjs/core/services/router'
// ❌ Error: Replace standard import with lazy controller import
import UsersController from '#controllers/user_controller'

router.get('users', [UsersController, 'index'])
```

The rule is auto fixable, therefore you can apply the fix depending upon the shortcuts provided by your
code editor.

```ts
import router from '@adonisjs/core/services/router'
// ✅ Fixed
const UsersController = () => import('#controllers/user_controller')

router.get('users', [UsersController, 'index'])
```

## `prefer-lazy-listener-import`

> [!IMPORTANT]
> The HMR mode of AdonisJS only works with Lazy loaded event listeners

The `@adonisjs/prefer-lazy-listener-import` rule complains when you import an event listener using the import expression and assign it to an event. For example:

```ts
import emitter from '@adonisjs/core/services/emitter'
// ❌ Error: Replace standard import with lazy controller import
import SendVerificationEmail from '#listeners/send_verification_email'

emitter.on('user:created', [SendVerificationEmail, 'handle'])
```

The rule is auto fixable, therefore you can apply the fix depending upon the shortcuts provided by your
code editor.

```ts
import emitter from '@adonisjs/core/services/emitter'
// ✅ Fixed
const SendVerificationEmail = () => import('#listeners/send_verification_email')

emitter.on('user:created', [SendVerificationEmail, 'handle'])
```

## `prefer-adonisjs-inertia-link`

> [!NOTE]
> This rule is for AdonisJS 7+ projects using `@adonisjs/inertia` v4+.

The `@adonisjs/prefer-adonisjs-inertia-link` rule warns when you import the `Link` component from `@inertiajs/react` or `@inertiajs/vue3` instead of using the typesafe version from `@adonisjs/inertia`.

```ts
// ❌ Warning: Prefer importing Link from @adonisjs/inertia/react for typesafe routing
import { Link } from '@inertiajs/react'
```

```ts
// ✅ Correct
import { Link } from '@adonisjs/inertia/react'
```

## `prefer-adonisjs-inertia-form`

> [!NOTE]
> This rule is for AdonisJS 7+ projects using `@adonisjs/inertia` v4+. You must enable it manually.

The `@adonisjs/prefer-adonisjs-inertia-form` rule warns when you import the `Form` component from `@inertiajs/react` or `@inertiajs/vue3` instead of using the typesafe version from `@adonisjs/inertia`.

```ts
// ❌ Warning: Prefer importing Form from @adonisjs/inertia/react for typesafe routing
import { Form } from '@inertiajs/react'
```

```ts
// ✅ Correct
import { Form } from '@adonisjs/inertia/react'
```

## `no-backend-import-in-frontend`

The `@adonisjs/no-backend-import-in-frontend` rule prevents importing backend code in your frontend files located in the `inertia/` directory.

The rule detects both:

- **Subpath imports** (`#models/user`) - automatically reads your `package.json` imports field
- **Relative imports** (`../../app/models/user`) - checks if the resolved path is outside `inertia/`

```ts
// inertia/pages/users.tsx

// ❌ Error: Importing backend code in frontend files is not allowed
import User from '#models/user'
import { UserService } from '../../app/services/user_service'
```

```ts
// inertia/pages/users.tsx

// ✅ Correct - type-only imports are allowed
import type { User } from '#models/user'
import type { UserService } from '../../app/services/user_service'

// ✅ Correct - imports pointing to inertia/ are allowed
import { Button } from '#components/button' // if #components/* -> ./inertia/components/*
import { utils } from '../utils'
```

### Sharing code between frontend and backend

If you have shared code (e.g., enums, constants, utility types) in your backend that you want to import in your frontend, you can use the `allowed` option to whitelist specific paths:

```ts
// eslint.config.js
export default [
  {
    rules: {
      '@adonisjs/no-backend-import-in-frontend': [
        'error',
        {
          allowed: [
            '#shared/*', // allows #shared/enums, #shared/constants, etc.
            '#shared/**', // allows #shared/utils/helpers (deep nested)
            '#enums', // exact match
          ],
        },
      ],
    },
  },
]
```

The `allowed` option uses [micromatch](https://github.com/micromatch/micromatch) for glob pattern matching.

```ts
// inertia/pages/users.tsx

// ✅ Correct - #shared/* is in the allowed list
import { UserStatus } from '#shared/enums'
```

<div align="center">
  <sub>Built with ❤︎ by <a href="https://github.com/Julien-R44">Julien Ripouteau</a> and <a href="https://github.com/thetutlage">Harminder Virk</a>
</div>

[gh-workflow-image]: https://img.shields.io/github/actions/workflow/status/adonisjs/eslint-plugin-adonisjs/checks.yml?style=for-the-badge
[gh-workflow-url]: https://github.com/adonisjs/eslint-plugin-adonisjs/actions/workflows/checks.yml 'Github action'
[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]: "typescript"
[npm-image]: https://img.shields.io/npm/v/@adonisjs/eslint-plugin/latest.svg?style=for-the-badge&logo=npm
[npm-url]: https://www.npmjs.com/package/@adonisjs/eslint-plugin/v/latest 'npm'
[license-url]: LICENSE.md
[license-image]: https://img.shields.io/github/license/adonisjs/eslint-plugin-adonisjs?style=for-the-badge
