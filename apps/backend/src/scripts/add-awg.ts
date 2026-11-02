import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { createProductsWorkflow, updateStoresWorkflow } from '@medusajs/medusa/core-flows'

// Reproduces the AWG bug: AWG is not in `defaultCurrencies`, and no public API adds a currency,
// so this makes the same internal call as the currency module's startup loader.
export default async function addAwg({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const { currencyService_ } = container.resolve(Modules.CURRENCY) as unknown as {
    currencyService_: { upsert: (data: Record<string, unknown>[]) => Promise<unknown> }
  }
  await currencyService_.upsert([
    {
      code: 'awg',
      symbol: 'Afl.',
      symbol_native: 'Afl.',
      name: 'Aruban Florin',
      decimal_digits: 2,
      rounding: 0,
    },
  ])

  const [store] = await container.resolve(Modules.STORE).listStores()
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { supported_currencies: [{ currency_code: 'awg', is_default: true }] },
    },
  })

  const { result } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'AWG product',
          options: [{ title: 'Default', values: ['Default'] }],
          variants: [
            {
              title: 'Default',
              options: { Default: 'Default' },
              prices: [{ currency_code: 'awg', amount: 10 }],
            },
          ],
        },
      ],
    },
  })

  logger.info(`AWG added. Open /app/products/${result[0].id}/prices in the admin.`)
}
