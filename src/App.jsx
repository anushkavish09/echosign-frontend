
import { useState, useEffect, useRef } from 'react'
import HandDetection from './HandDetection'
import QuickCommunication from './QuickCommunication'
import './App.css'

const API = 'http://127.0.0.1:5000'

function App() {
  const [mode, setMode] = useState('home')

  // SIGN LIBRARY STATES
  const [signs, setSigns] = useState([])
  const [selectedSign, setSelectedSign] = useState(null)
  const [samples, setSamples] = useState([])
  const [selectedSample, setSelectedSample] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // SIGN PREDICTION STATE
  const [prediction, setPrediction] = useState(null)
  const [recognizedText, setRecognizedText] = useState('')

  // SPEECH RECOGNITION STATES
  const [transcript, setTranscript] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')

  // LOAD SIGN LIBRARY
  useEffect(() => {
    if (mode !== 'library') return

    const loadSigns = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${API}/library/signs`)

        if (!response.ok) {
          throw new Error('Could not load signs')
        }

        const data = await response.json()
        setSigns(data.signs || data.data || [])
      } catch (err) {
        setError(
          'Backend connect nahi ho raha. Please check Backend server.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadSigns()
  }, [mode])

  // OPEN A SIGN
  const openSign = async (sign) => {
    const name = typeof sign === 'string'
      ? sign
      : sign.name || sign.sign || sign.label

    setSelectedSign(name)
    setSelectedSample(null)
    setSamples([])
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API}/library/signs/${encodeURIComponent(name)}`
      )

      if (!response.ok) {
        throw new Error('Could not load samples')
      }

      const data = await response.json()
      setSamples(data.samples || data.data || [])
    } catch (err) {
      setError('Samples load nahi ho paaye.')
    } finally {
      setLoading(false)
    }
  }

  // OPEN A SAMPLE
  const openSample = async (sample) => {
    const id = sample.sample_id || sample.id

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API}/library/sample/${encodeURIComponent(id)}`
      )

      if (!response.ok) {
        throw new Error('Could not load sample')
      }

      const data = await response.json()
      setSelectedSample(data)
    } catch (err) {
      setError('Sample details load nahi ho paayi.')
    } finally {
      setLoading(false)
    }
  }

  // LIBRARY HELPERS
  const getSignName = (sign) =>
    sign.name || sign.sign || sign.label || 'Unknown'

  const getSampleId = (sample) =>
    sample.sample_id || sample.id || 'Sample'

  const getFeatures = (sample) =>
    sample.features || sample.landmarks || sample.values || []

  // START SPEECH RECOGNITION
  const startRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognition()

    recognition.lang = 'en-IN'
    recognition.continuous = true
    recognition.interimResults = true

    finalTranscriptRef.current = ''
    setTranscript('')

    recognition.onresult = (event) => {
      let interimText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += text + ' '
        } else {
          interimText += text
        }
      }

      setTranscript(finalTranscriptRef.current + interimText)
    }

    recognition.onstart = () => setIsRecording(true)

    recognition.onend = () => setIsRecording(false)

    recognition.onerror = (event) => {
      console.log('Speech recognition error:', event.error)
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  // STOP SPEECH RECOGNITION
  const stopRecording = () => {
    recognitionRef.current?.stop()
  }

  // CLEAR SPEECH TEXT
  const clearText = () => {
    setTranscript('')
    finalTranscriptRef.current = ''
    stopRecording()
  }

  // SPEAK RECOGNIZED SIGN TEXT
  const speakText = () => {
    if (!recognizedText) return

    window.speechSynthesis.cancel()

    const speech = new SpeechSynthesisUtterance(recognizedText)
    window.speechSynthesis.speak(speech)
  }

  // HANDLE SIGN PREDICTION
  const handlePrediction = (result) => {
    setPrediction(result)
    setRecognizedText(result?.label || '')
  }

  // RETURN HOME
  const goHome = () => {
    stopRecording()
    window.speechSynthesis.cancel()

    setMode('home')
    setPrediction(null)
    setRecognizedText('')
  }

  // CLEANUP SPEECH RECOGNITION
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      window.speechSynthesis?.cancel()
    }
  }, [])

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">
        <h2>EchoSign</h2>
        <span>Communication without barriers.</span>
      </header>

      <main className={`main-content ${mode === 'quick' ? 'quick-mode' : ''}`}>

        {/* HOME PAGE */}
        {mode === 'home' ? (
          <>
            <div className="home-intro">
              <span className="home-tag">WELCOME TO ECHOSIGN</span>

              <h1>Every voice deserves to be heard.</h1>

              <p>
                A simple way to connect through speech and sign language.
              </p>
            </div>

            <div className="mode-container">

              {/* QUICK COMMUNICATION */}
              <div className="mode-card">
                <div className="mode-icon">💬</div>

                <span className="mode-label">INSTANT MESSAGES</span>

                <h2>Quick Communication</h2>

                <p>
                  Communicate instantly using ready-made or custom messages.
                </p>

                <button onClick={() => setMode('quick')}>
                  Get Started <span>→</span>
                </button>
              </div>

              {/* SPEECH MODE */}
              <div className="mode-card">
                <div className="mode-icon">🎙️</div>

                <span className="mode-label">VOICE TO SIGN</span>

                <h2>Speech Mode</h2>

                <p>
                  Convert spoken or typed words into sign language.
                </p>

                <button onClick={() => setMode('speech')}>
                  Start Speech Mode <span>→</span>
                </button>
              </div>

              {/* SIGN MODE */}
              <div className="mode-card">
                <div className="mode-icon">🤟</div>

                <span className="mode-label">SIGN TO TEXT</span>

                <h2>Sign Mode</h2>

                <p>
                  Communicate using hand gestures through your camera.
                </p>

                <button
                  onClick={() => {
                    setPrediction(null)
                    setRecognizedText('')
                    setMode('sign')
                  }}
                >
                  Start Sign Mode <span>→</span>
                </button>
              </div>

              {/* SIGN LIBRARY */}
              <div className="mode-card">
                <h2>Sign Library</h2>

                <p>
                  Explore signs, recorded samples and their features.
                </p>

                <button onClick={() => setMode('library')}>
                  Open Sign Library
                </button>
              </div>

            </div>
          </>

        ) : mode === 'quick' ? (

          /* QUICK COMMUNICATION */
          <div className="workspace">
            <button className="back-button" onClick={goHome}>
              ← Back to Home
            </button>

            <QuickCommunication />
          </div>

        ) : mode === 'library' ? (

          /* SIGN LIBRARY */
          <div className="library-page">

            <button className="back-button" onClick={goHome}>
              ← Back to Home
            </button>

            <h1>EchoSign Library</h1>

            <p>Explore recorded signs and their samples.</p>

            {!selectedSign && !selectedSample && (
              <>
                <h2>All Signs</h2>

                {loading && <p>Loading signs...</p>}

                {error && (
                  <p className="library-error">{error}</p>
                )}

                <div className="library-grid">
                  {signs.map((sign, index) => (
                    <div className="library-card" key={index}>
                      <h3>{getSignName(sign)}</h3>

                      <p>
                        Samples: {sign.sample_count ?? sign.count ?? 0}
                      </p>

                      <button onClick={() => openSign(sign)}>
                        View Samples
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {selectedSign && !selectedSample && (
              <>
                <button
                  className="back-button"
                  onClick={() => {
                    setSelectedSign(null)
                    setSamples([])
                    setError('')
                  }}
                >
                  ← Back to All Signs
                </button>

                <h2>{selectedSign} Samples</h2>

                {loading && <p>Loading samples...</p>}

                {error && (
                  <p className="library-error">{error}</p>
                )}

                <div className="library-grid">
                  {samples.map((sample, index) => (
                    <div className="library-card" key={index}>
                      <h3>{getSampleId(sample)}</h3>

                      <p>Recorded sample</p>

                      <button onClick={() => openSample(sample)}>
                        View Features
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {selectedSample && (
              <>
                <button
                  className="back-button"
                  onClick={() => {
                    setSelectedSample(null)
                    setError('')
                  }}
                >
                  ← Back to Samples
                </button>

                <h2>Sample Details</h2>

                <p>
                  Sample ID: {selectedSample.sample_id || selectedSample.id}
                </p>

                <p>
                  Sign: {selectedSample.label || selectedSample.sign}
                </p>

                <p>
                  Source: {selectedSample.source_file || 'CSV'}
                </p>

                <h3>126 Numerical Features</h3>

                <div className="features-grid">
                  {Object.entries(getFeatures(selectedSample)).map(
                    ([key, value]) => (
                      <div className="feature-item" key={key}>
                        <strong>{key}</strong>
                        <span>{String(value)}</span>
                      </div>
                    )
                  )}
                </div>

                {Object.keys(getFeatures(selectedSample)).length === 0 && (
                  <p>No feature data found.</p>
                )}
              </>
            )}

            {/* A-Z FINGERSPELLING */}
            <div className="alphabet-section">
              <h2>A–Z Fingerspelling</h2>

              <p>Learn alphabet signs with pictures.</p>

              <div className="alphabet-grid">
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => (
                  <div className="alphabet-card" key={letter}>
                    <h3>{letter}</h3>

                    <img
                      src={`/signs/alphabet/${letter}/${letter}.jpg`}
                      alt={`Sign language letter ${letter}`}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>

        ) : (

          /* SPEECH MODE AND SIGN MODE */
          <div className={`workspace ${mode}-workspace`}>

            <button className="back-button" onClick={goHome}>
              ← Back to Home
            </button>

            <h1>
              {mode === 'speech' ? 'Speech Mode' : 'Sign Mode'}
            </h1>

            <p>
              {mode === 'speech'
                ? 'Speak or type your message to communicate through signs.'
                : 'Use hand gestures to communicate through text and speech.'}
            </p>

            <div className="workspace-container">

              {/* INPUT CARD */}
              <div
                className={`workspace-card ${
                  mode === 'sign' ? 'camera-card' : 'speech-card'
                }`}
              >

                <h2>
                  {mode === 'speech' ? 'Speech Input' : 'Camera Input'}
                </h2>

                {mode === 'speech' ? (

                  /* SPEECH INPUT */
                  <div className="input-area speech-input-area">

                    <textarea
                      placeholder="Speak or type your message here..."
                      value={transcript}
                      onChange={(e) => {
                        setTranscript(e.target.value)
                        finalTranscriptRef.current = e.target.value
                      }}
                    />

                    <button
                      className={`record-btn ${
                        isRecording ? 'recording' : ''
                      }`}
                      onClick={
                        isRecording ? stopRecording : startRecording
                      }
                    >
                      {isRecording
                        ? 'Stop Recording'
                        : '🎙️ Start Recording'}
                    </button>

                    <button
                      className="clear-text-btn"
                      onClick={clearText}
                    >
                      Clear Text
                    </button>

                  </div>

                ) : (

                  /* CAMERA INPUT */
                  <div className="input-area camera-input-area">
                    <HandDetection onPrediction={handlePrediction} />
                  </div>

                )}

              </div>

              {/* OUTPUT CARD */}
              <div
                className={`workspace-card ${
                  mode === 'sign' ? 'output-card' : 'speech-output-card'
                }`}
              >

                <h2>
                  {mode === 'speech' ? 'Sign Output' : 'Recognized Text'}
                </h2>

                {mode === 'speech' ? (

                  /* SIGN OUTPUT */
                  <div className="input-area speech-output-area">
                    Your sign animation will appear here.
                  </div>

                ) : (

                  /* SIGN RECOGNITION OUTPUT */
                  <div className="input-area output-input-area">

                    <div className="recognized-output">

                      <div className="recognized-message">
                        {recognizedText ||
                          'Your recognized text will appear here.'}
                      </div>

                      {prediction?.label && (
                        <p>
                          Confidence:{' '}
                          {(prediction.confidence * 100).toFixed(1)}%
                        </p>
                      )}

                      <div className="recognized-actions">

                        <button
                          disabled={!recognizedText}
                          onClick={speakText}
                        >
                          🔊 Speak
                        </button>

                        <button
                          disabled={!recognizedText}
                          onClick={() => {
                            setRecognizedText('')
                            setPrediction(null)
                          }}
                        >
                          Clear
                        </button>

                      </div>

                    </div>

                  </div>

                )}

              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default App
