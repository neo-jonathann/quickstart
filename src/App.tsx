import { useState } from 'react'
import './App.css'

function App() {
  const [ticker, setTicker] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'starting' | 'rendering' | 'ready' | 'error'>(
    'idle',
  )
  const [err, setErr] = useState<string | null>(null)
  const [deck, setDeck] = useState<any>(null)
  const [videoId, setVideoId] = useState<string | number | null>(null)
  const [traceId, setTraceId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  async function onGenerate() {
    const t = ticker.trim().toUpperCase()
    if (!t) return

    setErr(null)
    setDeck(null)
    setVideoId(null)
    setTraceId(null)
    setVideoUrl(null)
    setStatus('starting')
    setLoading(true)

    try {
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: t }),
      })
      const j = await r.json().catch(() => null)
      if (!r.ok) throw new Error(j?.error || 'Failed to start generation')

      setDeck(j.deck)
      setVideoId(j.video_id)
      setTraceId(j.trace_id)
      setStatus('rendering')

      const maxAttempts = 60
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, 5000))
        const s = await fetch(
          `/api/status?video_id=${encodeURIComponent(String(j.video_id))}&trace_id=${encodeURIComponent(
            String(j.trace_id),
          )}`,
        )
        const sj = await s.json().catch(() => null)
        if (!s.ok) throw new Error(sj?.error || 'Failed to fetch status')

        if (sj?.status === 1 && typeof sj?.url === 'string' && sj.url) {
          setVideoUrl(sj.url)
          setStatus('ready')
          return
        }

        if (sj?.status === 7) throw new Error('Pixverse moderation failed')
        if (sj?.status === 8) throw new Error('Pixverse generation failed')
      }

      throw new Error('Timed out waiting for video')
    } catch (e: any) {
      setStatus('error')
      setErr(e?.message ?? 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page">
        <header className="top">
          <h1>Quickstart</h1>
          <p>Enter a ticker symbol to generate a 30+ second explainer video.</p>
        </header>

        <form
          className="bar"
          onSubmit={(e) => {
            e.preventDefault()
            onGenerate()
          }}
        >
          <input
            className="tickerInput"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            placeholder="AAPL"
            value={ticker}
            onChange={(e) =>
              setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9.\-]/g, ''))
            }
          />
          <button className="primary" type="submit" disabled={!ticker.trim() || loading}>
            {loading ? 'Working…' : 'Generate video'}
          </button>
        </form>

        <div className="hint">Examples: AAPL, TSLA, NVDA, SPY</div>

        {err && <div className="err">{err}</div>}

        {status !== 'idle' && status !== 'error' && (
          <div className="meta">
            Status: {status}
            {videoId != null && <span> · video_id: {String(videoId)}</span>}
            {traceId && <span> · trace_id: {traceId}</span>}
          </div>
        )}

        {videoUrl && (
          <div className="result">
            <a className="download" href={videoUrl} download target="_blank" rel="noreferrer">
              Download video
            </a>
            <video className="player" controls src={videoUrl} />
          </div>
        )}

        {deck && (
          <details className="deck">
            <summary>View generated deck</summary>
            <pre>{JSON.stringify(deck, null, 2)}</pre>
          </details>
        )}
      </div>
    </>
  )
}

export default App
