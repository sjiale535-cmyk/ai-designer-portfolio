import { useCallback, useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { assetUrl } from './assetUrl.js'

export default function VisionController({ pointerRef, activePointerRef, onAwakenAt, onDepth, onFieldFreeze }) {
  const videoRef = useRef(null)
  const cursorRef = useRef(null)
  const streamRef = useRef(null)
  const handRef = useRef(null)
  const faceRef = useRef(null)
  const frameRef = useRef(null)
  const lastPointRef = useRef(null)
  const lastTriggerRef = useRef(0)
  const holdAnchorRef = useRef(null)
  const holdStartedRef = useRef(0)
  const holdTriggeredRef = useRef(false)
  const modeRef = useRef('hand')
  const [status, setStatus] = useState('idle')
  const [controlMode, setControlMode] = useState('hand')
  const [signal, setSignal] = useState('等待连接')
  const [error, setError] = useState('')

  useEffect(() => {
    modeRef.current = controlMode
    holdAnchorRef.current = null
    holdStartedRef.current = 0
    holdTriggeredRef.current = false
    cursorRef.current?.style.setProperty('--hold', '0')
  }, [controlMode])

  const stop = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    handRef.current?.close?.()
    faceRef.current?.close?.()
    streamRef.current = null
    handRef.current = null
    faceRef.current = null
    activePointerRef.current = false
    onFieldFreeze(false)
    holdAnchorRef.current = null
    holdStartedRef.current = 0
    holdTriggeredRef.current = false
    setStatus('idle')
    setSignal('等待连接')
  }, [activePointerRef, onFieldFreeze])

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    handRef.current?.close?.()
    faceRef.current?.close?.()
  }, [])

  const moveCursor = useCallback((x, y, source) => {
    const previous = lastPointRef.current || { x, y }
    const smoothed = {
      x: previous.x + (x - previous.x) * 0.38,
      y: previous.y + (y - previous.y) * 0.38,
    }
    pointerRef.current = smoothed
    activePointerRef.current = true
    lastPointRef.current = smoothed
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${smoothed.x}px, ${smoothed.y}px, 0) translate(-50%, -50%)`
      cursorRef.current.dataset.source = source
    }
    return smoothed
  }, [activePointerRef, pointerRef])

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('当前浏览器不支持摄像头访问，请使用最新版 Chrome 或 Edge。')
      setStatus('error')
      return
    }
    setStatus('loading')
    setError('')
    setSignal('加载视觉模型')
    try {
      const vision = await FilesetResolver.forVisionTasks(assetUrl('/oracle-vision/wasm'))
      const [hand, face, stream] = await Promise.all([
        HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: assetUrl('/oracle-vision/hand_landmarker.task'), delegate: 'GPU' },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.55,
          minTrackingConfidence: 0.5,
        }),
        FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: assetUrl('/oracle-vision/face_landmarker.task'), delegate: 'GPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        }),
        navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        }),
      ])
      handRef.current = hand
      faceRef.current = face
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setStatus('active')
      setSignal('正在寻找手势')

      let lastVideoTime = -1
      let lastSignalUpdate = 0
      const updateHold = (point, now, duration = 1100) => {
        const anchor = holdAnchorRef.current
        if (!anchor || Math.hypot(point.x - anchor.x, point.y - anchor.y) > 48) {
          holdAnchorRef.current = point
          holdStartedRef.current = now
          holdTriggeredRef.current = false
          cursorRef.current?.style.setProperty('--hold', '0')
          return 0
        }

        const progress = Math.min(1, (now - holdStartedRef.current) / duration)
        cursorRef.current?.style.setProperty('--hold', String(progress))
        if (progress >= 1 && !holdTriggeredRef.current && now - lastTriggerRef.current > 900) {
          holdTriggeredRef.current = true
          lastTriggerRef.current = now
          onAwakenAt(point.x, point.y)
          cursorRef.current?.classList.add('is-triggered')
          window.setTimeout(() => cursorRef.current?.classList.remove('is-triggered'), 520)
        }
        return progress
      }

      const resetHold = () => {
        holdAnchorRef.current = null
        holdStartedRef.current = 0
        holdTriggeredRef.current = false
        cursorRef.current?.style.setProperty('--hold', '0')
      }

      const detect = () => {
        const video = videoRef.current
        if (!video || !handRef.current || !faceRef.current) return
        const now = performance.now()
        if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime
          const activeMode = modeRef.current
          const handResult = activeMode === 'hand' ? handRef.current.detectForVideo(video, now) : null
          const faceResult = activeMode === 'head' ? faceRef.current.detectForVideo(video, now) : null

          if (activeMode === 'hand' && handResult?.landmarks?.[0]) {
            const marks = handResult.landmarks[0]
            const index = marks[8]
            const thumb = marks[4]
            const wrist = marks[0]
            const middleBase = marks[9]
            const point = moveCursor((1 - index.x) * window.innerWidth, index.y * window.innerHeight, 'hand')
            const pinch = Math.hypot(index.x - thumb.x, index.y - thumb.y, (index.z || 0) - (thumb.z || 0))
            const palmSize = Math.hypot(wrist.x - middleBase.x, wrist.y - middleBase.y)
            const extendedFingers = [[8, 6], [12, 10], [16, 14], [20, 18]].filter(([tip, joint]) => {
              const tipDistance = Math.hypot(marks[tip].x - wrist.x, marks[tip].y - wrist.y)
              const jointDistance = Math.hypot(marks[joint].x - wrist.x, marks[joint].y - wrist.y)
              return tipDistance > jointDistance * 1.16
            }).length
            const openPalm = extendedFingers >= 4 && pinch > 0.075
            onFieldFreeze(openPalm)
            onDepth(Math.max(0.76, Math.min(1.34, 0.72 + palmSize * 4.1)))
            const holdProgress = updateHold(point, now, 1050)
            if (pinch < 0.055 && now - lastTriggerRef.current > 1200) {
              lastTriggerRef.current = now
              holdTriggeredRef.current = true
              onAwakenAt(point.x, point.y)
              cursorRef.current?.classList.add('is-triggered')
              window.setTimeout(() => cursorRef.current?.classList.remove('is-triggered'), 360)
            }
            if (now - lastSignalUpdate > 350) {
              setSignal(openPalm
                ? '掌心展开 · 字海静止'
                : pinch < 0.07
                ? '捏合 · 立即唤醒'
                : holdProgress > 0.08
                  ? `稳定停留 · 识别 ${Math.round(holdProgress * 100)}%`
                  : '指尖移动 · 停留锁定字形')
              lastSignalUpdate = now
            }
          } else if (activeMode === 'head' && faceResult?.faceLandmarks?.[0]) {
            onFieldFreeze(false)
            const marks = faceResult.faceLandmarks[0]
            const nose = marks[1]
            const upperLip = marks[13]
            const lowerLip = marks[14]
            const point = moveCursor((1 - nose.x) * window.innerWidth, nose.y * window.innerHeight, 'head')
            onDepth(Math.max(0.74, Math.min(1.34, 1.52 - nose.y)))
            const mouthOpen = Math.abs(lowerLip.y - upperLip.y) > 0.038
            const holdProgress = updateHold(point, now, 1500)
            if (mouthOpen && now - lastTriggerRef.current > 1800) {
              lastTriggerRef.current = now
              holdTriggeredRef.current = true
              onAwakenAt(point.x, point.y)
              cursorRef.current?.classList.add('is-triggered')
              window.setTimeout(() => cursorRef.current?.classList.remove('is-triggered'), 360)
            }
            if (now - lastSignalUpdate > 350) {
              setSignal(mouthOpen ? '张口 · 立即唤醒' : `视线停留 · 识别 ${Math.round(holdProgress * 100)}%`)
              lastSignalUpdate = now
            }
          } else if (now - lastSignalUpdate > 600) {
            activePointerRef.current = false
            onFieldFreeze(false)
            resetHold()
            setSignal(activeMode === 'hand' ? '请将手掌移入画面' : '请正对摄像头')
            lastSignalUpdate = now
          }
        }
        frameRef.current = requestAnimationFrame(detect)
      }
      frameRef.current = requestAnimationFrame(detect)
    } catch (reason) {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      const denied = reason?.name === 'NotAllowedError'
      setError(denied ? '摄像头权限未开启。你可以在浏览器地址栏中重新允许访问。' : '视觉模型启动失败，请刷新页面后重试。')
      setStatus('error')
    }
  }

  return (
    <section className={`oracle-vision oracle-vision--${status}`} aria-label="摄像头体感控制">
      <div ref={cursorRef} className="oracle-vision-cursor" aria-hidden="true"><i /><span /></div>
      <div className="oracle-vision__topline">
        <span><i /> 体感接口</span>
        {status === 'active' && <button onClick={stop}>关闭镜头</button>}
      </div>
      <div className="oracle-vision__screen">
        <video ref={videoRef} muted playsInline aria-label="摄像头实时画面" />
        <div className="oracle-vision__scan" aria-hidden="true" />
        {status !== 'active' && (
          <div className="oracle-vision__placeholder">
            <svg className="oracle-sensor-mark" viewBox="0 0 120 120" aria-hidden="true">
              <circle className="oracle-sensor-mark__orbit" cx="60" cy="60" r="43" />
              <circle className="oracle-sensor-mark__orbit oracle-sensor-mark__orbit--inner" cx="60" cy="60" r="29" />
              <path className="oracle-sensor-mark__bracket" d="M28 44V29h16M76 29h16v15M92 76v15H76M44 91H28V76" />
              <path className="oracle-sensor-mark__eye" d="M35 60Q60 39 85 60Q60 81 35 60Z" />
              <circle className="oracle-sensor-mark__iris" cx="60" cy="60" r="9" />
              <path className="oracle-sensor-mark__trace" d="M18 60H30M90 60h12M60 18v12M60 90v12" />
            </svg>
            <span>{status === 'loading' ? '正在建立感知场…' : 'GESTURE FIELD OFFLINE'}</span>
          </div>
        )}
        {status === 'active' && <div className="oracle-vision__reticle" aria-hidden="true"><i /><i /><i /><i /></div>}
      </div>
      {status === 'idle' && (
        <>
          <p>开启后，画面仅在本机用于实时识别，不会上传或保存。</p>
          <button className="oracle-vision__start" onClick={start}>开启摄像头 <span>↗</span></button>
        </>
      )}
      {status === 'loading' && <p className="oracle-vision__status"><i /> {signal}</p>}
      {status === 'error' && (
        <>
          <p className="oracle-vision__error">{error}</p>
          <button className="oracle-vision__start" onClick={start}>重新连接 <span>↗</span></button>
        </>
      )}
      {status === 'active' && (
        <>
          <div className="oracle-vision__modes">
            <button className={controlMode === 'hand' ? 'is-active' : ''} onClick={() => setControlMode('hand')}><b>手</b><span>张掌静止字海<br />捏合快速确认</span></button>
            <button className={controlMode === 'head' ? 'is-active' : ''} onClick={() => setControlMode('head')}><b>首</b><span>视线停留<br />张口快速确认</span></button>
          </div>
          <p className="oracle-vision__status"><i /> {signal}</p>
        </>
      )}
    </section>
  )
}
