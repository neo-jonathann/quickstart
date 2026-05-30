import { useState } from 'react'
import './App.css'

function App() {
  const [ticker, setTicker] = useState('')

  return (
    <>
      <div className="page">
        <header className="top">
          <h1>Quickstart</h1>
          <p>Enter a ticker symbol to generate a 30+ second explainer video.</p>
        </header>

        <form className="bar" onSubmit={(e) => e.preventDefault()}>
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
            Generate video
          </button>
        </form>

        <div className="hint">Examples: AAPL, TSLA, NVDA, SPY</div>
      </div>
    </>
  )
}

export default App
