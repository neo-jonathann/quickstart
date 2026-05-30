import { useState } from 'react'
import './App.css'

const AAPL_DRIVE_FILE_ID = '1V83vQZdX78ZvRlnDUbBbu9rYNWtBxzcs'
const AAPL_VIDEO_URL = `https://drive.google.com/uc?export=download&id=${AAPL_DRIVE_FILE_ID}`
const AAPL_DRIVE_VIEW_URL = `https://drive.google.com/file/d/${AAPL_DRIVE_FILE_ID}/view`

function App() {
  const [ticker, setTicker] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  function onGenerate() {
    const t = ticker.trim().toUpperCase()
    if (!t) return

    setErr(null)
    setVideoUrl(null)

    if (t !== 'AAPL') {
      setErr('Only AAPL is available right now. Try AAPL.')
      return
    }

    setVideoUrl(AAPL_VIDEO_URL)
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
          <button className="primary" type="submit" disabled={!ticker.trim()}>
            Get video
          </button>
        </form>

        <div className="hint">Available: AAPL</div>

        {err && <div className="err">{err}</div>}

        {videoUrl && (
          <div className="result">
            <a className="download" href={videoUrl} download target="_blank" rel="noreferrer">
              Download video
            </a>
            <a className="download" href={AAPL_DRIVE_VIEW_URL} target="_blank" rel="noreferrer">
              Open in Google Drive
            </a>
          </div>
        )}
      </div>
    </>
  )
}

export default App
