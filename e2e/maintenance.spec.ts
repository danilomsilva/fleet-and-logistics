import { test, expect } from '@playwright/test'

test('Maintenance table renders and the status filter narrows results', async ({ page }) => {
  await page.goto('/maintenance')
  await expect(page.getByRole('columnheader', { name: 'Record ID' })).toBeVisible()

  await page.getByRole('combobox', { name: 'Filter by status' }).click()
  await page.getByRole('option', { name: 'due', exact: true }).click()
  await expect(page).toHaveURL(/status=due/)
})

test('starting a due maintenance record moves it to in progress, then completing it finishes the flow', async ({
  page,
}) => {
  await page.goto('/maintenance')
  await expect(page.getByRole('columnheader', { name: 'Record ID' })).toBeVisible()

  const target = await page.evaluate(async () => {
    const res = await fetch('/api/maintenance?status=due&pageSize=1')
    const data = await res.json()
    return data.data[0]?.id ?? null
  })
  expect(target).not.toBeNull()

  await page.goto(`/maintenance/${target}`)
  await page.getByRole('button', { name: 'Start' }).click()
  await expect(page.getByText(/started/)).toBeVisible()

  await page.getByRole('button', { name: 'Mark complete' }).click()
  await expect(page.getByText(/marked complete/)).toBeVisible()
})
