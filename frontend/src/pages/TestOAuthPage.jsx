import { useEffect, useState } from 'react'

export default function TestOAuthPage() {
  const [params, setParams] = useState({})

  useEffect(() => {
    // Get all URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const allParams = {}
    for (const [key, value] of urlParams) {
      allParams[key] = value
    }
    setParams(allParams)
    console.log('All URL parameters:', allParams)
    console.log('Full URL:', window.location.href)
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>OAuth2 Test Page</h1>
      <h2>URL Parameters:</h2>
      <pre>{JSON.stringify(params, null, 2)}</pre>
      <h2>Full URL:</h2>
      <pre>{window.location.href}</pre>
      <h2>Search String:</h2>
      <pre>{window.location.search}</pre>
    </div>
  )
}
