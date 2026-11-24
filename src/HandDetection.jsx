
import { useEffect, useRef, useState } from 'react'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

const API = 'http://127.0.0.1:5000'

function HandDetection({ onPrediction }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
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
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        })

        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })

        if (!active) {
          stream.getTracks().forEach(track => track.stop())
          handLandmarker.close()
          return
        }

        videoRef.current.srcObject = stream

        videoRef.current.onloadeddata = () => {
          if (!active) return

          setStatus('Show your hand to the camera')

          function detect() {
            if (!active) return

            const video = videoRef.current
            const canvas = canvasRef.current

            if (video.readyState >= 2) {
              const results = handLandmarker.detectForVideo(
                video,
                performance.now()
              )

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
          }

          detect()
        }
      } catch (error) {
        console.error(error)
        setStatus('Could not start hand detection. Check camera and internet.')
      }
    }

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

  return (
    <div className="camera-container">
      <div className="video-wrapper">
        <video ref={videoRef} autoPlay playsInline className="camera-feed" />
        <canvas ref={canvasRef} className="landmark-canvas" />
      </div>

      <p>{status}</p>
    </div>
  )
}

export default HandDetection
