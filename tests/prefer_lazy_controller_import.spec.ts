/*
 * @adonisjs/eslint-plugin
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuleTester } from '@typescript-eslint/rule-tester'
import rule from '../src/rules/prefer_lazy_controller_import.js'

const valids = [
  {
    name: 'Lazy import',
    code: `
      import router from "@adonisjs/core/services/router"
      const lazyController = () => import("./controller")

      router.get("/", "HomeController.index")
      router.get("/test", [lazyController, 'index'])
    `,
  },
  {
    name: 'Lazy import with middleware',
    code: `import router from "@adonisjs/core/services/router"
  import middleware from '#start/middleware'

  const lazyController = () => import("./controller")

  router.get("/", "HomeController.index").middleware(middleware.auth())
  router.get("/test", [lazyController, 'index']).middleware(middleware.auth())`,
  },
]

const invalids = [
  {
    name: 'Import expression',
    code: `
    import router from "@adonisjs/core/services/router"
    import HomeController from "./controller"

    router.group(() => {
      router.get("/", [HomeController, 'index'])
    })
    `,
    output: `
    import router from "@adonisjs/core/services/router"
    const HomeController = () => import("./controller")

    router.group(() => {
      router.get("/", [HomeController, 'index'])
    })
    `,
    errors: [{ messageId: 'preferLazyControllerImport' as const }],
  },
  {
    name: 'Import expression with resource',
    code: `
    import router from "@adonisjs/core/services/router"
    import ProjectThreadsController from "./controller"

    router.resource("project/:id/threads", ProjectThreadsController)
    `,
    output: `
    import router from "@adonisjs/core/services/router"
    const ProjectThreadsController = () => import("./controller")

    router.resource("project/:id/threads", ProjectThreadsController)
    `,
    errors: [{ messageId: 'preferLazyControllerImport' as const }],
  },
]

const ruleTester = new RuleTester()
ruleTester.run('prefer-lazy-controller-import', rule, {
  valid: valids,
  invalid: invalids,
})
