export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET')
    res.end('Method Not Allowed')
    return
  }

  const pixverseKey = process.env.PIXVERSE_API_KEY
  if (!pixverseKey) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Missing PIXVERSE_API_KEY' }))
    return
  }

  const videoId = req?.query?.video_id
  const traceId = req?.query?.trace_id

  if (!videoId || typeof traceId !== 'string' || !traceId.trim()) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Missing video_id or trace_id' }))
    return
  }

  const pixverseRes = await fetch(
    `https://app-api.pixverse.ai/openapi/v2/video/result/${encodeURIComponent(String(videoId))}`,
    {
      method: 'GET',
      headers: {
        'API-KEY': pixverseKey,
        'Ai-trace-id': traceId,
      },
    },
  )

  if (!pixverseRes.ok) {
    const errText = await pixverseRes.text().catch(() => '')
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Pixverse status request failed', details: errText }))
    return
  }

  const pixverseJson: any = await pixverseRes.json()
  const status = pixverseJson?.Resp?.status
  const url = pixverseJson?.Resp?.url

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify({ status, url, raw: pixverseJson }))
}

