# FleetOS — Frontend Product Specification

## 1. Product purpose

FleetOS is a fleet and logistics operations dashboard used by a company to manage:

- Vehicles
- Drivers
- Deliveries
- Maintenance
- Dispatch operations
- Operational alerts

The application should feel like a real production SaaS application, not a demo.

The UI should prioritise:

- Efficient data management
- Clear operational status
- Fast navigation
- Responsive layouts
- Accessibility
- Good loading/error/empty states

## 2. Main navigation

Sidebar navigation:

- Dashboard
- Dispatch
- Deliveries
- Vehicles
- Drivers
- Maintenance
- Alerts

User/profile menu at the bottom.

The sidebar should collapse on smaller screens.

## 3. Dashboard

The dashboard provides an operational overview.

### KPI cards

Show:

- Active vehicles
- Deliveries today
- Deliveries delayed
- Available drivers
- Vehicles requiring maintenance

Each KPI should show a relevant trend/change where appropriate.

### Delivery overview

Chart showing deliveries by status:

- Pending
- Assigned
- In transit
- Delivered
- Delayed

Allow changing the time period:

- Today
- 7 days
- 30 days

### Fleet status

Show vehicles grouped by:

- Available
- In use
- Maintenance
- Offline

### Recent activity

Timeline containing events such as:

- Delivery assigned
- Vehicle entered maintenance
- Driver completed delivery
- Delivery became delayed

Clicking an activity should navigate to the relevant entity.

### Alerts

Show the most important active alerts with priority indicators.

## 4. Vehicles

This is one of the main data-management screens.

### Vehicle table

Columns:

- Vehicle
- Registration
- Type
- Driver
- Status
- Location
- Mileage
- Next service
- Last updated

Features:

- Search
- Sorting
- Filtering
- Pagination
- Column visibility
- Row selection
- Bulk actions

Filters:

- Status
- Vehicle type
- Driver
- Maintenance status

### Vehicle detail

Clicking a vehicle opens its detail page.

Sections:

**Overview**

- Vehicle information
- Current status
- Current location
- Assigned driver
- Mileage

**Maintenance**

- Service history
- Next service
- Maintenance status

**Delivery history**

- Previous deliveries
- Status
- Dates

**Activity**

- Chronological vehicle events.

## 5. Drivers

### Driver table

Columns:

- Name
- Status
- Assigned vehicle
- Deliveries today
- Completed deliveries
- Availability
- Last active

Features should mirror the vehicle table.

### Driver detail

Show:

- Profile
- Current assignment
- Today's deliveries
- Delivery history
- Availability
- Activity

Driver statuses:

- Available
- Driving
- On break
- Offline

## 6. Deliveries

This should be the largest data-heavy screen.

### Delivery table

Columns:

- Delivery ID
- Customer
- Pickup
- Destination
- Driver
- Vehicle
- Priority
- Status
- ETA
- Scheduled time

Statuses:

- Pending
- Assigned
- In transit
- Delivered
- Delayed
- Cancelled

Features:

- Search
- Sorting
- Filtering
- Pagination
- Column visibility
- Row selection
- Bulk actions

Filters:

- Status
- Priority
- Driver
- Vehicle
- Date
- Destination

Filters should be reflected in the URL so the current view can be bookmarked/shared.

### Delivery detail

Show:

- Pickup and destination
- Customer
- Assigned driver
- Assigned vehicle
- Status
- ETA
- Scheduled time
- Priority
- Notes
- Activity timeline

Actions depend on the delivery state.

For example:

- Pending → Assign
- Assigned → Start delivery
- In transit → Mark delivered
- Any active state → Report delay

Status changes should provide immediate UI feedback.

## 7. Dispatch

This is the application's most visually interesting feature.

Use a map + operational list layout.

### Map

Display:

- Vehicles
- Drivers
- Delivery locations
- Selected delivery

Different markers should represent different states.

### Dispatch panel

Show unassigned deliveries.

Each delivery displays:

- Destination
- Priority
- Scheduled time
- Estimated distance
- Required vehicle type

Dispatcher can select a delivery and assign:

- Driver
- Vehicle

After assignment, the delivery moves from the unassigned list to the active schedule.

### Assignment workflow

```
Select delivery
      ↓
Select driver
      ↓
Select vehicle
      ↓
Review assignment
      ↓
Confirm
```

The UI should prevent obvious conflicts, such as assigning an unavailable driver.

## 8. Maintenance

### Maintenance table

Show:

- Vehicle
- Maintenance type
- Status
- Scheduled date
- Mileage
- Priority

Statuses:

- Scheduled
- Due
- In progress
- Completed

Filters:

- Status
- Vehicle
- Maintenance type
- Date

### Maintenance detail

Show:

- Vehicle
- Issue/service type
- Description
- Scheduled date
- Completion date
- Mileage
- Notes
- Activity history

Actions:

- Schedule maintenance
- Start maintenance
- Complete maintenance

## 9. Alerts

Centralised operational alerts.

Alert types:

- Vehicle maintenance due
- Delivery delayed
- Driver unavailable
- Vehicle offline
- Assignment conflict

Each alert has:

- Priority
- Type
- Related entity
- Timestamp
- Status

Statuses:

- Active
- Acknowledged
- Resolved

Users can:

- Filter
- Search
- Acknowledge
- Resolve

Clicking an alert navigates to the related resource.

## 10. Global UX requirements

Every major screen needs:

**Loading states**

Use skeletons rather than blank screens.

**Empty states**

Explain what is empty and provide an appropriate action where possible.

**Error states**

Display useful errors with retry options.

**Confirmation**

Destructive or important actions should require confirmation where appropriate.

**Toast notifications**

Use for successful mutations and recoverable errors.

Example:

Delivery DEL-1042 assigned successfully.

**Optimistic updates**

Use where the action is safe to optimistically reflect, such as:

- Acknowledging alerts
- Changing certain statuses
- Updating preferences

## 11. Responsive behaviour

Desktop is the primary target because this is an operations application.

Still support tablet/mobile.

On smaller screens:

- Sidebar becomes a drawer
- Tables become horizontally scrollable or switch to card layouts where appropriate
- Dashboard cards stack
- Dispatch map/list becomes vertically stacked
- Forms become single-column

Don't try to force every desktop table into a tiny mobile table.

## 12. Accessibility

Target WCAG 2.2 AA.

Important areas:

- Full keyboard navigation
- Visible focus states
- Correct semantic HTML
- Accessible dialogs
- Accessible dropdowns/comboboxes
- Screen-reader-friendly status indicators
- Form error announcements
- Sufficient contrast
- No information communicated through colour alone

Accessibility should be part of the implementation rather than a final audit.

## 13. Data behaviour

Initially use a mock API/data layer so the frontend behaves like it communicates with a real backend.

The UI should support:

- Pagination
- Filtering
- Sorting
- Searching
- Caching
- Refetching
- Mutations
- Loading states
- Error states
- Empty responses

Avoid putting large static datasets directly inside React components.

## 14. Important portfolio objective

The project should not attempt to implement every possible fleet-management feature.

The goal is to demonstrate that you can build a sophisticated frontend with:

Complex data + state management + reusable components + accessibility + performance + testing + excellent UX.

The most important screens are:

- Dashboard
- Deliveries
- Vehicles
- Dispatch
- Drivers

Maintenance and Alerts support those workflows.
