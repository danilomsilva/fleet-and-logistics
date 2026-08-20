import { describe, expect, it } from 'vitest'
import { computeServiceRecordStatus, computeVehicleServiceStatus } from './service-status'

const TODAY = new Date('2026-08-19T12:00:00.000Z')

function daysFromToday(days: number): string {
  const date = new Date(TODAY)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

describe('computeVehicleServiceStatus', () => {
  it('is overdue when the next service date is today', () => {
    const status = computeVehicleServiceStatus({ nextServiceDate: daysFromToday(0) }, TODAY)
    expect(status).toBe('overdue')
  })

  it('is overdue when the next service date is in the past', () => {
    const status = computeVehicleServiceStatus({ nextServiceDate: daysFromToday(-5) }, TODAY)
    expect(status).toBe('overdue')
  })

  it('is due soon between tomorrow and 30 days out', () => {
    expect(computeVehicleServiceStatus({ nextServiceDate: daysFromToday(1) }, TODAY)).toBe(
      'due_soon',
    )
    expect(computeVehicleServiceStatus({ nextServiceDate: daysFromToday(30) }, TODAY)).toBe(
      'due_soon',
    )
  })

  it('is OK beyond 30 days out', () => {
    const status = computeVehicleServiceStatus({ nextServiceDate: daysFromToday(31) }, TODAY)
    expect(status).toBe('up_to_date')
  })

  it('is OK when there is no next service date', () => {
    const status = computeVehicleServiceStatus({ nextServiceDate: null }, TODAY)
    expect(status).toBe('up_to_date')
  })
})

describe('computeServiceRecordStatus', () => {
  it('is due when the scheduled date is today', () => {
    const status = computeServiceRecordStatus(
      { status: 'scheduled', scheduledDate: daysFromToday(0) },
      TODAY,
    )
    expect(status).toBe('due')
  })

  it('is due when the scheduled date is in the past', () => {
    const status = computeServiceRecordStatus(
      { status: 'scheduled', scheduledDate: daysFromToday(-5) },
      TODAY,
    )
    expect(status).toBe('due')
  })

  it('is due between tomorrow and 30 days out', () => {
    expect(
      computeServiceRecordStatus({ status: 'scheduled', scheduledDate: daysFromToday(1) }, TODAY),
    ).toBe('due')
    expect(
      computeServiceRecordStatus({ status: 'scheduled', scheduledDate: daysFromToday(30) }, TODAY),
    ).toBe('due')
  })

  it('is scheduled beyond 30 days out', () => {
    const status = computeServiceRecordStatus(
      { status: 'scheduled', scheduledDate: daysFromToday(31) },
      TODAY,
    )
    expect(status).toBe('scheduled')
  })

  it('leaves in-progress and completed records untouched regardless of date', () => {
    expect(
      computeServiceRecordStatus(
        { status: 'in_progress', scheduledDate: daysFromToday(-100) },
        TODAY,
      ),
    ).toBe('in_progress')
    expect(
      computeServiceRecordStatus(
        { status: 'completed', scheduledDate: daysFromToday(-100) },
        TODAY,
      ),
    ).toBe('completed')
  })
})
