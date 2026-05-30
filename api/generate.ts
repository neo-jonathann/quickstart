function readJsonBody(req: any) {
  if (req?.body && typeof req.body === 'object') return req.body
  if (typeof req?.body === 'string') return JSON.parse(req.body)
  return {}
}

function safeJsonParse(s: string) {
  try {
    return JSON.parse(s)
  } catch {
    const start = s.indexOf('{')
    const end = s.lastIndexOf('}')
    if (start >= 0 && end > start) return JSON.parse(s.slice(start, end + 1))
    throw new Error('Invalid JSON returned by model')
  }
}

function uuidV4() {
  if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16)
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Allow', 'POST')
    res.end('Method Not Allowed')
    return
  }

  const { ticker } = readJsonBody(req)

  if (typeof ticker !== 'string' || !/^[A-Z0-9.\-]{1,10}$/.test(ticker)) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Invalid ticker' }))
    return
  }

  const openaiKey = process.env.OPENAI_API_KEY
  const pixverseKey = process.env.PIXVERSE_API_KEY

  if (!openaiKey) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }))
    return
  }

  if (!pixverseKey) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Missing PIXVERSE_API_KEY' }))
    return
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a financial educator. Return only valid JSON. Do not provide investment advice. Use neutral wording and include a short disclaimer.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            task: 'Create a short explainer deck + narration script for a stock ticker.',
            ticker,
            output: {
              title: 'string',
              disclaimer: 'string',
              narration: '30-45 second voiceover script as one paragraph',
              slides: [{ heading: 'string', bullets: ['string'] }],
              pixverse_prompt:
                'string prompt for a motion-graphics explainer video based on the narration',
            },
            constraints: {
              slides: 6,
              bullets_per_slide: '3-5',
            },
          }),
        },
      ],
    }),
  })

  if (!openaiRes.ok) {
    const errText = await openaiRes.text().catch(() => '')
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'OpenAI request failed', details: errText }))
    return
  }

  const openaiJson: any = await openaiRes.json()
  const content = openaiJson?.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'OpenAI returned empty content' }))
    return
  }

  const deck = safeJsonParse(content)
  const pixversePrompt =
    typeof deck?.pixverse_prompt === 'string' && deck.pixverse_prompt.trim()
      ? deck.pixverse_prompt.trim()
      : `Create a clean motion-graphics explainer video about ${ticker}. Use a modern financial dashboard style.`
  const pixversePromptSafe = pixversePrompt.length > 4500 ? pixversePrompt.slice(0, 4500) : pixversePrompt

  const traceId = uuidV4()

  const pixverseRes = await fetch(
    'https://app-api.pixverse.ai/openapi/v2/video/text/generate',
    {
      method: 'POST',
      headers: {
        'API-KEY': pixverseKey,
        'Ai-trace-id': traceId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aspect_ratio: '16:9',
        duration: 5,
        model: 'v6',
        prompt: pixversePromptSafe,
        quality: '720p',
        seed: 0,
      }),
    },
  )

  if (!pixverseRes.ok) {
    const errText = await pixverseRes.text().catch(() => '')
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Pixverse request failed', details: errText }))
    return
  }

  const pixverseJson: any = await pixverseRes.json()
  const errCode = pixverseJson?.ErrCode
  const errMsg = pixverseJson?.ErrMsg
  if (typeof errCode === 'number' && errCode !== 0) {
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        error: `Pixverse error ${errCode}${typeof errMsg === 'string' && errMsg ? `: ${errMsg}` : ''}`,
        pixverse: { ErrCode: errCode, ErrMsg: errMsg },
      }),
    )
    return
  }

  const videoId = pixverseJson?.Resp?.video_id
  if (typeof videoId !== 'number' && typeof videoId !== 'string') {
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        error: 'Pixverse returned no video_id',
        pixverse: { ErrCode: errCode, ErrMsg: errMsg },
      }),
    )
    return
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify({ ticker, deck, video_id: videoId, trace_id: traceId }))
}
