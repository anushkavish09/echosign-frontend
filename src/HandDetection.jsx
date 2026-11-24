
import { useEffect, useRef, useState } from 'react'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

const API = 'http://127.0.0.1:5000'

function HandDetection({ onPrediction }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const streamRef = useRef(null)
  const landmarkerRef = useRef(null)
  const animationRef = useRef(null)
  const activeRef = useRef(false)

  const lastRequestTime = useRef(0)
  const requestInProgress = useRef(false)
  const onPredictionRef = useRef(onPrediction)

  const [status, setStatus] = useState('Camera is off')
  const [cameraOn, setCameraOn] = useState(false)
  const [loading, setLoading] = useState(false)

  onPredictionRef.current = onPrediction

  const updateStatus = (message) => {
    setStatus(current => current === message ? current : message)
  }

  // Send hand landmarks to Flask backend
  const sendPrediction = async (hands) => {
    if (requestInProgress.current) return

    requestInProgress.current = true

    try {
      const response = await fetch(`${API}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hands })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed')
      }

      if (activeRef.current) {
        onPredictionRef.current?.({
          label: data.label,
          confidence: data.confidence
        })
      }
    } catch (error) {
      console.error('Prediction error:', error)

      if (activeRef.current) {
        updateStatus('Backend prediction failed. Check server.')
        onPredictionRef.current?.(null)
      }
    } finally {
      requestInProgress.current = false
    }
  }

  // Start camera and hand detection
  const startCamera = async () => {
    try {
      setLoading(true)
      updateStatus('Starting camera...')

      if (!landmarkerRef.current) {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )

        const landmarker = await HandLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numHands: 2
          }
        )

        landmarkerRef.current = landmarker
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      })

      streamRef.current = stream

      const video = videoRef.current

      video.srcObject = stream
      await video.play()

      activeRef.current = true

      setCameraOn(true)
      setLoading(false)
      updateStatus('Show your hand to the camera')

      const detect = () => {
        if (!activeRef.current) return

        const canvas = canvasRef.current
        const landmarker = landmarkerRef.current

        if (
          video &&
          canvas &&
          landmarker &&
          video.readyState >= 2
        ) {
          const results = landmarker.detectForVideo(
            video,
            performance.now()
          )

          if (
            canvas.width !== video.videoWidth ||
            canvas.height !== video.videoHeight
          ) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
          }

          const ctx = canvas.getContext('2d')

          ctx.clearRect(0, 0, canvas.width, canvas.height)

          if (results.landmarks.length > 0) {
            updateStatus(
              `${results.landmarks.length} hand(s) detected`
            )

            const hands = results.landmarks.map(hand =>
              hand.map(point => [
                1 - point.x,
                point.y,
                point.z
              ])
            )

            results.landmarks.forEach(landmarks => {
              landmarks.forEach(point => {
                ctx.beginPath()

                ctx.arc(
                  point.x * canvas.width,
                  point.y * canvas.height,
                  5,
                  0,
                  2 * Math.PI
                )

                ctx.fillStyle = '#A2B84B'
                ctx.fill()
              })
            })

            if (
              Date.now() - lastRequestTime.current >= 500 &&
              !requestInProgress.current
            ) {
              lastRequestTime.current = Date.now()
              sendPrediction(hands)
            }
          } else {
            updateStatus('No hand detected')
            onPredictionRef.current?.(null)
          }
        }

        if (activeRef.current) {
          animationRef.current = requestAnimationFrame(detect)
        }
      }

      detect()

    } catch (error) {
      console.error('Camera error:', error)

      activeRef.current = false

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }

      setLoading(false)
      setCameraOn(false)

      updateStatus(
        'Could not start camera. Check camera permission and internet.'
      )
    }
  }

  // Stop camera
  const stopCamera = () => {
    activeRef.current = false

    cancelAnimationFrame(animationRef.current)

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')

      ctx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      )
    }

    setCameraOn(false)
    updateStatus('Camera is off')
    onPredictionRef.current?.(null)
  }

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      activeRef.current = false

      cancelAnimationFrame(animationRef.current)

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      if (landmarkerRef.current) {
        landmarkerRef.current.close()
      }
    }
  }, [])

  const handDetected = status.includes('hand(s) detected')

  return (
    <div className="camera-container">

      {/* CAMERA PREVIEW */}

      <div className={`video-wrapper ${cameraOn ? 'camera-active' : ''}`}>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="camera-feed"
        />

        <canvas
          ref={canvasRef}
          className="landmark-canvas"
        />

        {cameraOn && (
          <div className="camera-live-badge">
            <span className="live-indicator"></span>
            LIVE
          </div>
        )}

        {!cameraOn && (
          <div className="camera-placeholder">
            <div className="camera-placeholder-icon">
              <span>📷</span>
            </div>

            <h3>Camera preview</h3>

            <p>Your hand movements will appear here</p>
          </div>
        )}

        {cameraOn && (
          <div className="camera-frame-label">
            Hand tracking enabled
          </div>
        )}

      </div>

      {/* DETECTION STATUS */}

      <div className={`detection-info ${handDetected ? 'hand-found' : ''}`}>

        <div className="camera-status">

          <span
            className={`status-dot ${handDetected ? 'active' : ''}`}
          ></span>

          <strong>{status}</strong>

        </div>

        <p className="detection-hint">
          {cameraOn
            ? handDetected
              ? 'Great! Keep your hand clearly visible.'
              : status === 'No hand detected'
                ? 'Move your hand into the camera frame.'
                : 'Position your hand in front of the camera.'
            : 'Start the camera to begin real-time hand detection.'}
        </p>

      </div>

      {/* CAMERA CONTROLS */}

      <div className="camera-controls">

        {!cameraOn ? (
          <button
            onClick={startCamera}
            disabled={loading}
            className="camera-start-btn"
          >
            {loading ? '⏳ Starting Camera...' : '📷 Start Camera'}
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="camera-stop-btn"
          >
            Stop Camera
          </button>
        )}

      </div>

    </div>
  )
}

export default HandDetection
