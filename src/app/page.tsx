import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <header>
        <h1>Simple Ed</h1>
        <p>Educational Applications</p>
      </header>
      
      <main>
        <div className="apps-grid">
          <div className="app-card">
            <h2>Flash Cards</h2>
            <p>Interactive flashcard learning tool</p>
            <Link href="/flash-card" className="app-link">
              Launch Flash Cards →
            </Link>
          </div>
          
          <div className="app-card">
            <h2>Random Selection</h2>
            <p>Random selection and sampling tools</p>
            <Link href="/random-selection" className="app-link">
              Launch Random Selection →
            </Link>
          </div>
          
          <div className="app-card">
            <h2>Psychometric Analysis</h2>
            <p>Analyze exam reliability with Cronbach's Alpha and item statistics</p>
            <Link href="/psychometric-analysis" className="app-link">
              Launch Psychometric Analysis →
            </Link>
          </div>
        </div>
      </main>
      
      <footer>
        <p>&copy; 2024 Simple Ed</p>
      </footer>
    </div>
  )
}