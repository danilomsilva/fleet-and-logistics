import { test, expect } from '@playwright/test'

test('Alerts table renders and the status filter narrows results', async ({ page }) => {
  await page.goto('/alerts')
  await expect(page.getByRole('columnheader', { name: 'Message' })).toBeVisible()

  await page.getByRole('combobox', { name: 'Filter by status' }).click()
  await page.getByRole('option', { name: 'Active', exact: true }).click()
  await expect(page).toHaveURL(/status=active/)
})

test('acknowledging an active alert updates its status, and resolving it completes the flow', async ({
  page,
}) => {
  await page.goto('/alerts')
  await expect(page.getByRole('columnheader', { name: 'Message' })).toBeVisible()

  const category = await page.evaluate(async () => {
    const res = await fetch('/api/alerts?status=active&pageSize=1')
    const alert = (await res.json()).data[0]
    return alert ? (alert.relatedEntity.kind === 'delivery' ? 'delivery' : 'fleet') : null
  })
  expect(category).not.toBeNull()

  await page.goto(`/alerts?status=active&category=${category}`)
  await expect(page.getByRole('columnheader', { name: 'Message' })).toBeVisible()

  const row = page.locator('tbody tr').first()
  await expect(row).toBeVisible()

  await row.getByRole('button', { name: 'Acknowledge' }).click()
  await expect(page.getByText(/acknowledged/)).toBeVisible()

  await row.getByRole('button', { name: 'Resolve' }).click()
  await expect(page.getByText(/resolved/)).toBeVisible()
})

test('clicking an alert message navigates to its related entity', async ({ page }) => {
  await page.goto('/alerts')
  await expect(page.getByRole('columnheader', { name: 'Message' })).toBeVisible()

  const firstLink = page.locator('tbody tr').first().getByRole('link')
  await firstLink.click()
  await expect(page).not.toHaveURL('/alerts')
})
