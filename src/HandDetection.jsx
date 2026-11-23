
import { useEffect, useRef, useState } from 'react'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

function HandDetection({ onRecognize }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const lastLogTime = useRef(0)
  const [status, setStatus] = useState('Loading handdetection...')
   const [prediction, setPrediction] = useState('')
const [confidence, setConfidence] = useState(0)
const [recognizedText, setRecognizedText] = useState('')
  
  useEffect(() => {
    let stream
    let handLandmarker
    let animationId
    let active = true

    async function startDetection() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2
        })

        stream = await navigator.mediaDevices.getUserMedia({
          video: true
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

  if (Date.now() - lastLogTime.current > 1000) {
  fetch('http://127.0.0.1:5000/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ hands })
  })
    .then(response => response.json())
    .then(data => {
  console.log('Prediction:', data)

  if (data.error) {
    console.error(data.error)
    return
  }

  setPrediction(data.label || '')
if (data.label && onRecognize) {
  onRecognize(prev => {
    const newWord = data.label.toUpperCase()

    const words = prev.trim().split(' ')

    if (words[words.length - 1] === newWord) {
      return prev
    }

    return prev ? prev + ' ' + newWord : newWord
  })
}
  setConfidence(data.confidence || 0)
})
    .catch(error => {
      console.error('Prediction error:', error)
    })

  lastLogTime.current = Date.now()
}

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
              } else {
                setStatus('No hand detected')
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
      if (stream) stream.getTracks().forEach(track => track.stop())
      if (handLandmarker) handLandmarker.close()
    }
  }, [])

  return (
    <div className="camera-container">
      <div className="video-wrapper">
        <video ref={videoRef} autoPlay playsInline className="camera-feed" />
        <canvas ref={canvasRef} className="landmark-canvas" />
      </div>
      <p>{status}</p>
      {prediction && (
  <div>
    <h2>Recognized Sign: {prediction}</h2>
    <p>Confidence: {(confidence * 100).toFixed(1)}%</p>
  </div>
)}
    </div>
  )
}

export default HandDetection
