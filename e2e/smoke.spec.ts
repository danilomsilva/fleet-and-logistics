import { test, expect } from '@playwright/test'

const NAV_ITEMS: [label: string, path: string][] = [
  ['Dashboard', '/'],
  ['Dispatch', '/dispatch'],
  ['Deliveries', '/deliveries'],
  ['Vehicles', '/vehicles'],
  ['Drivers', '/drivers'],
  ['Maintenance', '/maintenance'],
  ['Alerts', '/alerts'],
]

test('app boots and renders the Dashboard by default', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
})

for (const [label, path] of NAV_ITEMS) {
  test(`sidebar navigation reaches ${label}`, async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: label }).click()
    await expect(page.getByRole('heading', { name: label })).toBeVisible()
    await expect(page).toHaveURL(path)
  })
}

test.describe('mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('sidebar is hidden and the drawer opens via the Topbar toggle', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeHidden()
    await expect(page.getByRole('button', { name: /open navigation menu/i })).toBeVisible()

    await page.getByRole('button', { name: /open navigation menu/i }).click()
    await expect(page.getByRole('link', { name: 'Vehicles' })).toBeVisible()
  })

  test('navigating from the drawer closes it', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /open navigation menu/i }).click()

    await page.getByRole('link', { name: 'Vehicles' }).click()

    await expect(page.getByRole('heading', { name: 'Vehicles' })).toBeVisible()
    await expect(page).toHaveURL('/vehicles')
    await expect(page.getByRole('link', { name: 'Vehicles' })).toBeHidden()
  })
})
