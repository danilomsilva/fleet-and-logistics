import { test, expect } from '@playwright/test'

test('app boots and renders the FleetOS heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'FleetOS' })).toBeVisible()
})
