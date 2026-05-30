import { useState } from 'react'
import './App.css'

const AAPL_VIDEO_URL = `/api/download?ticker=AAPL`

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

        <section className="metrics" aria-label="System metrics">
          <div className="metricCard">
            <div className="metricTop">
              <div className="metricLabel">Model Response Time</div>
              <span className="pulseDot" aria-hidden="true" />
            </div>
            <div className="metricValue">124ms</div>
          </div>
          <div className="metricCard">
            <div className="metricTop">
              <div className="metricLabel">Token Efficiency</div>
              <span className="metricIcon cyan" aria-hidden="true" />
            </div>
            <div className="metricValue">98.4%</div>
          </div>
          <div className="metricCard">
            <div className="metricTop">
              <div className="metricLabel">Active Session</div>
              <span className="metricIcon violet" aria-hidden="true" />
            </div>
            <div className="metricValue">Phi-4-mini</div>
          </div>
        </section>

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
            </div>

            <a className="downloadBtn" href={videoUrl} download target="_blank" rel="noreferrer">
              Download video
            </a>
          </section>
        )}

        <section className="console" aria-label="Live stream console">
          <div className="consoleHeader">
            <div className="consoleTitle">Live Stream Console</div>
            <div className="consoleHint">telemetry / logs</div>
          </div>
          <div className="consoleBody">
            <div className="logLine">
              <span className="logLevel info">[info]</span> Connected to Phi Quickstart Edge
              API...
            </div>
            <div className="logLine">
              <span className="logLevel success">[success]</span> System handshake complete.
              Context window optimized.
            </div>
            <div className="logLine">
              <span className="logLevel idle">[idle]</span> Awaiting user prompt...
            </div>
            {loading && (
              <div className="logLine">
                <span className="logLevel info">[info]</span> Executing generation pipeline...
              </div>
            )}
            {videoUrl && (
              <div className="logLine">
                <span className="logLevel success">[success]</span> Artifact ready. Download
                authorized.
              </div>
            )}
            {err && (
              <div className="logLine">
                <span className="logLevel error">[error]</span> Validation failed. Request
                rejected.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
