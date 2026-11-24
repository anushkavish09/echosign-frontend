
import HandDetection from './HandDetection'
<<<<<<< HEAD
import { useState, useEffect } from 'react'
=======
import QuickCommunication from './QuickCommunication'
import { useState, useRef } from 'react'
>>>>>>> 417cfd7 (Added Quick Communication feature and updated UI)
import './App.css'

const API = 'http://127.0.0.1:5000'

function App() {
  const [mode, setMode] = useState('home')
<<<<<<< HEAD
  const [signs, setSigns] = useState([])
  const [selectedSign, setSelectedSign] = useState(null)
  const [samples, setSamples] = useState([])
  const [selectedSample, setSelectedSample] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [prediction, setPrediction] = useState(null)

  useEffect(() => {
    if (mode !== 'library') return

    const loadSigns = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${API}/library/signs`)
        if (!response.ok) throw new Error('Could not load signs')

        const data = await response.json()
        setSigns(data.signs || data.data || [])
      } catch (err) {
        setError('Backend connect nahi ho raha. Please check Backend server.')
      } finally {
        setLoading(false)
      }
    }

    loadSigns()
  }, [mode])

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

      if (!response.ok) throw new Error('Could not load samples')

      const data = await response.json()
      setSamples(data.samples || data.data || [])
    } catch (err) {
      setError('Samples load nahi ho paaye.')
    } finally {
      setLoading(false)
    }
  }

  const openSample = async (sample) => {
    const id = sample.sample_id || sample.id

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API}/library/sample/${encodeURIComponent(id)}`
      )

      if (!response.ok) throw new Error('Could not load sample')

      const data = await response.json()
      setSelectedSample(data)
    } catch (err) {
      setError('Sample details load nahi ho paayi.')
    } finally {
      setLoading(false)
    }
  }

  const getSignName = (sign) =>
    sign.name || sign.sign || sign.label || 'Unknown'

  const getSampleId = (sample) =>
    sample.sample_id || sample.id || 'Sample'

  const getFeatures = (sample) =>
    sample.features || sample.landmarks || sample.values || []

  const goHome = () => {
    setMode('home')
    setPrediction(null)
=======
  const [transcript, setTranscript] = useState('')
  const [recognizedText, setRecognizedText] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')

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

  // SPEAK RECOGNIZED TEXT
  const speakText = () => {
    if (!recognizedText) return

    window.speechSynthesis.cancel()

    const speech = new SpeechSynthesisUtterance(recognizedText)
    window.speechSynthesis.speak(speech)
>>>>>>> 417cfd7 (Added Quick Communication feature and updated UI)
  }

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">
        <h2>EchoSign</h2>
        <span>Communication without barriers.</span>
      </header>

      <main className={`main-content ${mode === 'quick' ? 'quick-mode' : ''}`}>

<<<<<<< HEAD
        {mode === 'home' && (
=======
        {/* HOME PAGE */}
        {mode === 'home' ? (
>>>>>>> 417cfd7 (Added Quick Communication feature and updated UI)
          <>
            <div className="home-intro">
              <span className="home-tag">WELCOME TO ECHOSIGN</span>

              <h1>Every voice deserves to be heard.</h1>

              <p>
                A simple way to connect through speech and sign language.
              </p>
            </div>

            <div className="mode-container">

              {/* QUICK COMMUNICATION CARD */}
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

              {/* SPEECH MODE CARD */}
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

              {/* SIGN MODE CARD */}
              <div className="mode-card">
                <div className="mode-icon">🤟</div>

                <span className="mode-label">SIGN TO TEXT</span>

                <h2>Sign Mode</h2>
<<<<<<< HEAD
                <p>Communicate using sign language through your camera.</p>
                <button onClick={() => {
                  setPrediction(null)
                  setMode('sign')
                }}>
                  Start Sign Mode
=======

                <p>
                  Communicate using hand gestures through your camera.
                </p>

                <button onClick={() => setMode('sign')}>
                  Start Sign Mode <span>→</span>
>>>>>>> 417cfd7 (Added Quick Communication feature and updated UI)
                </button>
              </div>

              <div className="mode-card">
                <h2>Sign Library</h2>
                <p>Explore signs, recorded samples and their features.</p>
                <button onClick={() => setMode('library')}>
                  Open Sign Library
                </button>
              </div>

            </div>
          </>
<<<<<<< HEAD
        )}

        {mode === 'library' && (
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
                {error && <p className="library-error">{error}</p>}

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
                <button className="back-button" onClick={() => {
                  setSelectedSign(null)
                  setSamples([])
                  setError('')
                }}>
                  ← Back to All Signs
                </button>

                <h2>{selectedSign} Samples</h2>

                {loading && <p>Loading samples...</p>}
                {error && <p className="library-error">{error}</p>}

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
                <button className="back-button" onClick={() => {
                  setSelectedSample(null)
                  setError('')
                }}>
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

                {getFeatures(selectedSample).length === 0 &&
                  Object.keys(getFeatures(selectedSample)).length === 0 &&
                  <p>No feature data found.</p>
                }
              </>
            )}

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
        )}

        {(mode === 'speech' || mode === 'sign') && (
          <div className="workspace">

            <button onClick={goHome}>
=======

        ) : mode === 'quick' ? (

          /* QUICK COMMUNICATION */
          <div className="workspace">
            <button onClick={() => setMode('home')}>
>>>>>>> 417cfd7 (Added Quick Communication feature and updated UI)
              ← Back to Home
            </button>

            <QuickCommunication />
          </div>

        ) : (

          /* SPEECH MODE AND SIGN MODE */
          <div className={`workspace ${mode}-workspace`}>

            {/* BACK BUTTON */}
            <button
              className="back-button"
              onClick={() => {
                stopRecording()
                setMode('home')
              }}
            >
              ← Back to Home
            </button>

            {/* PAGE HEADING */}
            <h1>
              {mode === 'speech' ? 'Speech Mode' : 'Sign Mode'}
            </h1>

            <p>
              {mode === 'speech'
                ? 'Speak or type your message to communicate through signs.'
                : 'Use hand gestures to communicate through text and speech.'}
            </p>

            {/* TWO COLUMN LAYOUT */}
            <div className="workspace-container">

              {/* FIRST CARD: INPUT */}
              <div className={`workspace-card ${mode === 'sign' ? 'camera-card' : 'speech-card'}`}>

                <h2>
                  {mode === 'speech' ? 'Speech Input' : 'Camera Input'}
                </h2>

<<<<<<< HEAD
                <div className="input-area">
                  {mode === 'speech'
                    ? 'Your speech input will appear here.'
                    : <HandDetection onPrediction={setPrediction} />}
                </div>
=======
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
                      className={`record-btn ${isRecording ? 'recording' : ''}`}
                      onClick={isRecording ? stopRecording : startRecording}
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
                    <HandDetection />
                  </div>

                )}

>>>>>>> 417cfd7 (Added Quick Communication feature and updated UI)
              </div>

              {/* SECOND CARD: OUTPUT */}
              <div className={`workspace-card ${mode === 'sign' ? 'output-card' : 'speech-output-card'}`}>

                <h2>
                  {mode === 'speech' ? 'Sign Output' : 'Recognized Text'}
                </h2>

<<<<<<< HEAD
                <div className="input-area">
                  {mode === 'speech' ? (
                    'Your output will appear here.'
                  ) : prediction?.label ? (
                    <>
                      <h2>{prediction.label}</h2>
                      <p>
                        Confidence: {
                          (prediction.confidence * 100).toFixed(1)
                        }%
                      </p>
                    </>
                  ) : (
                    'Waiting for sign recognition...'
                  )}
                </div>
=======
                {mode === 'speech' ? (

                  /* SIGN OUTPUT */
                  <div className="input-area speech-output-area">
                    Your sign animation will appear here.
                  </div>

                ) : (

                  /* RECOGNIZED TEXT OUTPUT */
                  <div className="input-area output-input-area">

                    <div className="recognized-output">

                      <div className="recognized-message">
                        {recognizedText ||
                          'Your recognized text will appear here.'}
                      </div>

                      <div className="recognized-actions">

                        <button
                          disabled={!recognizedText}
                          onClick={speakText}
                        >
                          🔊 Speak
                        </button>

                        <button
                          disabled={!recognizedText}
                          onClick={() => setRecognizedText('')}
                        >
                          Clear
                        </button>

                      </div>

                    </div>

                  </div>

                )}

>>>>>>> 417cfd7 (Added Quick Communication feature and updated UI)
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default App
