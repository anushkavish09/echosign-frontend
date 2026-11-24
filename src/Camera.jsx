
import { useEffect, useRef, useState } from 'react'

function Camera() {
  const videoRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let stream

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        setError('Camera access denied or unavailable.')
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className="camera-container">
      {error ? (
        <p>{error}</p>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="camera-feed"
        />
      )}
    </div>
  )
}

export default Camera
