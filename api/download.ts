const AAPL_DRIVE_FILE_ID = '1V83vQZdX78ZvRlnDUbBbu9rYNWtBxzcs'
const AAPL_DRIVE_DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${AAPL_DRIVE_FILE_ID}`

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET')
    res.end('Method Not Allowed')
    return
  }

  const tickerRaw = req?.query?.ticker
  const ticker = typeof tickerRaw === 'string' ? tickerRaw.trim().toUpperCase() : ''

  if (!ticker) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Missing ticker')
    return
  }

  if (ticker !== 'AAPL') {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Video not found')
    return
  }

  res.statusCode = 302
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Location', AAPL_DRIVE_DOWNLOAD_URL)
  res.end()
}

