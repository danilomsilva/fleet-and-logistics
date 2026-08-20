import { test, expect } from '@playwright/test'

test('Dashboard renders KPIs and widgets, and the chart period toggle switches selection', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.getByText('Vehicles requiring service')).toBeVisible()
  await expect(page.getByText('Available drivers')).toBeVisible()
  await expect(page.getByText('Deliveries delayed')).toBeVisible()
  await expect(page.getByText('Deliveries today')).toBeVisible()
  await expect(page.getByText('Fleet status')).toBeVisible()
  await expect(page.getByText('Top alerts')).toBeVisible()
  await expect(page.getByText('Driver availability')).toBeVisible()
  await expect(page.getByText('Services by status')).toBeVisible()
  await expect(page.getByText('Recent activity')).toBeVisible()

  const sevenDay = page.getByRole('button', { name: '7d' })
  const thirtyDay = page.getByRole('button', { name: '30d' })
  await expect(sevenDay).toHaveAttribute('aria-pressed', 'true')

  await thirtyDay.click()
  await expect(thirtyDay).toHaveAttribute('aria-pressed', 'true')
  await expect(sevenDay).toHaveAttribute('aria-pressed', 'false')
})
