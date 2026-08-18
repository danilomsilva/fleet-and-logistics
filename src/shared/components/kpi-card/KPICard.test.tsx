import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Truck } from 'lucide-react'
import { axe } from 'vitest-axe'
import { KPICard } from './KPICard'

describe('KPICard', () => {
  it('renders the label and value', () => {
    render(<KPICard label="Active vehicles" value={24} />)
    expect(screen.getByText('Active vehicles')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
  })

  it('renders without a trend or icon', () => {
    render(<KPICard label="Active vehicles" value={24} />)
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })

  it('renders the trend value and an optional icon', () => {
    render(
      <KPICard
        label="Active vehicles"
        value={24}
        icon={Truck}
        trend={{ direction: 'up', value: '+3 this week', sentiment: 'positive' }}
      />,
    )
    expect(screen.getByText('+3 this week')).toBeInTheDocument()
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <KPICard
        label="Deliveries delayed"
        value={5}
        icon={Truck}
        trend={{ direction: 'up', value: '+2 today', sentiment: 'negative' }}
      />,
    )
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
