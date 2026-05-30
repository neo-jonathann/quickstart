import { useState } from 'react'
import './App.css'

const AAPL_DRIVE_FILE_ID = '1V83vQZdX78ZvRlnDUbBbu9rYNWtBxzcs'
const AAPL_VIDEO_URL = `https://drive.google.com/uc?export=download&id=${AAPL_DRIVE_FILE_ID}`
function App() {
  const [ticker, setTicker] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  async function onGenerate() {
    const t = ticker.trim().toUpperCase()
    if (!t) return

    setErr(null)
    setVideoUrl(null)

    if (t !== 'AAPL') {
      setErr('Please try again.')
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 3000))
    setVideoUrl(AAPL_VIDEO_URL)
    setLoading(false)
  }

  return (
    <>
      <div className="page">
        <header className="top">
          <h1>Quickstart</h1>
          <p>Enter a ticker symbol to get a prepared explainer video.</p>
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
            {loading ? 'Generating…' : 'Get video'}
          </button>
        </form>

        {err && <div className="err">{err}</div>}
        {loading && !err && <div className="meta">Generating now. Please wait</div>}

        {videoUrl && (
          <div className="result">
            <a className="download" href={videoUrl} download target="_blank" rel="noreferrer">
              Download video
            </a>
          </div>
        )}
      </div>
    </>
  )
}

export default App
