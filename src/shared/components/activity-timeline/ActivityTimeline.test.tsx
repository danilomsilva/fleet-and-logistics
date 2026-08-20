import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { axe } from 'vitest-axe'
import type { ActivityEvent } from '@/mock-api/schemas/activity'
import { ActivityTimeline } from './ActivityTimeline'

const EVENTS: ActivityEvent[] = [
  {
    id: 'ACT-0001',
    type: 'delivery_assigned',
    relatedEntity: { kind: 'delivery', id: 'DEL-1000' },
    description: 'Delivery assigned to driver and vehicle',
    timestamp: '2026-08-17T14:30:00.000Z',
  },
  {
    id: 'ACT-0002',
    type: 'vehicle_entered_service',
    relatedEntity: { kind: 'vehicle', id: 'VH-001' },
    description: 'Vehicle entered service',
    timestamp: '2026-08-17T09:00:00.000Z',
  },
]

function renderTimeline(events: ActivityEvent[] = EVENTS, readOnly = false) {
  return render(
    <MemoryRouter>
      <ActivityTimeline events={events} readOnly={readOnly} />
    </MemoryRouter>,
  )
}

describe('ActivityTimeline', () => {
  it('renders one entry per event with its description', () => {
    renderTimeline()
    expect(screen.getByText('Delivery assigned to driver and vehicle')).toBeInTheDocument()
    expect(screen.getByText('Vehicle entered service')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('links each event to its related entity', () => {
    renderTimeline()
    expect(
      screen.getByText('Delivery assigned to driver and vehicle').closest('a'),
    ).toHaveAttribute('href', '/deliveries/DEL-1000')
    expect(screen.getByText('Vehicle entered service').closest('a')).toHaveAttribute(
      'href',
      '/vehicles/VH-001',
    )
  })

  it('renders plain, non-interactive rows when readOnly (no link, no href)', () => {
    renderTimeline(EVENTS, true)
    expect(screen.getByText('Delivery assigned to driver and vehicle').closest('a')).toBeNull()
    expect(screen.getByText('Vehicle entered service').closest('a')).toBeNull()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('renders an empty list when there are no events', () => {
    renderTimeline([])
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = renderTimeline()
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
