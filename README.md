# AWG missing from Medusa's default currencies

A stock `create-medusa-app` project on Medusa 2.21.2, plus one script:
[`apps/backend/src/scripts/add-awg.ts`](apps/backend/src/scripts/add-awg.ts).

AWG (Aruban florin) is not in `defaultCurrencies`, and the currency module has no public way to add
a currency. The script adds it the same way the module's startup loader adds the built-in list, sets
it as the store's currency, and creates a product with an AWG price.

## Reproduce

Needs Node 22+, Postgres and Redis.

```sh
npm install
cp apps/backend/.env.template apps/backend/.env   # set DATABASE_URL and REDIS_URL
cd apps/backend
npx medusa db:migrate
npx medusa exec ./src/scripts/add-awg.ts
npx medusa user -e admin@example.com -p supersecret
npm run dev
```

Log in at http://localhost:9000/app and open the URL the script logs:
`/app/products/<id>/prices`.

**Expected:** the price editor shows the AWG price.

**Actual:** "An error occurred", with
`TypeError: Cannot read properties of undefined (reading 'symbol_native')`.
