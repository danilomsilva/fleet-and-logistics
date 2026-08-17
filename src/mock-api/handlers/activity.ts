import { http, HttpResponse } from 'msw'
import { db } from '../db'
import { applySort, paginate, parsePageParams, randomDelay } from './query-utils'
import type { ActivityEvent } from '../schemas/activity'

function applyRelatedEntityFilter(items: ActivityEvent[], url: URL): ActivityEvent[] {
  const kind = url.searchParams.get('entityKind')
  const id = url.searchParams.get('entityId')
  if (!kind && !id) return items

  return items.filter(
    (item) => (!kind || item.relatedEntity.kind === kind) && (!id || item.relatedEntity.id === id),
  )
}

export const activityHandlers = [
  http.get('/api/activity', async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)

    let items: ActivityEvent[] = [...db.activity]
    items = applyRelatedEntityFilter(items, url)
    items = applySort(items, url, ['timestamp'])
    if (!url.searchParams.get('sort')) {
      items = [...items].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    }

    return HttpResponse.json(paginate(items, parsePageParams(url)))
  }),
]
