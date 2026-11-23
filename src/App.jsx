import HandDetection from './HandDetection'
import { useState } from 'react'
import './App.css'

function App() {
  const [mode, setMode] = useState('home')
  const [recognizedText, setRecognizedText] = useState('')

  return (
    <div className="app">
      <header className="navbar">
        <h2>EchoSign</h2>
        <span>Communication without barriers.</span>
      </header>

      <main className="main-content">
        {mode === 'home' ? (
          <>
            <h1>Every voice deserves to be heard.</h1>
            <p>A simple way to connect through speech and sign language.</p>

            <div className="mode-container">
              <div className="mode-card">
                <h2>Speech Mode</h2>
                <p>Convert spoken words into text and signs.</p>
                <button onClick={() => setMode('speech')}>
                  Start Speech Mode
                </button>
              </div>

              <div className="mode-card">
                <h2>Sign Mode</h2>
                <p>Communicate using hand gestures through your camera.</p>
                <button onClick={() => setMode('sign')}>
                  Start Sign Mode
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="workspace">
            <button onClick={() => setMode('home')}>
              ← Back to Home
            </button>

            <h1>
              {mode === 'speech' ? 'Speech Mode' : 'Sign Mode'}
            </h1>

            <p>
              {mode === 'speech'
                ? 'Speak naturally and communicate through signs.'
                : 'Use hand gestures to communicate through text and speech.'}
            </p>

            <div className="workspace-container">
              <div className="workspace-card">
                <h2>
                  {mode === 'speech' ? 'Speech Input' : 'Camera Input'}
                </h2>

                <div className="input-area">
                  {mode === 'speech'
                    ? 'Your speech input will appear here.'
                    : <HandDetection onRecognize={setRecognizedText} />}
                </div>
              </div>

              <div className="workspace-card">
                <h2>
                  {mode === 'speech' ? 'Sign Output' : 'Recognized Text'}
                </h2>

                <div className="input-area">
                  {recognizedText || 'Your recognized text will appear here.'}
                </div>

                <button onClick={() => setRecognizedText('')}>
                  Clear Text
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App