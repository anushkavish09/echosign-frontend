
import { useEffect, useRef, useState } from 'react'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

const API = 'http://127.0.0.1:5000'

function HandDetection({ onPrediction }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
<<<<<<< HEAD
  const lastRequestTime = useRef(0)
  const requestInProgress = useRef(false)

  const [status, setStatus] = useState('Loading hand detection...')

  useEffect(() => {
    let stream
    let handLandmarker
    let animationId
    let active = true

    async function sendPrediction(hands) {
      if (requestInProgress.current) return

      requestInProgress.current = true

      try {
        const response = await fetch(`${API}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ hands }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Prediction failed')
        }

        if (active) {
          onPrediction?.({
            label: data.label,
            confidence: data.confidence,
          })
        }
      } catch (error) {
        console.error('Prediction error:', error)

        if (active) {
          setStatus('Backend prediction failed. Check server.')
          onPrediction?.(null)
        }
      } finally {
        requestInProgress.current = false
      }
    }

    async function startDetection() {
      try {
=======
  const streamRef = useRef(null)
  const landmarkerRef = useRef(null)
  const animationRef = useRef(null)
  const activeRef = useRef(false)

  const [status, setStatus] = useState('Camera is off')
  const [cameraOn, setCameraOn] = useState(false)
  const [loading, setLoading] = useState(false)

  const updateStatus = (message) => {
    setStatus(current => current === message ? current : message)
  }

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

  const startCamera = async () => {
    try {
      setLoading(true)
      updateStatus('Starting camera...')

      if (!landmarkerRef.current) {
>>>>>>> 417cfd7 (Added Quick Communication feature and updated UI)
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
<<<<<<< HEAD
            delegate: 'GPU',
=======
            delegate: 'GPU'
>>>>>>> 417cfd7 (Added Quick Communication feature and updated UI)
          },
          runningMode: 'VIDEO',
          numHands: 2,
        })

<<<<<<< HEAD
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
=======
        landmarkerRef.current = landmarker
      }
>>>>>>> 417cfd7 (Added Quick Communication feature and updated UI)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      })

      streamRef.current = stream
      activeRef.current = true

<<<<<<< HEAD
        videoRef.current.onloadeddata = () => {
          if (!active) return

          setStatus('Show your hand to the camera')
=======
      videoRef.current.srcObject = stream
>>>>>>> 417cfd7 (Added Quick Communication feature and updated UI)

      await videoRef.current.play()

      setCameraOn(true)
      setLoading(false)
      updateStatus('Show your hand to the camera')

      const detect = () => {
        if (!activeRef.current) return

<<<<<<< HEAD
              const ctx = canvas.getContext('2d')
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight

              ctx.clearRect(0, 0, canvas.width, canvas.height)

              if (results.landmarks.length > 0) {
                setStatus(`${results.landmarks.length} hand(s) detected`)

                const hands = results.landmarks.map(hand =>
                  hand.map(point => [point.x, point.y, point.z])
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
                setStatus('No hand detected')
                onPrediction?.(null)
              }
            }

            animationId = requestAnimationFrame(detect)
=======
        const video = videoRef.current
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
>>>>>>> 417cfd7 (Added Quick Communication feature and updated UI)
          }

          const ctx = canvas.getContext('2d')

          ctx.clearRect(0, 0, canvas.width, canvas.height)

          if (results.landmarks.length > 0) {
            updateStatus(`${results.landmarks.length} hand(s) detected`)

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
                ctx.fillStyle = '#A6C36F'
                ctx.fill()
              })
            })
          } else {
            updateStatus('No hand detected')
          }
        }
<<<<<<< HEAD
      } catch (error) {
        console.error(error)
        setStatus('Could not start hand detection. Check camera and internet.')
=======

        animationRef.current = requestAnimationFrame(detect)
>>>>>>> 417cfd7 (Added Quick Communication feature and updated UI)
      }

      detect()

    } catch (error) {
      console.error(error)

      activeRef.current = false

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      setLoading(false)
      setCameraOn(false)
      updateStatus('Could not start camera. Check camera permission.')
    }
  }

  const stopCamera = () => {
    activeRef.current = false

    cancelAnimationFrame(animationRef.current)

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

<<<<<<< HEAD
    startDetection()

    return () => {
      active = false
      cancelAnimationFrame(animationId)

      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      if (handLandmarker) {
        handLandmarker.close()
      }
    }
  }, [onPrediction])
=======
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
  }

  const handDetected = status.includes('hand(s) detected')
>>>>>>> 417cfd7 (Added Quick Communication feature and updated UI)

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

<<<<<<< HEAD
      <p>{status}</p>
=======
      {/* DETECTION STATUS */}

      <div className={`detection-info ${handDetected ? 'hand-found' : ''}`}>

        <div className="camera-status">

          <span
            className={`status-dot ${
              handDetected ? 'active' : ''
            }`}
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

>>>>>>> 417cfd7 (Added Quick Communication feature and updated UI)
    </div>
  )
}

export default HandDetection
