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
      setErr('Only AAPL is available right now. Try AAPL.')
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 3000))
    setVideoUrl(AAPL_VIDEO_URL)
    setLoading(false)
  }

  return (
    <div className="shell">
      <header className="appHeader">
        <div className="brand">
          <div className="logoMark" aria-hidden="true" />
          <div className="brandText">
            <div className="brandName">Quickstart</div>
            <div className="brandTag">Ticker explainer video console</div>
          </div>
        </div>
        <div className="status">
          <span className="statusDot" aria-hidden="true" />
          <span className="statusText">System Status: Online</span>
        </div>
      </header>

      <main className="glass">
        <div className="hero">
          <h1 className="title">Generate an explainer</h1>
          <p className="subtitle">
            Enter a ticker symbol. The system simulates generation, then unlocks a download.
          </p>
        </div>

        <form
          className="commandRow"
          onSubmit={(e) => {
            e.preventDefault()
            onGenerate()
          }}
        >
          <div className="terminalField">
            <div className="terminalPrefix" aria-hidden="true">
              $
            </div>
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
          </div>
          <button className="primary" type="submit" disabled={!ticker.trim() || loading}>
            {loading ? 'Generating…' : 'Run'}
          </button>
        </form>

        {err && (
          <div className="notice error">
            <div className="noticeTitle">Request rejected</div>
            <div className="noticeBody">{err}</div>
          </div>
        )}

        {loading && !err && (
          <div className="notice">
            <div className="noticeTitle">Generating now. Please wait</div>
            <div className="skeleton">
              <div className="shimmer line w80" />
              <div className="shimmer line w65" />
              <div className="shimmer line w90" />
            </div>
          </div>
        )}

        {videoUrl && (
          <section className="output">
            <div className="outputHeader">
              <div>
                <div className="outputTitle">Result</div>
                <div className="outputSub">Download is unlocked.</div>
              </div>
              <button
                className="ghost"
                type="button"
                onClick={() => navigator.clipboard.writeText(videoUrl)}
              >
                Copy URL
              </button>
            </div>

            <div className="codeBlock">
              <div className="codeLine">
                <span className="codeLabel">download_url</span>
                <span className="codeValue">{videoUrl}</span>
              </div>
            </div>

            <a className="downloadBtn" href={videoUrl} download target="_blank" rel="noreferrer">
              Download video
            </a>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
