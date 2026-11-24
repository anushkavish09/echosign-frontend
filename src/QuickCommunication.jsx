
import { useState } from 'react'
import './QuickCommunication.css'

function QuickCommunication() {
  const [selectedMessage, setSelectedMessage] = useState('')
  const [customMessage, setCustomMessage] = useState('')

  const phrases = [
    { icon: '🆘', text: 'I need help', category: 'Emergency' },
    { icon: '📞', text: 'Please call my family', category: 'Emergency' },
    { icon: '💧', text: 'I need water', category: 'Basic Needs' },
    { icon: '🩺', text: 'Call a doctor', category: 'Medical' },
    { icon: '❤️', text: 'I am not feeling well', category: 'Medical' },
    { icon: '💊', text: 'I need medicine', category: 'Medical' },
    { icon: '🙏', text: 'Thank you', category: 'General' },
    { icon: '🚻', text: 'I need to use the washroom', category: 'Basic Needs' },
  ]

  const speakMessage = () => {
    if (!selectedMessage) return

    window.speechSynthesis.cancel()

    const speech = new SpeechSynthesisUtterance(selectedMessage)
    speech.lang = 'en-IN'
    speech.rate = 0.9

    window.speechSynthesis.speak(speech)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
  }

  const copyMessage = async () => {
    if (!selectedMessage) return

    try {
      await navigator.clipboard.writeText(selectedMessage)
      alert('Message copied!')
    } catch {
      alert('Unable to copy message.')
    }
  }

  const handleCustomMessage = () => {
    if (customMessage.trim()) {
      setSelectedMessage(customMessage.trim())
    }
  }

  return (
    <div className="quick-page">
      <div className="quick-heading">
        <span className="quick-tag">QUICK COMMUNICATION</span>
        <h1>How can we help you?</h1>
        <p>Select a message to communicate instantly.</p>
      </div>

      <div className="phrase-grid">
        {phrases.map((phrase) => (
          <button
            key={phrase.text}
            className={`phrase-card ${
              phrase.category === 'Emergency' ? 'emergency-card' : ''
            } ${selectedMessage === phrase.text ? 'selected' : ''}`}
            onClick={() => setSelectedMessage(phrase.text)}
          >
            <span className="phrase-icon">{phrase.icon}</span>
            <span className="phrase-category">{phrase.category}</span>
            <span className="phrase-text">{phrase.text}</span>
          </button>
        ))}
      </div>

      <div className="custom-message">
        <h2>Write your own message</h2>

        <div className="custom-input">
          <input
            type="text"
            placeholder="Type your message here..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCustomMessage()
            }}
          />

          <button onClick={handleCustomMessage}>
            Use Message
          </button>
        </div>
      </div>

      <div className="message-output">
        <h2>Your Message</h2>

        <div className="message-display">
          {selectedMessage || 'Your selected message will appear here.'}
        </div>

        <div className="message-actions">
          <button onClick={speakMessage} disabled={!selectedMessage}>
            🔊 Speak
          </button>

          <button onClick={stopSpeaking} disabled={!selectedMessage}>
            ⏹ Stop
          </button>

          <button onClick={copyMessage} disabled={!selectedMessage}>
            📋 Copy
          </button>

          <button
            onClick={() => {
              setSelectedMessage('')
              setCustomMessage('')
              stopSpeaking()
            }}
          >
            ✕ Clear
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuickCommunication
