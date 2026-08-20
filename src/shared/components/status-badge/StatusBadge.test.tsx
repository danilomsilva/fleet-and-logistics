import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CheckCircle2 } from 'lucide-react'
import { axe } from 'vitest-axe'
import { StatusBadge, type StatusTone } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders the label text', () => {
    render(<StatusBadge label="Available" tone="success" />)
    expect(screen.getByText('Available')).toBeInTheDocument()
  })

  it('renders an icon when provided', () => {
    const { container } = render(
      <StatusBadge label="Delivered" tone="success" icon={CheckCircle2} />,
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('always renders visible text regardless of tone, so status is never color-only', () => {
    const tones: StatusTone[] = ['neutral', 'info', 'success', 'warning', 'danger']
    for (const tone of tones) {
      const { unmount } = render(<StatusBadge label={`Status ${tone}`} tone={tone} />)
      expect(screen.getByText(`Status ${tone}`)).toBeVisible()
      unmount()
    }
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <StatusBadge label="Service due" tone="warning" icon={CheckCircle2} />,
    )
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
